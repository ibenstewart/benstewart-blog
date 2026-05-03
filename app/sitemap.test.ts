import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sitemap, { getPostsWithDates } from './sitemap';

const SITE_URL = 'https://www.benstewart.ai';

async function setupPostsDir() {
  const root = await mkdtemp(join(tmpdir(), 'sitemap-test-'));
  const postsDir = join(root, 'app', 'posts');
  await mkdir(postsDir, { recursive: true });
  return { root, postsDir };
}

async function writePost(
  postsDir: string,
  slug: string,
  body: string,
) {
  const dir = join(postsDir, slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'page.mdx'), body, 'utf-8');
}

describe('getPostsWithDates', () => {
  let postsDir: string;
  let root: string;

  beforeEach(async () => {
    ({ root, postsDir } = await setupPostsDir());
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('discovers every post directory containing a page.mdx', async () => {
    await writePost(postsDir, 'alpha', `export const metadata = { date: "2024-01-01" };`);
    await writePost(postsDir, 'beta', `export const metadata = { date: "2024-02-02" };`);
    await writePost(postsDir, 'gamma', `export const metadata = { date: "2024-03-03" };`);

    const result = await getPostsWithDates(postsDir);
    const slugs = result.map((p) => p.slug).sort();

    expect(slugs).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('extracts the date from metadata', async () => {
    await writePost(
      postsDir,
      'a-post',
      `export const metadata = {\n  title: "X",\n  date: "2024-05-12",\n};`,
    );

    const [post] = await getPostsWithDates(postsDir);
    expect(post.slug).toBe('a-post');
    expect(post.date).toBe('2024-05-12');
    expect(post.lastModified).toBeNull();
  });

  it('extracts both date and lastModified when present', async () => {
    await writePost(
      postsDir,
      'updated',
      `export const metadata = {\n  date: "2024-01-01",\n  lastModified: "2024-06-15",\n};`,
    );

    const [post] = await getPostsWithDates(postsDir);
    expect(post.date).toBe('2024-01-01');
    expect(post.lastModified).toBe('2024-06-15');
  });

  it('returns null dates when metadata has no date fields', async () => {
    await writePost(postsDir, 'undated', `# A post with no metadata`);

    const [post] = await getPostsWithDates(postsDir);
    expect(post.date).toBeNull();
    expect(post.lastModified).toBeNull();
  });

  it('supports both single and double quoted date values', async () => {
    await writePost(postsDir, 'sq', `export const metadata = { date: '2024-07-04' };`);
    await writePost(postsDir, 'dq', `export const metadata = { date: "2024-08-08" };`);

    const result = await getPostsWithDates(postsDir);
    const byslug = Object.fromEntries(result.map((p) => [p.slug, p]));
    expect(byslug.sq.date).toBe('2024-07-04');
    expect(byslug.dq.date).toBe('2024-08-08');
  });

  it('skips files that are not page.mdx', async () => {
    const dir = join(postsDir, 'a-post');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'page.mdx'), `export const metadata = { date: "2024-01-01" };`);
    await writeFile(join(dir, 'notes.mdx'), `export const metadata = { date: "1999-12-31" };`);

    const result = await getPostsWithDates(postsDir);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2024-01-01');
  });

  // The current implementation uses a regex over the whole file. Any literal
  // `date: "YYYY-MM-DD"` in the body — code blocks, prose examples, JSX props —
  // will be picked up as the post's date. This test locks in that behaviour
  // so we notice if/when it changes.
  it('matches the FIRST date-like literal in the file (known limitation)', async () => {
    await writePost(
      postsDir,
      'codeblock-trap',
      [
        '```mdx',
        'export const metadata = {',
        '  date: "1999-12-31",',
        '};',
        '```',
        '',
        'export const metadata = {',
        '  date: "2024-10-10",',
        '};',
      ].join('\n'),
    );

    const [post] = await getPostsWithDates(postsDir);
    // Today's regex hits the code-block date first. If this assertion ever
    // fails, the regex was tightened — update the test and celebrate.
    expect(post.date).toBe('1999-12-31');
  });
});

describe('sitemap default export', () => {
  let postsDir: string;
  let root: string;
  let cwdSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    ({ root, postsDir } = await setupPostsDir());
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
  });

  afterEach(async () => {
    cwdSpy.mockRestore();
    await rm(root, { recursive: true, force: true });
  });

  it('always includes the static top-level routes', async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(`${SITE_URL}`);
    expect(urls).toContain(`${SITE_URL}/posts`);
    expect(urls).toContain(`${SITE_URL}/bio`);
    expect(urls).toContain(`${SITE_URL}/speaking`);
  });

  it('emits one entry per discovered post under SITE_URL/posts/<slug>', async () => {
    await writePost(postsDir, 'one', `export const metadata = { date: "2024-01-01" };`);
    await writePost(postsDir, 'two', `export const metadata = { date: "2024-02-02" };`);

    const entries = await sitemap();
    const postUrls = entries
      .map((e) => e.url)
      .filter((u) => u.startsWith(`${SITE_URL}/posts/`));

    expect(postUrls.sort()).toEqual([
      `${SITE_URL}/posts/one`,
      `${SITE_URL}/posts/two`,
    ]);
  });

  it('uses lastModified for freshness in preference to date', async () => {
    await writePost(
      postsDir,
      'updated',
      `export const metadata = {\n  date: "2024-01-01",\n  lastModified: "2024-09-09",\n};`,
    );

    const entries = await sitemap();
    const entry = entries.find((e) => e.url === `${SITE_URL}/posts/updated`);
    expect(entry).toBeDefined();
    expect(entry!.lastModified).toBe(new Date('2024-09-09').toISOString());
  });

  it('uses date when lastModified is absent', async () => {
    await writePost(
      postsDir,
      'classic',
      `export const metadata = { date: "2024-04-04" };`,
    );

    const entries = await sitemap();
    const entry = entries.find((e) => e.url === `${SITE_URL}/posts/classic`);
    expect(entry!.lastModified).toBe(new Date('2024-04-04').toISOString());
  });

  it('falls back to a valid ISO timestamp when neither date nor lastModified is present', async () => {
    await writePost(postsDir, 'undated', `# nothing here`);

    const entries = await sitemap();
    const entry = entries.find((e) => e.url === `${SITE_URL}/posts/undated`);
    expect(entry).toBeDefined();
    // Should be a parseable ISO string (i.e. didn't blow up on a null date).
    expect(() => new Date(entry!.lastModified as string).toISOString()).not.toThrow();
    expect(Number.isNaN(new Date(entry!.lastModified as string).getTime())).toBe(false);
  });
});
