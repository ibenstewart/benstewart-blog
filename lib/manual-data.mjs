/**
 * The Field manual's hand-written content: chapters (themes), situations and
 * tools. Plain ESM like mdx-parsing.mjs, so scripts/validate-posts.mjs can
 * import it under Node and check every slug here points at a real, published
 * post. lib/manual.ts adds the types and the functions built on it.
 *
 * Each post picks its themes in its own metadata (`themes: ["ai", "words"]`);
 * the first one is its chapter. Situation lines and tool summaries are copy,
 * so edit them freely; the validator keeps the slugs honest.
 */

/**
 * Chapters, in manual order. `colour` is for bars and dots only, never for
 * text: every value is at least 3:1 on the paper so a progress bar still reads.
 */
export const THEMES = [
  { id: 'people', name: 'Leading people', colour: '#2F5BD3' },
  { id: 'words', name: 'Saying it well', colour: '#C8442B' },
  { id: 'breaks', name: 'When it breaks', colour: '#A86A00' },
  { id: 'ai', name: 'Working with AI', colour: '#1C7A62' },
  { id: 'self', name: 'Looking after yourself', colour: '#7E45B5' },
];

/** A post may carry at most this many themes. */
export const MAX_THEMES = 5;

/**
 * Situations: a problem in the reader's words and a three-step reading order,
 * each step with one line on why it's there. The first is the default.
 */
export const SITUATIONS = [
  {
    id: 'start',
    label: "I'm new here",
    path: [
      ['what-level-does-this-task-deserve', 'The two questions I ask before I hand anything to AI.'],
      ['the-three-pound-question', 'What an expensive chat with a chatbot taught me.'],
      ['sustainable', 'Why teams using AI are more tired, and what to stop.'],
    ],
  },
  {
    id: 'fire',
    label: "Something's on fire",
    path: [
      ['you-cant-hum-while-holding-your-nose', 'Read this mid-incident. Lead, don’t hero.'],
      ['practical-postmortems', 'Read this the day after, before anyone writes the timeline.'],
      ['leaders-dont-lie', 'Read this before you tell the exec team how it went.'],
    ],
  },
  {
    id: 'ai',
    label: "I'm about to hand work to AI",
    path: [
      ['what-level-does-this-task-deserve', 'The two questions to ask first.'],
      ['ralph-isnt-the-point', 'Why the spec matters more than the tool.'],
      ['multi-agent-ai-strategy', 'Where it goes when you push it properly.'],
    ],
  },
  {
    id: 'talk',
    label: 'I talk too much in meetings',
    path: [
      ['waist', 'Four letters to stick on your monitor.'],
      ['meeting-rooms-are-now-free', 'Why there are so many meetings to talk in.'],
      ['managing-up-up-down-down-left-right', 'Pick the right channel instead.'],
    ],
  },
  {
    id: 'empty',
    label: "I'm running on empty",
    path: [
      ['so-i-think-i-burned-out', 'The one I wish I’d read earlier.'],
      ['sustainable', 'Pace when everything got faster.'],
      ['end-of-year-manager-checklist', 'Reset the calendar that got you here.'],
    ],
  },
  {
    id: 'manager',
    label: "I've just become a manager",
    path: [
      ['the-invisible-manager', 'What the job actually is.'],
      ['am-i-jealous-of-my-team', 'The feeling nobody warns you about.'],
      ['the-basic-boss-formula', 'How to split your time between them.'],
    ],
  },
  {
    id: 'tech',
    label: 'Should I stay technical?',
    path: [
      ['am-i-technically-dangerous', 'Deep or wide, and when.'],
      ['the-ideal-senior-engineer', 'What good looks like on the other track.'],
      ['i-built-this-blog-with-claude-code', 'Proof you can still ship.'],
    ],
  },
  {
    id: 'doc',
    label: 'Nobody read my doc',
    path: [
      ['ai-made-writing-free', 'The attention tax you just levied.'],
      ['shared-documents-are-not-shared-understanding', 'Why reading it wouldn’t have helped anyway.'],
      ['waist', 'The same rule works on paper.'],
    ],
  },
];

/** The named frameworks from the posts. Their drawings live in app/components/manual/ToolArt.tsx. */
export const TOOLS = [
  { id: 'waist', name: 'W.A.I.S.T.', slug: 'waist', line: 'Why Am I Still Talking. Be the last to speak.' },
  { id: 'boss', name: '25 / 50 / 25', slug: 'the-basic-boss-formula', line: '25% you are the boss. 50% you are the peer. 25% you work for them.' },
  { id: 'two-questions', name: 'Two questions', slug: 'what-level-does-this-task-deserve', line: 'What does it cost if the output is wrong? How can I verify what comes back?' },
  { id: 'deep-wide', name: 'Deep or wide', slug: 'am-i-technically-dangerous', line: 'Going deep vs going wide, and knowing which situation you are in.' },
  { id: 'watermelon', name: 'The watermelon', slug: 'leaders-dont-lie', line: 'Green on the outside, red when you delve into it. Beware of the watermelon.' },
  { id: 'channels', name: 'Up, up, down, down', slug: 'managing-up-up-down-down-left-right', line: 'Weigh the message, then pick how it travels: up, down or sideways.' },
];

/**
 * Every slug the situations and tools point at, with where it came from, for
 * the validator.
 */
export function manualSlugRefs() {
  return [
    ...SITUATIONS.flatMap((s) => s.path.map(([slug]) => ({ slug, from: `situation "${s.id}"` }))),
    ...TOOLS.map((t) => ({ slug: t.slug, from: `tool "${t.id}"` })),
  ];
}

/**
 * Reads `themes: [...]` from a metadata block. Returns null when the key is
 * missing, so the validator can tell "missing" from "empty".
 */
export function parseThemes(metaBlock) {
  const m = metaBlock.match(/\bthemes\s*:\s*\[([^\]]*)\]/);
  if (!m) return null;
  return [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
}
