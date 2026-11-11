/**
 * Reads and rewrites the handful of fields at the top of a post (the metadata
 * export, <PostHeader> and <PostSchema>) as text, keeping the copies of each
 * value in step. Runs in the browser (the writing desk) and under Node (tests).
 *
 * Like lib/mdx-parsing.mjs these are string helpers, not a parser: they rely
 * on the shape every post in this repo has.
 */
import {
  extractMetadataBlock,
  findMetadataBlockEnd,
  matchQuoted,
  matchQuotedProp,
} from '../../lib/mdx-parsing.mjs';

/**
 * Where the writing starts: the index just past the metadata export and the
 * <PostHeader>, <PostSchema> and <FAQJsonLd> tags that follow it. Everything before it is the
 * "head", which the desk hides behind its title and details fields. Returns
 * -1 when there's no metadata export to hide.
 */
export function bodyStart(content) {
  let at = findMetadataBlockEnd(content);
  if (at === -1) return -1;
  for (;;) {
    const rest = content.slice(at);
    const tag = rest.match(/^\s*<(?:PostHeader|PostSchema)\b[^>]*\/>/) ?? rest.match(/^\s*<FAQJsonLd\b[\s\S]*?\/>/);
    if (!tag) break;
    at += tag[0].length;
  }
  return at + content.slice(at).match(/^\s*/)[0].length;
}

/** The fields the desk shows, read the way the site reads them. */
export function getFields(content) {
  const block = extractMetadataBlock(content) ?? '';
  return {
    displayTitle: matchQuotedProp(content, 'PostHeader', 'title'),
    seoTitle: matchQuoted(block, 'title'),
    subtitle: matchQuoted(block, 'subtitle'),
    description: matchQuoted(block, 'description'),
    quote: matchQuoted(block, 'quote'),
    date: block.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1] ?? null,
    draft: /\bdraft:\s*true\b/.test(block),
  };
}

/** One line, no straight double quotes: safe in a JSX prop and in the metadata. */
export function tidy(value) {
  return value.replace(/\s*\n\s*/g, ' ').replace(/"/g, "'");
}

const quotedValue = (key) => new RegExp(`(\\b${key}:\\s*)(["'])((?:\\\\.|(?!\\2)[^\\\\])*)\\2`);

/** Replaces the first `key: "..."` in `text` at or after `from`, keeping its quote style. */
function setQuoted(text, key, value, from = 0) {
  const match = text.slice(from).match(quotedValue(key));
  if (!match) return text;
  const q = match[2];
  const escaped = value.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), `\\${q}`);
  const start = from + match.index;
  return text.slice(0, start) + match[1] + q + escaped + q + text.slice(start + match[0].length);
}

/** Replaces `prop="..."` in the first `<tag ...>`. */
function setProp(content, tag, prop, value) {
  const tagMatch = content.match(new RegExp(`<${tag}\\b[^>]*>`));
  if (!tagMatch) return content;
  const next = tagMatch[0].replace(
    new RegExp(`(\\b${prop}\\s*=\\s*")(?:[^"\\\\]|\\\\.)*(")`),
    (_, open, close) => open + value + close
  );
  return content.slice(0, tagMatch.index) + next + content.slice(tagMatch.index + tagMatch[0].length);
}

/** Runs `edit` on the metadata block only and splices the result back. */
function inMetadata(content, edit) {
  const block = extractMetadataBlock(content);
  if (!block) return content;
  const at = content.indexOf(block);
  return content.slice(0, at) + edit(block) + content.slice(at + block.length);
}

/**
 * Sets a value in the metadata, and the openGraph copy of it when that copy
 * was the same (several posts keep a different share title on purpose).
 */
function setShared(content, key, value) {
  return inMetadata(content, (block) => {
    const before = matchQuoted(block, key);
    let next = setQuoted(block, key, value);
    const og = next.indexOf('openGraph');
    if (og !== -1 && matchQuoted(next.slice(og), key) === before) next = setQuoted(next, key, value, og);
    return next;
  });
}

/**
 * Returns `content` with one field changed everywhere it lives:
 *  - displayTitle: the <PostHeader> title
 *  - seoTitle: metadata.title, the <PostSchema> title, and openGraph.title if it matched
 *  - description: metadata, <PostSchema>, and openGraph if it matched
 *  - subtitle, quote: metadata only (an empty subtitle removes the line)
 */
export function setField(content, name, raw) {
  if (name === 'displayTitle') return setProp(content, 'PostHeader', 'title', tidy(raw));
  if (name === 'seoTitle') return setProp(setShared(content, 'title', tidy(raw)), 'PostSchema', 'title', tidy(raw));
  if (name === 'description') {
    return setProp(setShared(content, 'description', tidy(raw)), 'PostSchema', 'description', tidy(raw));
  }
  if (name === 'quote') return inMetadata(content, (block) => setQuoted(block, 'quote', raw.replace(/\s*\n\s*/g, ' ')));
  if (name === 'subtitle') {
    const value = raw.replace(/\s*\n\s*/g, ' ');
    return inMetadata(content, (block) => {
      const has = matchQuoted(block, 'subtitle') !== null;
      if (has && !value.trim()) return block.replace(/^[ \t]*subtitle:\s*(["'])(?:\\.|(?!\1)[^\\])*\1,?[ \t]*\n/m, '');
      if (has) return setQuoted(block, 'subtitle', value);
      if (!value.trim()) return block;
      // No subtitle yet: put one under the quote (or the date).
      const anchor = block.match(/^([ \t]*)quote:.*\n/m) ?? block.match(/^([ \t]*)date:.*\n/m);
      if (!anchor) return block;
      const at = anchor.index + anchor[0].length;
      const line = `${anchor[1]}subtitle: "${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}",\n`;
      return block.slice(0, at) + line + block.slice(at);
    });
  }
  return content;
}
