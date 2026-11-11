/**
 * The writing desk, browser side. One entry open at a time: its page.mdx is
 * held whole in S.content, the textarea shows the part below the metadata
 * (or all of it, with "Whole file" ticked), and every change is saved to disk
 * half a second after the typing stops. The preview is the real page from
 * `next dev` on the same origin, so Fast Refresh redraws it and the desk can
 * reach into it to find the paragraph you're on.
 */
import { diffParagraphs, diffWords } from '../diff.mjs';
import { bodyStart, getFields, setField } from '../fields.mjs';
import { RULE_NAMES, checkStyle, openComponent } from '../house-style.mjs';
import { findLine, lineAt, norm, offsetInLine, visibleLines } from '../locate.mjs';

const $ = (id) => document.getElementById(id);
const body = $('body');
const backdrop = $('backdrop');
const scroll = $('scroll');
const frame = $('frame');
const FIELDS = ['displayTitle', 'subtitle', 'seoTitle', 'description', 'quote'];
const SAVE_AFTER = 500;

const S = {
  slug: null,
  content: '',
  head: 0, // where the textarea's text starts inside S.content
  hash: null,
  committed: null,
  problems: [],
  notes: [],
  stats: null,
  entries: [],
  dirty: false,
  conflict: null,
  flash: null,
  claude: false,
};

const escapeHtml = (text) => text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

function api(path, { method = 'GET', body: payload, keepalive = false } = {}) {
  return fetch(`/__write/api${path}`, {
    method,
    keepalive,
    headers: payload ? { 'content-type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

let toastTimer;
function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('toast').hidden = true), 2600);
}

function status(text, state = '') {
  $('status').textContent = text;
  $('status').dataset.state = state;
}

/* ---------- Loading and saving ---------- */

async function loadEntries() {
  S.entries = (await (await api('/entries')).json()).entries;
}

async function open(slug, { keepFrame = false } = {}) {
  await flush();
  const res = await api(`/entry/${slug}`);
  if (!res.ok) return toast('That entry isn’t on disk.');
  const data = await res.json();
  Object.assign(S, { slug, content: data.content, hash: data.hash, problems: data.problems, committed: data.committed, dirty: false, conflict: null });
  $('conflict').hidden = true;
  showContent();
  body.setSelectionRange(0, 0);
  scroll.scrollTop = 0;
  history.replaceState(null, '', `#${slug}`);
  try {
    localStorage.setItem('desk:slug', slug);
  } catch {}
  if (!keepFrame) frame.src = `/posts/${slug}`;
  status('Saved');
}

/** Puts S.content on screen: fields, textarea, checks. */
function showContent() {
  const start = $('raw').checked ? -1 : bodyStart(S.content);
  S.head = Math.max(start, 0);
  $('head-fields').hidden = start === -1;
  if (body.value !== S.content.slice(S.head)) body.value = S.content.slice(S.head);
  const fields = getFields(S.content);
  for (const name of FIELDS) {
    const el = $(`f-${name}`);
    if (document.activeElement !== el) el.value = fields[name] ?? '';
    grow(el);
  }
  const entry = S.entries.find((e) => e.slug === S.slug);
  $('entry-name').textContent = fields.displayTitle ?? S.slug;
  document.title = `${fields.displayTitle ?? S.slug} · Writing desk`;
  $('draft-badge').hidden = !fields.draft;
  $('details-line').textContent = [fields.date, entry?.chapter, fields.draft ? 'Draft' : null].filter(Boolean).join(' · ');
  $('fixed-line').textContent = `Filed ${fields.date ?? 'with no date'}${entry?.chapter ? ` in ${entry.chapter}` : ''}, at /posts/${S.slug}. The date and themes decide the entry’s number, so they’re only editable with “Whole file” ticked.`;
  refresh();
}

function grow(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

let saveTimer;
let saving = Promise.resolve();

function touch() {
  S.dirty = true;
  status('Edited');
  refresh();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, SAVE_AFTER);
}

function save({ force = false } = {}) {
  saving = saving.then(async () => {
    if (!S.dirty || S.conflict) return;
    // A half-typed component would break the page; wait for it to be closed.
    const open = force ? null : openComponent(S.content);
    if (open) return status(`Waiting for </${open}>`);
    const slug = S.slug;
    S.dirty = false;
    status('Saving…');
    try {
      const res = await api(`/entry/${slug}`, { method: 'PUT', body: { content: S.content, baseHash: S.hash } });
      const data = await res.json();
      if (res.status === 409) {
        S.dirty = true;
        showConflict(data);
      } else if (!res.ok) {
        throw new Error(data.error);
      } else if (S.slug === slug) {
        S.hash = data.hash;
        S.problems = data.problems;
        status(S.dirty ? 'Edited' : 'Saved');
        renderFoot();
        if (!$('notes').hidden) renderNotes();
        setTimeout(markPreview, 700);
      }
    } catch {
      S.dirty = true;
      status('Not saved, retrying', 'error');
      clearTimeout(saveTimer);
      saveTimer = setTimeout(save, 3000);
    }
  });
  return saving;
}

/** Saves now, whatever state the text is in (switching entry, Ctrl/Cmd+S). */
function flush() {
  clearTimeout(saveTimer);
  return save({ force: true });
}

function showConflict(theirs) {
  S.conflict = theirs;
  $('conflict').hidden = false;
  status('Changed on disk', 'error');
}

$('take-theirs').onclick = () => {
  Object.assign(S, { content: S.conflict.content, hash: S.conflict.hash, conflict: null, dirty: false });
  $('conflict').hidden = true;
  showContent();
  status('Saved');
};
$('keep-mine').onclick = () => {
  S.hash = S.conflict.hash;
  S.conflict = null;
  $('conflict').hidden = true;
  flush();
};

/** The file changed on disk and it wasn't the desk (an editor, git, Claude Code). */
async function changedOutside({ slug, hash }) {
  if (slug !== S.slug || hash === S.hash) return loadEntries();
  await saving;
  if (hash === S.hash) return;
  const res = await api(`/entry/${slug}`);
  if (!res.ok || S.slug !== slug) return;
  const data = await res.json();
  if (data.hash === S.hash) return;
  if (S.dirty) return showConflict(data);
  const caret = body.selectionStart;
  Object.assign(S, { content: data.content, hash: data.hash, problems: data.problems, committed: data.committed });
  showContent();
  body.setSelectionRange(caret, caret);
  toast('Reloaded: the file changed on disk.');
}

/* ---------- The editor ---------- */

const TAG = 1;
const HEAD = 2;
const STRONG = 4;
const DIM = 8;
const NOTE = 16;
const FLASH = 32;
const CLASSES = [[TAG, 't'], [HEAD, 'h'], [STRONG, 's'], [DIM, 'd'], [NOTE, 'n'], [FLASH, 'f']];

/** Redraws the coloured copy of the text that sits under the see-through textarea. */
function paint() {
  const text = body.value;
  const flags = new Uint8Array(text.length);
  const mark = (start, end, bit) => flags.fill(bit, Math.max(start, 0), Math.min(end, text.length));
  const or = (start, end, bit) => {
    for (let i = Math.max(start, 0); i < Math.min(end, text.length); i++) flags[i] |= bit;
  };
  for (const m of text.matchAll(/^#{1,6} .*$/gm)) mark(m.index, m.index + m[0].length, HEAD);
  for (const m of text.matchAll(/\*\*[^*\n]+\*\*/g)) or(m.index, m.index + m[0].length, STRONG);
  for (const m of text.matchAll(/\]\([^)\n]*\)|!\[/g)) mark(m.index, m.index + m[0].length, DIM);
  for (const m of text.matchAll(/<\/?[A-Za-z][^>]*>/g)) mark(m.index, m.index + m[0].length, TAG);
  for (const m of text.matchAll(/```[\s\S]*?(?:```|$)/g)) mark(m.index, m.index + m[0].length, DIM);
  if (S.head === 0) {
    const meta = bodyStart(S.content);
    const from = S.content.indexOf('export const metadata');
    if (meta !== -1 && $('raw').checked) mark(from, text.indexOf('};', from) + 2, DIM);
  }
  for (const note of S.notes) if (note.start >= 0) or(note.start - S.head, note.end - S.head, NOTE);
  if (S.flash) or(S.flash.start, S.flash.end, FLASH);

  let html = '';
  for (let i = 0; i < text.length; ) {
    let j = i + 1;
    while (j < text.length && flags[j] === flags[i]) j++;
    const classes = CLASSES.filter(([bit]) => flags[i] & bit).map(([, name]) => name).join(' ');
    const chunk = escapeHtml(text.slice(i, j));
    html += classes ? `<span class="${classes}">${chunk}</span>` : chunk;
    i = j;
  }
  backdrop.innerHTML = `${html}\n`;
}

/** A DOM range over the painted text, for measuring where an offset sits on screen. */
function rangeFor(start, end) {
  const range = document.createRange();
  const walker = document.createTreeWalker(backdrop, NodeFilter.SHOW_TEXT);
  let at = 0;
  let begun = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.data.length;
    if (!begun && start <= at + length) {
      range.setStart(node, start - at);
      begun = true;
    }
    if (begun && end <= at + length) {
      range.setEnd(node, end - at);
      return range;
    }
    at += length;
  }
  return null;
}

/** Selects start..end in the textarea, scrolls it into view and flashes it. */
function reveal(start, end = start, { focus = true } = {}) {
  if (focus) body.focus({ preventScroll: true });
  body.setSelectionRange(start, end);
  const rect = rangeFor(start, Math.min(Math.max(end, start + 1), body.value.length + 1))?.getBoundingClientRect();
  if (rect) {
    const box = scroll.getBoundingClientRect();
    if (rect.top < box.top + 60 || rect.bottom > box.bottom - 80) {
      scroll.scrollTo({ top: scroll.scrollTop + rect.top - box.top - scroll.clientHeight * 0.35, behavior: 'smooth' });
    }
  }
  const lineEnd = body.value.indexOf('\n', start);
  S.flash = end > start ? { start, end } : { start: body.value.lastIndexOf('\n', start - 1) + 1, end: lineEnd === -1 ? body.value.length : lineEnd };
  paint();
  clearTimeout(reveal.timer);
  reveal.timer = setTimeout(() => {
    S.flash = null;
    paint();
  }, 1100);
}

/** Replaces start..end with `text` as a typed edit, so Ctrl/Cmd+Z undoes it. */
function replace(start, end, text) {
  body.focus({ preventScroll: true });
  body.setSelectionRange(start, end);
  const done = text === '' ? start === end || document.execCommand('delete') : document.execCommand('insertText', false, text);
  if (!done) {
    body.setRangeText(text, start, end, 'end');
    body.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function wrap(mark) {
  const { selectionStart: start, selectionEnd: end, value } = body;
  const picked = value.slice(start, end);
  const size = mark.length;
  if (value.slice(start - size, start) === mark && value.slice(end, end + size) === mark) {
    replace(start - size, end + size, picked);
    body.setSelectionRange(start - size, end - size);
  } else {
    replace(start, end, `${mark}${picked}${mark}`);
    body.setSelectionRange(start + size, end + size);
  }
}

function link() {
  const { selectionStart: start, selectionEnd: end, value } = body;
  const picked = value.slice(start, end) || 'link text';
  replace(start, end, `[${picked}](url)`);
  body.setSelectionRange(start + picked.length + 3, start + picked.length + 6);
}

body.addEventListener('input', (event) => {
  S.content = S.content.slice(0, S.head) + body.value;
  hideTools();
  touch();
  // A slash on a line of its own opens the insert menu.
  const at = body.selectionStart;
  if (event.data === '/' && /(^|\n)\/$/.test(body.value.slice(0, at)) && /^(\n|$)/.test(body.value.slice(at))) openInsert({ start: at - 1, end: at });
});

body.addEventListener('keydown', (event) => {
  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === 'b') {
    event.preventDefault();
    wrap('**');
  } else if (mod && event.key.toLowerCase() === 'i') {
    event.preventDefault();
    wrap('*');
  } else if (mod && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    link();
  } else if (event.key === 'Enter' && !mod && !event.shiftKey && !event.isComposing && body.selectionStart === body.selectionEnd) {
    // Carry a list on to the next line; Enter on an empty item ends it.
    const at = body.selectionStart;
    const lineStart = body.value.lastIndexOf('\n', at - 1) + 1;
    const lineEnd = body.value.indexOf('\n', at);
    const item = body.value.slice(lineStart, at).match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!item || (lineEnd !== -1 ? lineEnd : body.value.length) !== at) return;
    event.preventDefault();
    if (!item[3]) return replace(lineStart, at, '');
    const marker = /\d/.test(item[2]) ? `${Number.parseInt(item[2], 10) + 1}.` : item[2];
    replace(at, at, `\n${item[1]}${marker} `);
  }
});

for (const name of FIELDS) {
  const el = $(`f-${name}`);
  el.addEventListener('input', () => {
    grow(el);
    S.content = setField(S.content, name, el.value);
    const start = bodyStart(S.content);
    S.head = $('raw').checked ? 0 : Math.max(start, 0);
    if ($('raw').checked) body.value = S.content;
    if (name === 'displayTitle') $('entry-name').textContent = el.value;
    touch();
  });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });
  // Show what was actually written (straight double quotes become single ones).
  el.addEventListener('blur', () => {
    el.value = getFields(S.content)[name] ?? '';
    grow(el);
  });
}

$('raw').addEventListener('change', () => {
  const caret = body.selectionStart + S.head;
  showContent();
  reveal(Math.max(caret - S.head, 0), undefined, { focus: false });
});
$('details').addEventListener('toggle', () => FIELDS.forEach((name) => grow($(`f-${name}`))));

/* ---------- Checks ---------- */

function refresh() {
  const { notes, stats } = checkStyle(S.content);
  S.notes = notes;
  S.stats = stats;
  paint();
  renderFoot();
  if (!$('notes').hidden) renderNotes();
  if (!$('changes').hidden) renderChanges();
  const quoteNote = notes.find((n) => n.rule === 'quote');
  const quote = $('f-quote').value.trim();
  $('quote-hint').textContent = !quote ? 'One line lifted from the entry, for cards and the share card. Select it in the text and press “Pull quote”.' : quoteNote ? quoteNote.message : 'Word for word from the entry.';
  $('quote-hint').dataset.state = !quote ? '' : quoteNote ? 'bad' : 'good';
  const length = $('f-description').value.length;
  $('description-hint').textContent = `${length} characters. Search results cut off at about 160. Kept in step in the metadata, the share tags and PostSchema.`;
}

function changedParagraphs() {
  if (S.committed === null) return null;
  const from = (text) => text.slice(Math.max(bodyStart(text), 0));
  return diffParagraphs(from(S.committed), from(S.content));
}

function renderFoot() {
  const { words, minutes } = S.stats;
  $('count').textContent = `${words.toLocaleString('en-GB')} words · ${minutes} min`;
  const total = S.notes.length + S.problems.length;
  const button = $('notes-btn');
  button.textContent = S.problems.length ? `${S.problems.length} to fix${S.notes.length ? ` · ${S.notes.length} ${S.notes.length === 1 ? 'note' : 'notes'}` : ''}` : total ? `${total} ${total === 1 ? 'note' : 'notes'}` : 'No notes';
  button.dataset.state = S.problems.length ? 'bad' : '';
  const steps = changedParagraphs();
  const changed = steps ? steps.filter((s) => s.type !== 'same').length : 0;
  $('changes-btn').hidden = !steps || (changed === 0 && $('changes').hidden);
  $('changes-btn').textContent = changed ? `${changed} changed` : 'No changes';
}

function renderNotes() {
  const panel = $('notes');
  panel.replaceChildren();
  const heading = (text) => panel.appendChild(Object.assign(document.createElement('h2'), { textContent: text }));
  const { words, swears, emphasis, hasTLDR } = S.stats;

  if (S.problems.length) {
    heading('Won’t pass validate-posts');
    for (const problem of S.problems) {
      const row = panel.appendChild(Object.assign(document.createElement('div'), { className: 'note' }));
      row.dataset.kind = 'problem';
      row.innerHTML = `<span class="label">Fix</span><span>${escapeHtml(problem)}</span>`;
    }
  }

  heading('At a glance');
  const glance = panel.appendChild(Object.assign(document.createElement('div'), { className: 'note' }));
  glance.innerHTML = `<span class="label">The guide</span><span>${[
    `${words.toLocaleString('en-GB')} words (most entries run 600 to 1,200)`,
    `${emphasis} key ${emphasis === 1 ? 'point or callout' : 'points or callouts'} (1 to 3)`,
    hasTLDR ? 'has an In short' : 'no In short yet',
    `${swears} ${swears === 1 ? 'swear' : 'swears'} (one or two, when it adds punch)`,
  ].join(' · ')}</span>`;

  heading(S.notes.length ? 'House style' : 'House style: nothing to flag');
  for (const note of S.notes) {
    const row = panel.appendChild(Object.assign(document.createElement('button'), { className: 'note', type: 'button' }));
    const whole = note.start < 0;
    const lineStart = whole ? 0 : S.content.lastIndexOf('\n', note.start - 1) + 1;
    const before = whole ? '' : S.content.slice(Math.max(lineStart, note.start - 30), note.start);
    const after = whole ? '' : S.content.slice(note.end, note.end + 30).split('\n')[0];
    row.innerHTML = `<span class="label">${RULE_NAMES[note.rule]}</span><span>${whole ? '' : `${escapeHtml(before)}<q>${escapeHtml(S.content.slice(note.start, note.end))}</q>${escapeHtml(after)}`}<small>${escapeHtml(note.message)}</small></span>`;
    row.onclick = () => {
      if (whole) {
        $('details').open = true;
        $('f-quote').focus();
      } else if (note.start >= S.head) {
        reveal(note.start - S.head, note.end - S.head);
      }
    };
    if (note.fix) {
      const fix = row.lastElementChild.appendChild(Object.assign(document.createElement('span'), { className: 'btn note-fix', textContent: `Change to “${note.fix}”` }));
      fix.onclick = (event) => {
        event.stopPropagation();
        replace(note.start - S.head, note.end - S.head, note.fix);
      };
    }
  }
}

$('notes-btn').onclick = () => {
  const show = $('notes').hidden;
  $('notes').hidden = !show;
  $('notes-btn').setAttribute('aria-expanded', String(show));
  if (show) renderNotes();
};

function renderChanges() {
  const steps = changedParagraphs() ?? [];
  const changed = steps.filter((s) => s.type !== 'same').length;
  const words = (parts) => parts.map((p) => (p.type === 'same' ? escapeHtml(p.value) : `<${p.type === 'add' ? 'ins' : 'del'}>${escapeHtml(p.value)}</${p.type === 'add' ? 'ins' : 'del'}>`)).join('');
  let html = `<div class="changes-in"><h2>Changed since the last commit</h2><p class="sub">${changed ? `${changed} ${changed === 1 ? 'paragraph' : 'paragraphs'}. Green is new, red is gone.` : 'Nothing yet. The text matches the last commit.'}</p>`;
  steps.forEach((step, i) => {
    if (step.type === 'same') {
      // One paragraph of context either side of a change; the rest folds away.
      const near = steps[i - 1]?.type !== 'same' || (steps[i + 1] && steps[i + 1].type !== 'same');
      if (near && changed) html += `<p class="same">${escapeHtml(step.after)}</p>`;
      else if (changed && steps[i - 1]?.type === 'same' && steps[i - 2]?.type !== 'same') html += '<p class="gap">· · ·</p>';
    } else if (step.type === 'change') html += `<p class="changed">${words(step.words)}</p>`;
    else if (step.type === 'add') html += `<p class="added"><ins>${escapeHtml(step.after)}</ins></p>`;
    else html += `<p class="removed"><del>${escapeHtml(step.before)}</del></p>`;
  });
  $('changes').innerHTML = `${html}</div>`;
}

$('changes-btn').onclick = () => {
  const show = $('changes').hidden;
  $('changes').hidden = !show;
  $('changes-btn').setAttribute('aria-pressed', String(show));
  if (show) renderChanges();
  renderFoot();
};

/* ---------- Selection tools, Ask Claude, Insert ---------- */

function place(pop, rect, { below = false } = {}) {
  pop.hidden = false;
  pop.anchor = { rect, below };
  const box = pop.getBoundingClientRect();
  let top = below ? rect.bottom + 10 : rect.top - box.height - 10;
  if (top < 60) top = rect.bottom + 10;
  if (top + box.height > innerHeight - 8) top = Math.max(60, rect.top - box.height - 10);
  pop.style.top = `${top}px`;
  pop.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - box.width - 8))}px`;
}

function hideTools() {
  $('tools').hidden = true;
}

function showTools() {
  const { selectionStart: start, selectionEnd: end } = body;
  if (start === end || document.activeElement !== body) return hideTools();
  const rect = rangeFor(start, end)?.getClientRects()[0];
  if (rect) place($('tools'), rect);
}
body.addEventListener('mouseup', () => setTimeout(showTools));
body.addEventListener('keyup', (event) => {
  if (event.shiftKey || event.key === 'Shift') showTools();
});
body.addEventListener('blur', () => setTimeout(() => !$('tools').contains(document.activeElement) && hideTools(), 150));
scroll.addEventListener('scroll', hideTools, { passive: true });

/** The selected text as a reader sees it: no emphasis marks, links as their text. */
const unmark = (text) => text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/(\*\*|__|`)/g, '').replace(/(^|\s)[*_](\S)/g, '$1$2').replace(/(\S)[*_](?=\s|[.,;:!?]|$)/g, '$1').replace(/\s+/g, ' ').trim();

$('tools').addEventListener('mousedown', (event) => event.preventDefault());
$('tools').addEventListener('click', (event) => {
  const action = event.target.closest('button')?.dataset.do;
  if (action === 'bold') wrap('**');
  if (action === 'italic') wrap('*');
  if (action === 'link') link();
  if (action === 'ask') openAsk();
  if (action === 'quote') {
    const line = unmark(body.value.slice(body.selectionStart, body.selectionEnd));
    $('f-quote').value = line;
    S.content = setField(S.content, 'quote', line);
    S.head = $('raw').checked ? 0 : Math.max(bodyStart(S.content), 0);
    if ($('raw').checked) body.value = S.content;
    touch();
    hideTools();
    toast('That’s the pull quote now.');
  }
});

const ASKS = [
  ['Tighten', 'Tighten this. Cut what isn’t doing any work; keep every point and the voice.'],
  ['Plainer', 'Say this in plainer words. Shorter sentences where it helps.'],
  ['More direct', 'Make this more direct. Lead with the point, drop the hedging.'],
  ['Fix slips only', 'Fix spelling, grammar and punctuation slips only (UK English). Change nothing else.'],
];
let ask = null;

function openAsk() {
  let { selectionStart: start, selectionEnd: end } = body;
  if (start === end) {
    // Nothing selected: take the paragraph the cursor is in.
    start = body.value.lastIndexOf('\n', start - 1) + 1;
    end = body.value.indexOf('\n', end);
    if (end === -1) end = body.value.length;
    body.setSelectionRange(start, end);
  }
  if (!S.claude || start === end) return;
  ask = { start, end, passage: body.value.slice(start, end), instruction: '', suggestion: null };
  hideTools();
  $('ask-out').hidden = true;
  $('ask-actions').hidden = true;
  $('ask-input').value = '';
  place($('ask'), rangeFor(start, end).getBoundingClientRect(), { below: true });
  $('ask-input').focus();
}

function closeAsk() {
  ask = null;
  $('ask').hidden = true;
}

async function runAsk(instruction) {
  if (!ask || !instruction.trim()) return;
  const mine = ask;
  mine.instruction = instruction;
  const out = $('ask-out');
  out.hidden = false;
  out.dataset.state = 'wait';
  out.textContent = 'Asking Claude. This takes a few seconds…';
  $('ask-actions').hidden = true;
  place($('ask'), $('ask').anchor.rect, { below: true });
  let data;
  try {
    data = await (await api('/ask', { method: 'POST', body: { passage: mine.passage, instruction, content: S.content } })).json();
  } catch {
    data = { error: 'The desk’s server didn’t answer.' };
  }
  if (ask !== mine) return;
  if (data.error || !data.text) {
    out.dataset.state = 'error';
    out.textContent = data.error ?? 'Claude came back with nothing.';
    return;
  }
  mine.suggestion = data.text;
  out.dataset.state = '';
  out.innerHTML = diffWords(mine.passage, data.text).map((p) => (p.type === 'same' ? escapeHtml(p.value) : `<${p.type === 'add' ? 'ins' : 'del'}>${escapeHtml(p.value)}</${p.type === 'add' ? 'ins' : 'del'}>`)).join('');
  $('ask-actions').hidden = false;
  place($('ask'), $('ask').anchor.rect, { below: true });
  $('ask-use').focus();
}

$('ask-chips').append(
  ...ASKS.map(([name, instruction]) => {
    const chip = Object.assign(document.createElement('button'), { type: 'button', className: 'chip', textContent: name });
    chip.onclick = () => {
      $('ask-input').value = instruction;
      runAsk(instruction);
    };
    return chip;
  })
);
$('ask-form').onsubmit = (event) => {
  event.preventDefault();
  runAsk($('ask-input').value);
};
$('ask-again').onclick = () => runAsk(ask.instruction);
$('ask-drop').onclick = () => {
  closeAsk();
  body.focus({ preventScroll: true });
};
$('ask-use').onclick = () => {
  if (body.value.slice(ask.start, ask.end) !== ask.passage) {
    $('ask-out').dataset.state = 'error';
    $('ask-out').textContent = 'The passage changed while Claude was thinking. Select it again.';
    $('ask-actions').hidden = true;
    return;
  }
  const { start, end, suggestion } = ask;
  closeAsk();
  replace(start, end, suggestion);
};

const INSERTS = [
  { name: 'Section heading', hint: '## A short, declarative header', text: '## Heading', select: 'Heading' },
  { name: 'Key point', hint: 'Yellow panel, big bold text', text: '<KeyPoint>Text</KeyPoint>', select: 'Text', wrap: true },
  { name: 'Callout: insight', hint: 'Blue label', text: '<Callout type="insight">\nText\n</Callout>', select: 'Text', wrap: true },
  { name: 'Callout: worth knowing', hint: 'Red label (warning)', text: '<Callout type="warning">\nText\n</Callout>', select: 'Text', wrap: true },
  { name: 'Callout: try this', hint: 'Green label (tip)', text: '<Callout type="tip">\nText\n</Callout>', select: 'Text', wrap: true },
  { name: 'Callout: story', hint: 'Grey label', text: '<Callout type="story">\nText\n</Callout>', select: 'Text', wrap: true },
  { name: 'Pull quote', hint: 'Big line with an attribution', text: '<PullQuote author="Name">Quote</PullQuote>', select: 'Quote', wrap: true },
  { name: 'Scenario', hint: 'Chat bubbles; "Me" sits on the right', text: '<Scenario speaker="Name">What they said</Scenario>\n\n<Scenario speaker="Me">What I said</Scenario>', select: 'What they said' },
  { name: 'Lede', hint: 'The opening paragraph, set larger', text: '<Lede>Text</Lede>', select: 'Text', wrap: true },
  { name: 'In short', hint: 'The TLDR panel at the end', text: '<TLDR>Text</TLDR>', select: 'Text', wrap: true },
  { name: 'Figure', hint: 'Image with a caption', text: `<Figure src="/images/posts/SLUG-0.jpg" alt="What it shows" caption="Caption" />`, select: 'What it shows' },
  { name: 'Screenshot', hint: 'Framed, in the wide column', text: `<Figure screenshot src="/images/posts/SLUG-0.jpg" alt="What it shows" caption="Caption" />`, select: 'What it shows' },
  { name: 'Stats', hint: 'A row of big numbers', text: '<Stats items={[\n  { value: "24", label: "sessions" },\n  { value: "3", label: "weeks" },\n]} />', select: '24' },
  { name: 'Quadrant', hint: 'A 2x2 with axis labels', text: '<Quadrant\n  x={["Easy", "Hard"]}\n  y={["Expensive", "Cheap"]}\n  cells={[\n    { level: "1", title: "Title", example: "Example" },\n    { level: "2", title: "Title", example: "Example" },\n    { level: "3", title: "Title", example: "Example" },\n    { level: "4", title: "Title", example: "Example" },\n  ]}\n/>', select: 'Easy' },
  { name: 'Divider', hint: '---', text: '---', select: '' },
];
let inserting = null;

function openInsert(range) {
  const { selectionStart: start, selectionEnd: end } = body;
  inserting = range ?? { start, end };
  $('insert-filter').value = '';
  listInserts();
  place($('insert'), rangeFor(inserting.start, Math.max(inserting.end, inserting.start + 1))?.getBoundingClientRect() ?? $('insert-btn').getBoundingClientRect(), { below: true });
  $('insert-filter').focus();
}

function listInserts() {
  const filter = $('insert-filter').value.trim().toLowerCase();
  const list = $('insert-list');
  list.replaceChildren(
    ...INSERTS.filter((item) => item.name.toLowerCase().includes(filter)).map((item, i) => {
      const li = document.createElement('li');
      li.innerHTML = `${escapeHtml(item.name)}<small>${escapeHtml(item.hint)}</small>`;
      li.setAttribute('aria-selected', String(i === 0));
      li.onmousedown = (event) => {
        event.preventDefault();
        insert(item);
      };
      li.item = item;
      return li;
    })
  );
}

function insert(item) {
  const { start, end } = inserting;
  $('insert').hidden = true;
  inserting = null;
  const picked = body.value.slice(start, end);
  const wrapping = item.wrap && picked.trim() && picked !== '/';
  let text = item.text.replace(/SLUG/g, S.slug);
  if (wrapping) text = text.replace(item.select, picked.trim());
  // Components sit on their own paragraph: a blank line either side.
  const before = body.value.slice(0, start).match(/\n*$/)[0].length;
  const after = body.value.slice(end).match(/^\n*/)[0].length;
  const lead = start === 0 ? '' : '\n'.repeat(Math.max(0, 2 - before));
  const tail = '\n'.repeat(Math.max(0, 2 - after));
  replace(start, end, lead + text + tail);
  const at = start + lead.length + (wrapping || !item.select ? text.length : text.indexOf(item.select));
  body.setSelectionRange(at, wrapping || !item.select ? at : at + item.select.length);
}

function moveChoice(list, by) {
  const items = [...list.children];
  const now = items.findIndex((li) => li.getAttribute('aria-selected') === 'true');
  const next = Math.max(0, Math.min(items.length - 1, now + by));
  items.forEach((li, i) => li.setAttribute('aria-selected', String(i === next)));
  items[next]?.scrollIntoView({ block: 'nearest' });
}

$('insert-btn').onclick = () => openInsert();
$('insert-filter').addEventListener('input', listInserts);
$('insert-filter').addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveChoice($('insert-list'), event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const chosen = $('insert-list').querySelector('[aria-selected="true"]');
    if (chosen) insert(chosen.item);
  }
});
$('insert-filter').addEventListener('blur', () => {
  $('insert').hidden = true;
});

/* ---------- Entry picker ---------- */

function listEntries() {
  const filter = $('picker-filter').value.trim().toLowerCase();
  $('picker-list').replaceChildren(
    ...S.entries
      .filter((entry) => `${entry.title} ${entry.slug} ${entry.chapter ?? ''}`.toLowerCase().includes(filter))
      .map((entry, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${escapeHtml(entry.title)}</b>${entry.draft ? '<span class="badge">Draft</span>' : '<span></span>'}<span class="label">${escapeHtml([entry.chapter, entry.date, `${entry.words.toLocaleString('en-GB')} words`].filter(Boolean).join(' · '))}</span>`;
        li.setAttribute('aria-selected', String(i === 0));
        li.onclick = () => pick(entry.slug);
        li.slug = entry.slug;
        return li;
      })
  );
}

async function openPicker() {
  await loadEntries();
  $('picker-filter').value = '';
  listEntries();
  $('picker').showModal();
}

function pick(slug) {
  $('picker').close();
  open(slug).then(() => body.focus({ preventScroll: true }));
}

$('entry-btn').onclick = openPicker;
$('picker-filter').addEventListener('input', listEntries);
$('picker-filter').addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    moveChoice($('picker-list'), event.key === 'ArrowDown' ? 1 : -1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const chosen = $('picker-list').querySelector('[aria-selected="true"]');
    if (chosen) pick(chosen.slug);
  }
});
$('picker').addEventListener('click', (event) => event.target === $('picker') && $('picker').close());

/* ---------- The preview ---------- */

const BLOCKS = 'p,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,pre,td,th,summary';

/** Called on a timer: the frame's document is replaced on every full navigation. */
function hookPreview() {
  let doc;
  try {
    doc = frame.contentDocument;
  } catch {
    return;
  }
  if (!doc?.body) return;
  if (!doc.__desk) {
    doc.__desk = true;
    const style = doc.createElement('style');
    style.textContent = '[data-desk-here]{outline:3px solid #FFD84A;outline-offset:8px;border-radius:4px;transition:outline-color .25s}main p,main li,main h2,main h3,main blockquote,main figure{cursor:text}';
    doc.head.appendChild(style);
    doc.addEventListener('click', previewClick, true);
  }
  // Browsing to another entry in the preview brings it up in the editor.
  const path = frame.contentWindow.location.pathname;
  const slug = path.match(/^\/posts\/([^/]+)\/?$/)?.[1];
  $('back').hidden = slug === S.slug || !S.slug;
  if (slug && slug !== S.slug && slug !== hookPreview.opening && S.entries.some((e) => e.slug === slug)) {
    hookPreview.opening = slug;
    open(slug, { keepFrame: true }).finally(() => (hookPreview.opening = null));
  }
}

/** How far down the article an element sits, 0 to 1. */
function depth(doc, el) {
  const main = doc.querySelector('main') ?? doc.body;
  const box = main.getBoundingClientRect();
  return box.height ? Math.max(0, Math.min(1, (el.getBoundingClientRect().top - box.top) / box.height)) : 0;
}

/** A click on a paragraph in the preview puts the cursor on it in the editor. */
function previewClick(event) {
  const doc = frame.contentDocument;
  if (!doc.getSelection().isCollapsed || event.button !== 0 || event.metaKey || event.ctrlKey) return;
  const lines = visibleLines(body.value);
  let found = -1;
  const image = event.target.closest('img');
  if (image) {
    const src = new URL(image.currentSrc || image.src, location.href);
    const file = src.searchParams.get('url') ?? src.pathname;
    found = lines.findIndex((line) => line.image && file.endsWith(line.image));
  }
  let hit = image;
  for (let el = event.target.closest(BLOCKS) ?? event.target, hops = 0; found === -1 && el && el !== doc.body && hops < 5; hops++, el = el.parentElement) {
    if (el.matches('main, article, nav, header, footer')) break;
    found = findLine(lines, el.textContent, depth(doc, el));
    hit = el;
  }
  if (found === -1 || document.querySelector('main.desk').dataset.view === 'read') return;
  if (event.target.closest('a')) event.preventDefault();
  const line = lines[found];
  // Land on the word that was clicked where the source has it verbatim.
  let within = 0;
  const caret = doc.caretPositionFromPoint?.(event.clientX, event.clientY) ?? doc.caretRangeFromPoint?.(event.clientX, event.clientY);
  const node = caret?.offsetNode ?? caret?.startContainer;
  if (node?.nodeType === 3) {
    const offset = caret.offset ?? caret.startOffset;
    const wordStart = node.data.lastIndexOf(' ', offset - 1) + 1;
    within = offsetInLine(body.value.slice(line.start, line.end), node.data.slice(wordStart, wordStart + 24));
  }
  reveal(line.start + within);
  setHere(hit);
}

function setHere(el) {
  const doc = frame.contentDocument;
  for (const old of doc.querySelectorAll('[data-desk-here]')) if (old !== el) old.removeAttribute('data-desk-here');
  el?.setAttribute('data-desk-here', '');
}

/** Marks, and scrolls to, the paragraph in the preview that the cursor is in. */
function markPreview({ follow = true } = {}) {
  let doc;
  try {
    doc = frame.contentDocument;
  } catch {
    return;
  }
  const main = doc?.querySelector('main');
  if (!main || document.activeElement !== body) return;
  const lines = visibleLines(body.value);
  const at = lineAt(lines, body.selectionStart);
  if (at === -1) return setHere(null);
  const line = lines[at];
  let best = null;
  if (line.text) {
    const key = line.text.slice(0, 48);
    const target = at / Math.max(1, lines.length - 1);
    let bestScore = Infinity;
    for (const el of main.querySelectorAll(`${BLOCKS},div,span`)) {
      const text = norm(el.textContent);
      if (!text.startsWith(key) && !(key.length >= 12 && text.includes(key) && el.matches(BLOCKS))) continue;
      // Prefer the tightest element around the text, then the one nearest the same depth.
      const score = (text.length - key.length) * 10 + Math.abs(depth(doc, el) - target);
      if (score < bestScore) [best, bestScore] = [el, score];
    }
  } else if (line.image) {
    best = [...main.querySelectorAll('img')].find((img) => decodeURIComponent(img.currentSrc || img.src).includes(line.image)) ?? null;
  }
  setHere(best);
  if (!best || !follow) return;
  const rect = best.getBoundingClientRect();
  const height = frame.contentWindow.innerHeight;
  if (rect.top < 90 || rect.bottom > height - 60) {
    frame.contentWindow.scrollTo({ top: frame.contentWindow.scrollY + rect.top - height * 0.3, behavior: 'smooth' });
  }
}

let markTimer;
document.addEventListener('selectionchange', () => {
  if (document.activeElement !== body) return;
  clearTimeout(markTimer);
  markTimer = setTimeout(markPreview, 140);
});

$('back').onclick = () => (frame.src = `/posts/${S.slug}`);

function layoutFrame() {
  const stage = $('stage');
  const mode = stage.parentElement.dataset.width ?? 'fit';
  frame.style.cssText = '';
  if (mode === 'desktop') {
    const scale = Math.min(1, stage.clientWidth / 1280);
    frame.style.cssText = `width:1280px;height:${stage.clientHeight / scale}px;transform:scale(${scale})`;
  }
}

for (const button of document.querySelectorAll('[data-width]')) {
  button.onclick = () => {
    $('stage').parentElement.dataset.width = button.dataset.width;
    document.querySelectorAll('[data-width]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    layoutFrame();
  };
}
for (const button of document.querySelectorAll('[data-view]')) {
  if (button.tagName !== 'BUTTON') continue;
  button.onclick = () => {
    document.querySelector('main.desk').dataset.view = button.dataset.view;
    document.querySelectorAll('button[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    layoutFrame();
    FIELDS.forEach((name) => grow($(`f-${name}`)));
  };
}
addEventListener('resize', layoutFrame);

/* ---------- Keys, lifecycle ---------- */

addEventListener('keydown', (event) => {
  const mod = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();
  if (mod && key === 's') {
    event.preventDefault();
    flush().then(() => !S.dirty && toast('Saved. (It saves by itself as you type.)'));
  } else if (mod && key === 'p') {
    event.preventDefault();
    openPicker();
  } else if (mod && key === 'j') {
    event.preventDefault();
    openAsk();
  } else if (mod && key === '/') {
    event.preventDefault();
    openInsert();
  } else if (event.key === 'Escape') {
    if (!$('ask').hidden) {
      closeAsk();
      body.focus({ preventScroll: true });
    } else if (!$('insert').hidden) {
      body.focus({ preventScroll: true });
    }
    hideTools();
  }
});

addEventListener('beforeunload', () => {
  clearTimeout(saveTimer);
  if (S.dirty && !S.conflict) api(`/entry/${S.slug}`, { method: 'PUT', keepalive: true, body: { content: S.content, baseHash: S.hash } });
});
addEventListener('hashchange', () => {
  const slug = location.hash.slice(1);
  if (slug && slug !== S.slug) open(slug);
});

async function start() {
  await loadEntries();
  let remembered = null;
  try {
    remembered = localStorage.getItem('desk:slug');
  } catch {}
  const wanted = [location.hash.slice(1), remembered].find((slug) => S.entries.some((e) => e.slug === slug));
  await open(wanted ?? S.entries[0]?.slug);
  body.focus({ preventScroll: true });
  setInterval(hookPreview, 400);
  new EventSource('/__write/api/events').onmessage = (event) => changedOutside(JSON.parse(event.data));
  api('/status')
    .then((res) => res.json())
    .then(({ claude }) => {
      S.claude = claude;
      $('ask-btn').hidden = !claude;
    });
  if (document.fonts?.ready) document.fonts.ready.then(() => FIELDS.forEach((name) => grow($(`f-${name}`))));
}

start();
