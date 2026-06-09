#!/usr/bin/env node

/**
 * Validates that all blog posts have required SEO metadata.
 * Run: npm run validate-posts
 */

import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const POSTS_DIR = new URL('../app/posts', import.meta.url).pathname;
const PUBLIC_DIR = new URL('../public', import.meta.url).pathname;
const SITE_ORIGIN = 'https://www.benstewart.ai';

let errors = 0;

function fail(slug, message) {
  console.error(`  FAIL  ${slug}: ${message}`);
  errors++;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve a URL or absolute site URL to a path under /public.
 * Returns null if the URL is external (not on this site).
 */
function resolvePublicPath(url) {
  let pathPart = url;
  if (pathPart.startsWith(SITE_ORIGIN)) {
    pathPart = pathPart.slice(SITE_ORIGIN.length);
  } else if (/^https?:\/\//.test(pathPart)) {
    return null;
  }
  if (!pathPart.startsWith('/')) pathPart = '/' + pathPart;
  return join(PUBLIC_DIR, pathPart);
}

/**
 * Extract all OG image URLs from the images: [...] array in openGraph.
 */
function extractOgImageUrls(metaBlock) {
  const imagesMatch = metaBlock.match(/images\s*:\s*\[([\s\S]*?)\]/);
  if (!imagesMatch) return [];
  const inner = imagesMatch[1];
  const urls = [];
  const urlRegex = /url\s*:\s*["']([^"']+)["']/g;
  let m;
  while ((m = urlRegex.exec(inner)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

/**
 * Extract the metadata block using brace-depth counting.
 * Returns the content between `export const metadata = {` and the matching `};`.
 */
function extractMetadataBlock(content) {
  const start = content.indexOf('export const metadata');
  if (start === -1) return null;

  const braceStart = content.indexOf('{', start);
  if (braceStart === -1) return null;

  let depth = 0;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth === 0) return content.slice(braceStart, i + 1);
  }
  return null;
}

/**
 * Extract a value from a simple key: "value" or key: 'value' pattern.
 */
function extractStringValue(block, key) {
  // Try double quotes first, then single quotes (handles apostrophes in titles)
  const dq = new RegExp(`\\b${key}\\s*:\\s*"([^"]+)"`);
  const sq = new RegExp(`\\b${key}\\s*:\\s*'([^']+)'`);
  const match = block.match(dq) || block.match(sq);
  return match ? match[1] : null;
}

/**
 * Extract a prop value from <PostSchema prop="value" />.
 */
function extractPropValue(content, prop) {
  const pattern = new RegExp(`<PostSchema[^>]*\\b${prop}\\s*=\\s*"([^"]+)"`);
  const match = content.match(pattern);
  return match ? match[1] : null;
}

const entries = await readdir(POSTS_DIR, { withFileTypes: true });
const postDirs = entries
  .filter((e) => e.isDirectory())
  .filter((e) => !e.name.includes('..') && !e.name.startsWith('.'))
  .map((e) => e.name)
  .sort();

for (const slug of postDirs) {
  const filePath = join(POSTS_DIR, slug, 'page.mdx');
  let content;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch {
    fail(slug, 'page.mdx not found');
    continue;
  }

  const postErrors = [];
  const metaBlock = extractMetadataBlock(content);

  if (!metaBlock) {
    fail(slug, 'no metadata export found');
    continue;
  }

  // Check required top-level fields
  for (const field of ['title', 'date', 'description']) {
    if (!new RegExp(`\\b${field}\\s*:`).test(metaBlock)) {
      postErrors.push(`missing metadata.${field}`);
    }
  }

  // Check alternates.canonical
  if (!metaBlock.includes('alternates') || !metaBlock.includes('canonical')) {
    postErrors.push('missing alternates.canonical');
  }

  // Check openGraph and its required contents
  let ogImageUrls = [];
  if (!metaBlock.includes('openGraph')) {
    postErrors.push('missing openGraph');
  } else {
    if (!metaBlock.includes('images')) {
      postErrors.push('missing openGraph.images');
    } else {
      ogImageUrls = extractOgImageUrls(metaBlock);
      for (const url of ogImageUrls) {
        const publicPath = resolvePublicPath(url);
        if (publicPath && !(await fileExists(publicPath))) {
          postErrors.push(`openGraph image file missing on disk: ${url}`);
        }
      }
    }
  }

  // Check PostSchema component exists in the body (after metadata block)
  const bodyContent = content.slice(content.indexOf('};') + 2);
  if (!bodyContent.includes('<PostSchema')) {
    postErrors.push('missing <PostSchema> component');
  } else {
    // Check PostSchema props match metadata values
    const metaTitle = extractStringValue(metaBlock, 'title');
    const schemaTitle = extractPropValue(content, 'title');
    if (metaTitle && schemaTitle && metaTitle !== schemaTitle) {
      postErrors.push(`PostSchema title "${schemaTitle}" does not match metadata title "${metaTitle}"`);
    }

    const metaDate = extractStringValue(metaBlock, 'date');
    const schemaDate = extractPropValue(content, 'date');
    if (metaDate && schemaDate && metaDate !== schemaDate) {
      postErrors.push(`PostSchema date "${schemaDate}" does not match metadata date "${metaDate}"`);
    }

    const schemaSlug = extractPropValue(content, 'slug');
    if (schemaSlug && schemaSlug !== slug) {
      postErrors.push(`PostSchema slug "${schemaSlug}" does not match directory "${slug}"`);
    }

    // If the post has OG images, require PostSchema to pass an image prop too,
    // so JSON-LD includes it.
    const schemaImage = extractPropValue(content, 'image');
    if (ogImageUrls.length > 0 && !schemaImage) {
      postErrors.push('missing <PostSchema image="..."> prop (required when openGraph.images is set)');
    }
    if (schemaImage) {
      const publicPath = resolvePublicPath(schemaImage);
      if (publicPath && !(await fileExists(publicPath))) {
        postErrors.push(`PostSchema image file missing on disk: ${schemaImage}`);
      }
    }
  }

  // Check PostNav component exists and points at this post.
  // The posts listing and prev/next navigation are generated from the
  // filesystem (lib/posts.ts), so each post only needs its own PostNav.
  const navSlugMatch = content.match(/<PostNav[^>]*\bslug\s*=\s*"([^"]+)"/);
  if (!navSlugMatch) {
    postErrors.push('missing <PostNav> component');
  } else {
    if (navSlugMatch[1] !== slug) {
      postErrors.push(`PostNav slug "${navSlugMatch[1]}" does not match directory "${slug}"`);
    }
    const relatedMatch = content.match(/<PostNav[^>]*\brelated\s*=\s*\{\[([^\]]*)\]\}/);
    if (relatedMatch) {
      const relatedSlugs = [...relatedMatch[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
      for (const relatedSlug of relatedSlugs) {
        if (!postDirs.includes(relatedSlug)) {
          postErrors.push(`PostNav related slug "${relatedSlug}" has no matching post directory`);
        }
        if (relatedSlug === slug) {
          postErrors.push('PostNav related slugs must not include the post itself');
        }
      }
    }
  }

  if (postErrors.length > 0) {
    for (const err of postErrors) {
      fail(slug, err);
    }
  } else {
    console.log(`  OK    ${slug}`);
  }
}

console.log(`\n${postDirs.length} posts checked, ${errors} error(s)`);

if (errors > 0) {
  process.exit(1);
}
