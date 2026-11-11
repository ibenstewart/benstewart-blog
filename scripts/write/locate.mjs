/**
 * Matches a line of MDX source to the text it renders as, so the writing desk
 * can jump from a paragraph on the page to its source and back. Pure string
 * work: the desk supplies the rendered text, this finds the line.
 */

/** Text as it would read on the page: no markup, straight quotes, lowercase, single spaces. */
export function norm(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** A line of MDX reduced to the text a reader sees. */
export function plain(line) {
  return norm(
    line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
      .replace(/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s?)+/, '')
      .replace(/(\*\*|__|~~|`)/g, '')
      .replace(/(^|[\s(])[*_](?=\S)/g, '$1')
      .replace(/(\S)[*_](?=[\s).,;:!?]|$)/g, '$1')
      .replace(/\\([*_`[\]<>#])/g, '$1')
  );
}

/**
 * The lines of `source` a reader can see, with their offsets. Fenced code is
 * kept (its lines match the rendered code); blank lines are skipped. `image`
 * is the src of an image or <Figure> on the line, for lines with no text.
 */
export function visibleLines(source) {
  const lines = [];
  let at = 0;
  for (const raw of source.split('\n')) {
    const text = plain(raw);
    const image = raw.match(/!\[[^\]]*\]\(([^)\s]+)/)?.[1] ?? raw.match(/\bsrc\s*=\s*"([^"]+)"/)?.[1] ?? null;
    if (text || image) lines.push({ start: at, end: at + raw.length, text, image });
    at += raw.length + 1;
  }
  return lines;
}

const KEY = 48;

/**
 * The index in `lines` of the line that renders as `rendered` (an element's
 * text), or -1. `where` is how far down the page the element sits (0 to 1);
 * it settles ties when the same sentence appears twice.
 */
export function findLine(lines, rendered, where = 0) {
  const text = norm(rendered);
  if (!text) return -1;
  const key = text.slice(0, KEY);
  let hits = lines.map((line, i) => (line.text && (line.text.startsWith(key) || (line.text.length < KEY && text.startsWith(line.text) && line.text.length >= 12)) ? i : -1)).filter((i) => i !== -1);
  if (hits.length === 0 && key.length >= 12) hits = lines.map((line, i) => (line.text.includes(key) ? i : -1)).filter((i) => i !== -1);
  if (hits.length === 0) return -1;
  const target = where * (lines.length - 1);
  return hits.reduce((best, i) => (Math.abs(i - target) < Math.abs(best - target) ? i : best));
}

/** The line holding offset `at`, or the nearest visible line before it. */
export function lineAt(lines, at) {
  let found = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].start <= at) found = i;
    else break;
  }
  return found;
}

/**
 * Where in `line` (a raw source line) the rendered text `around` sits: used
 * to drop the cursor on the word that was clicked. Returns an offset into the
 * line, 0 when it can't tell.
 */
export function offsetInLine(raw, around) {
  for (let length = Math.min(around.length, 24); length >= 4; length -= 4) {
    const at = raw.indexOf(around.slice(0, length));
    if (at !== -1) return at;
  }
  return 0;
}
