#!/usr/bin/env node

/**
 * The writing desk: a local editor for the posts, with the real page live
 * beside it. Run: npm run write
 *
 * It is one small server that does two things on one port:
 *  - serves the desk at /__write/ and a tiny API that reads and writes
 *    app/posts/[slug]/page.mdx, and nothing else
 *  - passes everything else through to `next dev` (starting one if none is
 *    running), so the page in the preview is the real site with Fast Refresh,
 *    on the same origin as the desk
 *
 * Nothing here is part of the site: no route, no bundle, nothing deployed.
 * It listens on the loopback addresses only (127.0.0.1 and ::1).
 */

import { spawn, execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, watch } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, parseThemes } from '../../lib/manual-data.mjs';
import { extractMetadataBlock, isDraft, matchQuoted, matchQuotedProp } from '../../lib/mdx-parsing.mjs';
import { checkPost } from '../validate-posts.mjs';
import { countWords } from './house-style.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PREFIX = '/__write';
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const hashOf = (text) => createHash('sha1').update(text).digest('hex');

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readBody(req, limit = 2_000_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}

function run(command, args, { cwd, input, timeout = 15_000 } = {}) {
  return new Promise((done) => {
    const child = execFile(command, args, { cwd, timeout, maxBuffer: 8_000_000 }, (error, stdout, stderr) =>
      done({ ok: !error, stdout, stderr, error })
    );
    if (input !== undefined) child.stdin.end(input);
  });
}

/**
 * Builds the desk's server. `nextUrl` is where `next dev` is listening;
 * `claude` is the command for Ask Claude (null turns it off). Returns the
 * http.Server, not yet listening.
 */
export function createDesk({ repo = REPO, postsDir = join(repo, 'app', 'posts'), nextUrl, claude = 'claude' } = {}) {
  const next = nextUrl ? new URL(nextUrl) : null;
  const streams = new Set();
  /** Hashes this server wrote, so its own saves aren't reported back as outside changes. */
  const ours = new Map();
  let claudeWorks = null;

  const fileFor = (slug) => join(postsDir, slug, 'page.mdx');

  async function slugs() {
    const entries = await readdir(postsDir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory() && SLUG.test(e.name) && existsSync(fileFor(e.name))).map((e) => e.name).sort();
  }

  async function problems(slug, content) {
    try {
      return (await checkPost(slug, content, await slugs())).errors;
    } catch (error) {
      return [`the validator fell over: ${error.message}`];
    }
  }

  /** The post as last committed, or null (new file, or no git). */
  async function committed(slug) {
    const rel = ['app', 'posts', slug, 'page.mdx'].join('/');
    const out = await run('git', ['show', `HEAD:${rel}`], { cwd: repo });
    return out.ok ? out.stdout : null;
  }

  async function listEntries() {
    const all = await Promise.all(
      (await slugs()).map(async (slug) => {
        const content = await readFile(fileFor(slug), 'utf-8');
        const block = extractMetadataBlock(content) ?? '';
        const theme = (parseThemes(block) ?? [])[0];
        return {
          slug,
          title: matchQuotedProp(content, 'PostHeader', 'title') ?? matchQuoted(block, 'title') ?? slug,
          date: block.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1] ?? null,
          draft: isDraft(content),
          words: countWords(content),
          chapter: THEMES.find((t) => t.id === theme)?.name ?? null,
        };
      })
    );
    return all.sort((a, b) => Number(b.draft) - Number(a.draft) || (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title));
  }

  async function askClaude({ passage, instruction, content }) {
    const prompt = [
      'You are helping Ben edit one passage of a post on his blog. The tone of voice guide in CLAUDE.md applies in full: UK English, direct, no sentences starting with And, But or Because, nothing that reads as machine-written.',
      'Rewrite ONLY the passage, following the instruction. Keep his meaning, his facts and his voice; do not add claims, examples or flourishes that are not already there. Keep any MDX or markdown markup that is in the passage.',
      'Change as little as the instruction needs. If the passage already does what is asked, return it unchanged.',
      'Reply with the rewritten passage and nothing else: no preamble, no quotes around it, no explanation.',
      '',
      `<instruction>\n${instruction}\n</instruction>`,
      '',
      `<passage>\n${passage}\n</passage>`,
      '',
      `<whole_post_for_context>\n${content}\n</whole_post_for_context>`,
    ].join('\n');
    const out = await run(claude, ['-p', '--tools', ''], { cwd: repo, input: prompt, timeout: 120_000 });
    if (!out.ok) {
      const detail = (out.stderr || out.stdout || out.error?.message || '').trim().split('\n').slice(-3).join(' ');
      return { error: out.error?.code === 'ENOENT' ? 'The claude command isn’t installed on this machine.' : `Claude didn’t answer. ${detail}`.trim() };
    }
    return { text: out.stdout.trim() };
  }

  async function api(req, res, path) {
    const mutating = req.method !== 'GET';
    if (mutating) {
      // A page on another site must not be able to write files through this server.
      const origin = req.headers.origin;
      if (!origin || new URL(origin).host !== req.headers.host || !/application\/json/.test(req.headers['content-type'] ?? '')) {
        return json(res, 403, { error: 'forbidden' });
      }
    }

    if (path === '/entries' && req.method === 'GET') return json(res, 200, { entries: await listEntries() });

    if (path === '/status' && req.method === 'GET') {
      if (claudeWorks === null) claudeWorks = claude ? (await run(claude, ['--version'], { timeout: 8000 })).ok : false;
      return json(res, 200, { claude: claudeWorks });
    }

    if (path === '/events' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write(': hello\n\n');
      streams.add(res);
      req.on('close', () => streams.delete(res));
      return;
    }

    if (path === '/ask' && req.method === 'POST') {
      const body = await readBody(req);
      if (typeof body.passage !== 'string' || typeof body.instruction !== 'string' || !body.passage.trim()) return json(res, 400, { error: 'nothing to rewrite' });
      return json(res, 200, await askClaude({ passage: body.passage, instruction: body.instruction, content: String(body.content ?? '') }));
    }

    const entry = path.match(/^\/entry\/([^/]+)$/);
    if (entry) {
      const slug = entry[1];
      // Only ever a page.mdx directly inside an existing post folder.
      if (!SLUG.test(slug) || !(await slugs()).includes(slug)) return json(res, 404, { error: 'no such entry' });
      const file = fileFor(slug);
      if (!resolve(file).startsWith(resolve(postsDir) + sep)) return json(res, 404, { error: 'no such entry' });

      if (req.method === 'GET') {
        const content = await readFile(file, 'utf-8');
        return json(res, 200, { slug, content, hash: hashOf(content), problems: await problems(slug, content), committed: await committed(slug) });
      }

      if (req.method === 'PUT') {
        const body = await readBody(req);
        if (typeof body.content !== 'string') return json(res, 400, { error: 'no content' });
        const onDisk = await readFile(file, 'utf-8');
        // Someone else (an editor, git, Claude Code) changed the file since the desk read it.
        if (!body.force && body.baseHash !== hashOf(onDisk)) return json(res, 409, { content: onDisk, hash: hashOf(onDisk) });
        const hash = hashOf(body.content);
        if (body.content !== onDisk) {
          ours.set(slug, hash);
          await writeFile(file, body.content, 'utf-8');
        }
        return json(res, 200, { hash, problems: await problems(slug, body.content) });
      }
    }

    return json(res, 404, { error: 'not found' });
  }

  /** The desk's own files, plus the two shared modules they import. */
  async function asset(res, path) {
    const allowed = [join(repo, 'scripts', 'write') + sep, join(repo, 'lib', 'mdx-parsing.mjs')];
    const file = path === '/' || path === '' ? join(repo, 'scripts', 'write', 'ui', 'index.html') : resolve(repo, '.' + path.replace(/^\/src/, ''));
    if (!allowed.some((root) => file === root || file.startsWith(root)) || !TYPES[extname(file)]) {
      res.writeHead(404).end('Not found');
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': `${TYPES[extname(file)]}; charset=utf-8`, 'cache-control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  }

  function proxy(req, res) {
    if (!next) {
      res.writeHead(502).end('No site to show.');
      return;
    }
    const upstream = http.request(
      { host: next.hostname, port: next.port, path: req.url, method: req.method, headers: req.headers },
      (answer) => {
        res.writeHead(answer.statusCode ?? 502, answer.headers);
        answer.pipe(res);
      }
    );
    upstream.on('error', () => {
      if (res.headersSent) return res.destroy();
      res.writeHead(502, { 'content-type': 'text/html; charset=utf-8' });
      res.end('<meta http-equiv="refresh" content="2"><body style="font:16px system-ui;padding:48px;background:#F6F5F0;color:#0E0F12">Waiting for the site to start…</body>');
    });
    req.pipe(upstream);
  }

  const server = http.createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    try {
      if (path === PREFIX) {
        res.writeHead(302, { location: `${PREFIX}/` }).end();
      } else if (path.startsWith(`${PREFIX}/api/`)) {
        await api(req, res, path.slice(`${PREFIX}/api`.length));
      } else if (path.startsWith(`${PREFIX}/`)) {
        await asset(res, path.slice(PREFIX.length));
      } else {
        proxy(req, res);
      }
    } catch (error) {
      if (!res.headersSent) json(res, 500, { error: error.message });
      else res.destroy();
    }
  });

  // Fast Refresh talks over a websocket; pass the upgrade straight through.
  server.on('upgrade', (req, socket, head) => {
    if (!next) return socket.destroy();
    const upstream = net.connect(Number(next.port), next.hostname, () => {
      const lines = [`${req.method} ${req.url} HTTP/1.1`];
      for (let i = 0; i < req.rawHeaders.length; i += 2) lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
      upstream.write(lines.join('\r\n') + '\r\n\r\n');
      if (head.length) upstream.write(head);
      socket.pipe(upstream).pipe(socket);
    });
    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
  });

  // Tell the desk when a post changes on disk and it wasn't us.
  let watcher = null;
  const pending = new Map();
  try {
    watcher = watch(postsDir, { recursive: true }, (_, name) => {
      if (!name) return;
      const parts = String(name).split(/[\\/]/);
      if (parts.length !== 2 || parts[1] !== 'page.mdx' || !SLUG.test(parts[0])) return;
      const slug = parts[0];
      clearTimeout(pending.get(slug));
      pending.set(
        slug,
        setTimeout(async () => {
          pending.delete(slug);
          let hash;
          try {
            hash = hashOf(await readFile(fileFor(slug), 'utf-8'));
          } catch {
            return;
          }
          if (ours.get(slug) === hash) return;
          for (const stream of streams) stream.write(`data: ${JSON.stringify({ slug, hash })}\n\n`);
        }, 120)
      );
    });
  } catch {
    // No recursive watch on this platform: the desk still catches outside edits when it saves.
  }
  server.on('close', () => {
    watcher?.close();
    for (const stream of streams) stream.end();
  });

  return server;
}

/** True when a Next dev server for this site answers at `url`. */
async function isNext(url) {
  try {
    const res = await fetch(new URL('/posts', url), { signal: AbortSignal.timeout(20_000) });
    return res.ok && /next\.js/i.test(res.headers.get('x-powered-by') ?? '');
  } catch {
    return false;
  }
}

function portFree(port) {
  return new Promise((done) => {
    const probe = net.createServer().once('error', () => done(false)).once('listening', () => probe.close(() => done(true)));
    probe.listen(port);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  const port = Number(flag('--port') ?? process.env.WRITE_PORT ?? 4321);
  let nextUrl = flag('--next') ?? process.env.WRITE_NEXT_URL;
  let child = null;

  if (!nextUrl && !(await portFree(3000)) && (await isNext('http://127.0.0.1:3000'))) {
    nextUrl = 'http://127.0.0.1:3000';
    console.log('  Using the dev server already running on port 3000.');
  }

  if (!nextUrl) {
    let nextPort = 3000;
    while (!(await portFree(nextPort))) nextPort++;
    nextUrl = `http://127.0.0.1:${nextPort}`;
    console.log(`  Starting the site (next dev) on port ${nextPort}…`);
    child = spawn(process.execPath, [join(REPO, 'node_modules', 'next', 'dist', 'bin', 'next'), 'dev', '--turbopack', '-p', String(nextPort)], {
      cwd: REPO,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    const echo = (chunk) => {
      for (const line of String(chunk).split('\n')) if (line.trim()) console.log(`  site │ ${line}`);
    };
    child.stdout.on('data', echo);
    child.stderr.on('data', echo);
    child.on('exit', (code) => {
      console.log(`  The site stopped (exit ${code}).`);
      process.exit(code ?? 1);
    });
  }

  const server = createDesk({ nextUrl, claude: process.env.WRITE_CLAUDE ?? 'claude' });
  server.on('error', (error) => {
    console.error(error.code === 'EADDRINUSE' ? `  Port ${port} is taken. Is the desk already running? Try: npm run write -- --port 4322` : error);
    child?.kill();
    process.exit(1);
  });
  // `localhost` is ::1 first on some machines (Safari on macOS among them), so
  // answer on the IPv6 loopback too. It hands everything to the same server.
  const v6 = http.createServer((req, res) => server.emit('request', req, res));
  v6.on('upgrade', (req, socket, head) => server.emit('upgrade', req, socket, head));
  v6.on('error', () => {}); // no IPv6 here, or the port is taken there: IPv4 still works
  v6.listen(port, '::1');
  server.listen(port, '127.0.0.1', () => {
    const url = `http://localhost:${port}${PREFIX}/`;
    console.log(`\n  The writing desk is at ${url}\n  Ctrl+C to stop.\n`);
    if (!args.includes('--no-open')) {
      const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      spawn(opener, [url], { stdio: 'ignore', shell: process.platform === 'win32', detached: true }).on('error', () => {}).unref();
    }
  });

  const stop = () => {
    child?.kill();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
