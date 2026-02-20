#!/usr/bin/env node

/**
 * Validates that all blog posts have required SEO metadata.
 * Run: npm run validate-posts
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const POSTS_DIR = new URL('../app/posts', import.meta.url).pathname;

let errors = 0;

function fail(slug, message) {
  console.error(`  FAIL  ${slug}: ${message}`);
  errors++;
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
  if (!metaBlock.includes('openGraph')) {
    postErrors.push('missing openGraph');
  } else {
    if (!metaBlock.includes('images')) {
      postErrors.push('missing openGraph.images');
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
