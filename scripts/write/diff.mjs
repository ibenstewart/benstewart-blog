/**
 * A small diff for prose: which paragraphs changed, and which words inside
 * them. Used by the writing desk for "changed since the last commit" and for
 * showing a suggested rewrite against the original.
 */

/** Longest-common-subsequence diff of two arrays: [{ type: 'same' | 'del' | 'add', value }]. */
export function diff(a, b) {
  const n = a.length;
  const m = b.length;
  const table = new Uint32Array((n + 1) * (m + 1));
  const w = m + 1;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * w + j] = a[i] === b[j] ? table[(i + 1) * w + j + 1] + 1 : Math.max(table[(i + 1) * w + j], table[i * w + j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: 'same', value: a[i] });
      i++;
      j++;
    } else if (table[(i + 1) * w + j] >= table[i * w + j + 1]) {
      out.push({ type: 'del', value: a[i++] });
    } else {
      out.push({ type: 'add', value: b[j++] });
    }
  }
  while (i < n) out.push({ type: 'del', value: a[i++] });
  while (j < m) out.push({ type: 'add', value: b[j++] });
  return out;
}

/** Word-level diff of two passages; whitespace travels with the word before it. */
export function diffWords(before, after) {
  const words = (text) => text.match(/\S+\s*/g) ?? [];
  return diff(words(before), words(after));
}

const paragraphs = (text) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/**
 * Paragraph-level diff of two documents. Returns
 * [{ type: 'same' | 'add' | 'del' | 'change', before?, after?, words? }],
 * where a 'change' pairs a removed paragraph with the one that replaced it
 * and carries their word diff.
 */
export function diffParagraphs(before, after) {
  const steps = diff(paragraphs(before), paragraphs(after));
  const out = [];
  for (let i = 0; i < steps.length; ) {
    if (steps[i].type === 'same') {
      out.push({ type: 'same', after: steps[i++].value });
      continue;
    }
    const dels = [];
    const adds = [];
    while (i < steps.length && steps[i].type !== 'same') {
      (steps[i].type === 'del' ? dels : adds).push(steps[i].value);
      i++;
    }
    const pairs = Math.min(dels.length, adds.length);
    for (let k = 0; k < pairs; k++) out.push({ type: 'change', before: dels[k], after: adds[k], words: diffWords(dels[k], adds[k]) });
    for (const value of dels.slice(pairs)) out.push({ type: 'del', before: value });
    for (const value of adds.slice(pairs)) out.push({ type: 'add', after: value });
  }
  return out;
}
