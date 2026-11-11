/**
 * The mechanical half of the tone guide in CLAUDE.md, as a checker: the
 * things a regex can spot (a sentence opening on "But", a US spelling, a
 * pull quote that isn't in the post). It can't judge the writing; every note
 * is a nudge to look, never a failure.
 *
 * Runs in the browser (the writing desk) and under Node (tests).
 */
import { extractMetadataBlock, findMetadataBlockEnd, matchQuoted } from '../../lib/mdx-parsing.mjs';

/** Same length as `text`, with everything matching `pattern` blanked to spaces (newlines kept). */
function blank(text, pattern) {
  return text.replace(pattern, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * The post with everything that isn't Ben's prose blanked out, offsets
 * unchanged: the metadata export, import lines, fenced and inline code, JSX
 * tags (and their props), link and image targets and bare URLs.
 */
export function proseOnly(content) {
  let text = content;
  const metaEnd = findMetadataBlockEnd(content);
  if (metaEnd !== -1) text = ' '.repeat(metaEnd).replace(/ /g, (_, i) => (content[i] === '\n' ? '\n' : ' ')) + text.slice(metaEnd);
  text = blank(text, /^import .*$/gm);
  text = blank(text, /```[\s\S]*?(```|$)/g);
  text = blank(text, /`[^`\n]*`/g);
  text = blank(text, /<\/?[A-Za-z][^>]*>/g);
  text = blank(text, /!\[[^\]\n]*\]\([^)\n]*\)/g);
  text = blank(text, /\]\([^)\n]*\)/g);
  text = blank(text, /https?:\/\/\S+/g);
  return text;
}

/** US spelling stems the guide's "UK English throughout" rules out, with their fix. */
const IZE = 'organi|reali|recogni|prioriti|optimi|summari|emphasi|apologi|critici|minimi|maximi|standardi|normali|categori|finali|speciali|utili|visuali|memori|customi|personali|generali|centrali|moderni|formali|capitali|characteri|authori|synchroni|analy|paraly|cataly|sociali|internali|externali|rationali|familiari|scrutini|sympathi|empathi|strategi|energi|incentivi|revolutioni|stabili|mobili|monopoli|patroni|populari|polari|theori|hypothesi|synthesi|terrori|coloni|civili|legali|neutrali|weaponi|democrati|digiti|monetiz?|itemi|agoni|antagoni|jeopardi|initiali|seriali|tokeni|containeri|paralleli|vectori';
const OUR = 'col|behavi|fav|hon|hum|lab|neighb|rum|flav|harb|vig|endeav|sav|val|ard|cand|clam|ferv|glam|ranc|splend|tum|vap';
const US_WORDS = {
  center: 'centre', centers: 'centres', centered: 'centred', centering: 'centring',
  theater: 'theatre', meter: 'metre', liter: 'litre', fiber: 'fibre', caliber: 'calibre',
  defense: 'defence', offense: 'offence', pretense: 'pretence',
  gray: 'grey', catalog: 'catalogue', dialog: 'dialogue', analog: 'analogue',
  fulfill: 'fulfil', enroll: 'enrol', skillful: 'skilful', willful: 'wilful',
  traveling: 'travelling', traveled: 'travelled', traveler: 'traveller',
  modeling: 'modelling', modeled: 'modelled', canceled: 'cancelled', canceling: 'cancelling',
  labeled: 'labelled', labeling: 'labelling', signaled: 'signalled', signaling: 'signalling',
  leveled: 'levelled', fueled: 'fuelled', counselor: 'counsellor',
  aging: 'ageing', judgment: 'judgement', acknowledgment: 'acknowledgement',
  check: null, program: null, // fine in UK English as used here; listed so nobody adds them
  mom: 'mum', math: 'maths', gotten: 'got', learned: null, practice: null,
  artifact: 'artefact', artifacts: 'artefacts', cozy: 'cosy', plow: 'plough', tire: null,
  skeptical: 'sceptical', skeptic: 'sceptic', maneuver: 'manoeuvre', pajamas: 'pyjamas',
};

const PHRASES = [
  // [pattern, rule, message]
  [/\b(?:let['’]s dive in|let['’]s dig in|here['’]s what i learned|without further ado|in this (?:post|article|entry),? (?:i|we)(?:['’]ll| will)|in conclusion)\b/gi, 'tell', 'Announces what’s coming, or sums up, in stock words.'],
  [/\b(?:leverag(?:e|es|ed|ing)|synerg(?:y|ies)|circl(?:e|ing) back|touch(?:ing)? base|low[- ]hanging fruit|mov(?:e|ing) the needle|going forward|best[- ]in[- ]class|thought leader(?:ship)?|paradigm shift|value[- ]add)\b/gi, 'corporate', 'Corporate speak.'],
  [/\b(?:perhaps|possibly|it might be|one could argue|one might(?: consider| say)?|arguably|somewhat|it could be said)\b/gi, 'hedge', 'Hedging. Say it, or cut it.'],
];

const NOT_X_ITS_Y = /\b(?:it|this|that)(?:['’]s| is| was)(?: not|n['’]t) [^.!?\n]{2,60}?[.,;:]\s+(?:it|this|that)(?:['’]s| is| was)\b|\b(?:isn['’]t|wasn['’]t|aren['’]t) [^.!?\n]{2,60}?[.,;]\s+(?:it|this|that|they)(?:['’]s|['’]re| is| was| are)\b/gi;

const SWEARS = /\b(?:shit\w*|bullshit|fuck\w*|bollocks|arse\w*|bastards?|crap|piss\w*|shite|bugger\w*|wank\w*|twat)\b/gi;

/**
 * The name of a component that's been opened and not closed yet (or whose
 * tag is still being typed), or null. MDX won't compile while one is open,
 * so the desk holds its save until the tag is finished rather than putting a
 * build error in the preview mid-sentence.
 */
export function openComponent(content) {
  const text = blank(blank(content, /```[\s\S]*?(```|$)/g), /`[^`\n]*`/g);
  const open = {};
  for (const m of text.matchAll(/<(\/?)([A-Z][A-Za-z0-9]*)/g)) {
    const name = m[2];
    if (m[1]) {
      open[name] = (open[name] ?? 0) - 1;
      continue;
    }
    // Walk to the end of the tag, skipping over strings and {expressions}.
    let depth = 0;
    let quote = null;
    let end = -1;
    for (let i = m.index + m[0].length; i < text.length; i++) {
      const c = text[i];
      if (quote) {
        if (c === quote) quote = null;
      } else if (depth === 0 && (c === '"' || c === "'")) quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) {
        end = i;
        break;
      }
    }
    if (end === -1) return name;
    if (text[end - 1] !== '/') open[name] = (open[name] ?? 0) + 1;
  }
  return Object.keys(open).find((name) => open[name] > 0) ?? null;
}

/** Lowercase, straight quotes, no markdown emphasis, single spaces: for "is this line in the post?". */
export function flatten(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Body words, counted the way lib/posts.ts counts them for the entry's meta line. */
export function countWords(content) {
  let body = content;
  const block = extractMetadataBlock(content);
  if (block) body = body.replace(block, '');
  body = body.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  return body.split(/\s+/).filter(Boolean).length;
}

/**
 * Checks a post against the guide. Returns:
 *  - notes: [{ start, end, rule, message, fix? }] with offsets into `content`
 *    (start === end === -1 for a note about the whole post), in reading order
 *  - stats: { words, minutes, swears, emphasis, hasTLDR }
 */
export function checkStyle(content) {
  const prose = proseOnly(content);
  const notes = [];
  const add = (start, end, rule, message, fix) => notes.push({ start, end, rule, message, ...(fix ? { fix } : {}) });

  // Sentences that open on And, But or Because.
  const opener = /(^|[.!?]["'”’)*_]*\s+|\n[ \t]*(?:[-*>]\s+|\d+\.\s+)?(?:\*\*|\*|_)?|\(\s*)(And|But|Because)\b(?=[\s,])/g;
  for (const m of prose.matchAll(opener)) {
    const start = m.index + m[1].length;
    add(start, start + m[2].length, 'opener', `Sentence starts with “${m[2]}”. Fold it into the one before, or use “though” or “yet”.`);
  }

  // US spellings.
  const ize = new RegExp(`\\b((?:${IZE})z)(e|es|ed|er|ers|ing|ation|ations|able)\\b`, 'gi');
  for (const m of prose.matchAll(ize)) {
    const fix = m[1].slice(0, -1) + (m[1].slice(-1) === 'Z' ? 'S' : 's') + m[2];
    add(m.index, m.index + m[0].length, 'spelling', `UK spelling: “${fix}”.`, fix);
  }
  const our = new RegExp(`\\b(${OUR})(or)(s|ed|ing|ite|ites|al|able|ful|less|ist|ists)?\\b`, 'gi');
  for (const m of prose.matchAll(our)) {
    if (/^(?:hon|hum|lab|vig|glam|vap|val|clam|ranc|tum)$/i.test(m[1]) && /^(?:ist|ists|ous)$/i.test(m[3] ?? '')) continue;
    const fix = `${m[1]}ou${m[2].slice(1)}${m[3] ?? ''}`;
    add(m.index, m.index + m[0].length, 'spelling', `UK spelling: “${fix}”.`, fix);
  }
  for (const m of prose.matchAll(/\b[A-Za-z]+\b/g)) {
    const uk = Object.hasOwn(US_WORDS, m[0].toLowerCase()) ? US_WORDS[m[0].toLowerCase()] : null;
    if (!uk) continue;
    const fix = m[0][0] === m[0][0].toUpperCase() ? uk[0].toUpperCase() + uk.slice(1) : uk;
    add(m.index, m.index + m[0].length, 'spelling', `UK spelling: “${fix}”.`, fix);
  }

  // Stock phrases.
  for (const [pattern, rule, message] of PHRASES) {
    for (const m of prose.matchAll(pattern)) add(m.index, m.index + m[0].length, rule, message);
  }

  // "It's not X, it's Y": fine once, a tic after that.
  const flips = [...prose.matchAll(NOT_X_ITS_Y)];
  if (flips.length > 1) {
    for (const m of flips) add(m.index, m.index + m[0].length, 'flip', `“It’s not X, it’s Y” appears ${flips.length} times. Once an entry is plenty.`);
  }

  // The pull quote has to be a line from the post.
  const block = extractMetadataBlock(content);
  const quote = block ? matchQuoted(block, 'quote') : null;
  if (quote && quote.trim()) {
    const metaEnd = findMetadataBlockEnd(content);
    const body = flatten(content.slice(metaEnd).replace(/<[^>]+>/g, ' ').replace(/\]\([^)\n]*\)/g, '').replace(/[[\]]/g, ''));
    // Two sentences lifted from different places still count, so check each.
    const pieces = flatten(quote).split(/(?<=[.!?])\s+/).map((piece) => piece.replace(/[.…!?]+$/, ''));
    if (pieces.some((piece) => piece && !body.includes(piece))) {
      add(-1, -1, 'quote', 'The pull quote isn’t in the entry word for word. It should be a line lifted from the writing.');
    }
  }

  notes.sort((a, b) => a.start - b.start);

  const words = countWords(content);
  return {
    notes,
    stats: {
      words,
      minutes: Math.max(1, Math.round(words / 230)),
      swears: [...prose.matchAll(SWEARS)].length,
      emphasis: [...content.matchAll(/<(?:KeyPoint|Callout)\b/g)].length,
      hasTLDR: /<TLDR\b/.test(content),
    },
  };
}

export const RULE_NAMES = {
  opener: 'Opener',
  spelling: 'Spelling',
  tell: 'Stock phrase',
  corporate: 'Corporate',
  hedge: 'Hedge',
  flip: 'Not X, it’s Y',
  quote: 'Pull quote',
};
