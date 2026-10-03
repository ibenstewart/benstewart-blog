/**
 * Shared MDX/JSX text-extraction helpers used by both lib/posts.ts (the
 * runtime posts index) and scripts/validate-posts.mjs (the merge-gating
 * validator). Kept as plain ESM (rather than .ts) so the validator script
 * can run directly under Node without a build step; lib/posts.ts imports it
 * via tsconfig's `allowJs`.
 *
 * These are intentionally simple regex/brace-counting helpers, not a real
 * MDX/JSX parser - they're good enough for our fixed set of metadata and
 * component shapes, but they are not a general-purpose parser.
 */

/** Un-escapes `\"` and `\'` back to plain quote characters. */
export function unescapeQuotes(value) {
  return value.replace(/\\(['"])/g, '$1');
}

/**
 * Strips fenced code blocks (```...```) from content, replacing each with a
 * single space. Used before running heading/word-count checks so text inside
 * code samples (e.g. a `# comment` in a snippet) isn't mistaken for real
 * document structure.
 */
export function stripFencedCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, ' ');
}

/**
 * Extracts the `export const metadata = {...}` block using brace-depth
 * counting (so a literal `}` inside a string value doesn't end the match
 * early). Returns the raw slice including the block's braces, or null if no
 * metadata export is found.
 *
 * `includeExportPrefix` controls whether the returned slice starts at
 * `export const metadata` (true, matching lib/posts.ts's historical
 * behaviour) or at the opening `{` (false, matching
 * scripts/validate-posts.mjs's historical behaviour). Both callers keep
 * their existing slice shape so downstream string-matching stays identical.
 */
export function extractMetadataBlock(content, { includeExportPrefix = true } = {}) {
  const start = content.indexOf('export const metadata');
  if (start === -1) return null;

  const braceStart = content.indexOf('{', start);
  if (braceStart === -1) return null;

  let depth = 0;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth === 0) {
      return includeExportPrefix
        ? content.slice(start, i + 2) // include trailing `;`
        : content.slice(braceStart, i + 1);
    }
  }
  return null;
}

/**
 * Finds the index right after the `export const metadata = {...}` block
 * (including its trailing `;` if present), using the same brace-depth
 * counting as extractMetadataBlock. Returns -1 if no metadata export is
 * found, so callers can fall back to treating the whole file as body.
 */
export function findMetadataBlockEnd(content) {
  const start = content.indexOf('export const metadata');
  if (start === -1) return -1;

  const braceStart = content.indexOf('{', start);
  if (braceStart === -1) return -1;

  let depth = 0;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth === 0) {
      let end = i + 1;
      if (content[end] === ';') end++;
      return end;
    }
  }
  return -1;
}

/**
 * True when the post's metadata export sets `draft: true`. Drafts build and
 * stay reachable by URL, but every listing, feed and sitemap skips them.
 */
export function isDraft(content) {
  const block = extractMetadataBlock(content);
  return block !== null && /\bdraft:\s*true\b/.test(block);
}

/**
 * Extracts a `key: "value"` or `key: 'value'` pair from a metadata-style
 * object literal, escape-aware (handles `\"` / `\'` inside the value).
 */
export function matchQuoted(content, key) {
  const double = content.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (double) return unescapeQuotes(double[1]);
  const single = content.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (single) return unescapeQuotes(single[1]);
  return null;
}

/**
 * Extracts a `prop="value"` attribute (double-quoted, with escaped-quote
 * support) from the first `<tag ...>` occurrence in content.
 */
export function matchQuotedProp(content, tag, prop) {
  const tagMatch = content.match(new RegExp(`<${tag}[^>]*>`));
  if (!tagMatch) return null;
  return matchQuotedPropInTag(tagMatch[0], prop);
}

/**
 * Extracts a `prop="value"` attribute (double-quoted, with escaped-quote
 * support) from an already-extracted JSX tag source string, e.g. the result
 * of matching `<PostHeader ... />`.
 */
export function matchQuotedPropInTag(tagSource, prop) {
  const propMatch = tagSource.match(new RegExp(`\\b${prop}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return propMatch ? unescapeQuotes(propMatch[1]) : null;
}
