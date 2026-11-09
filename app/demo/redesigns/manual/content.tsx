import type { ReactNode } from 'react';
import type { ConceptPost, ThemeId } from '../_lib/data';

/**
 * Shared Field manual content: palette, situations (reading orders), tools and
 * the manual numbering. The situation lines and tool summaries are draft copy
 * written for this concept.
 */
export const BG = '#F6F5F0';
export const INK = '#0E0F12';
export const GREY = '#5C5F66';
export const BLUE = '#003593';
export const HI = '#FFD84A';
export const mono = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' } as const;

/* Situations: the reading paths are a proposal, written for this concept. */
export const SITUATIONS: { id: string; label: string; path: [string, string][] }[] = [
  { id: 'fire', label: "Something's on fire", path: [
    ['you-cant-hum-while-holding-your-nose', 'Read this mid-incident. Lead, don’t hero.'],
    ['practical-postmortems', 'Read this the day after, before anyone writes the timeline.'],
    ['leaders-dont-lie', 'Read this before you tell the exec team how it went.'],
  ] },
  { id: 'ai', label: "I'm about to hand work to AI", path: [
    ['what-level-does-this-task-deserve', 'The two questions to ask first.'],
    ['ralph-isnt-the-point', 'Why the spec matters more than the tool.'],
    ['multi-agent-ai-strategy', 'Where it goes when you push it properly.'],
  ] },
  { id: 'talk', label: 'I talk too much in meetings', path: [
    ['waist', 'Four letters to stick on your monitor.'],
    ['meeting-rooms-are-now-free', 'Why there are so many meetings to talk in.'],
    ['managing-up-up-down-down-left-right', 'Pick the right channel instead.'],
  ] },
  { id: 'empty', label: "I'm running on empty", path: [
    ['so-i-think-i-burned-out', 'The one I wish I’d read earlier.'],
    ['sustainable', 'Pace when everything got faster.'],
    ['end-of-year-manager-checklist', 'Reset the calendar that got you here.'],
  ] },
  { id: 'new', label: "I've just become a manager", path: [
    ['the-invisible-manager', 'What the job actually is.'],
    ['am-i-jealous-of-my-team', 'The feeling nobody warns you about.'],
    ['the-basic-boss-formula', 'How to split your time between them.'],
  ] },
  { id: 'tech', label: 'Should I stay technical?', path: [
    ['am-i-technically-dangerous', 'Deep or wide, and when.'],
    ['the-ideal-senior-engineer', 'What good looks like on the other track.'],
    ['i-built-this-blog-with-claude-code', 'Proof you can still ship.'],
  ] },
  { id: 'doc', label: 'Nobody read my doc', path: [
    ['ai-made-writing-free', 'The attention tax you just levied.'],
    ['shared-documents-are-not-shared-understanding', 'Why reading it wouldn’t have helped anyway.'],
    ['waist', 'The same rule works on paper.'],
  ] },
];

export const TOOLS: { name: string; slug: string; line: string; art: ReactNode }[] = [
  { name: 'W.A.I.S.T.', slug: 'waist', line: 'Why Am I Still Talking. Be the last to speak.', art: (
    <div className="flex h-full flex-col justify-center gap-0.5 text-[30px] font-bold leading-[0.95] tracking-[-0.02em]">
      {['Why', 'Am', 'I', 'Still', 'Talking'].map((w) => <span key={w}><span style={{ background: HI }}>{w[0]}</span>{w.slice(1)}</span>)}
    </div>
  ) },
  { name: '25 / 50 / 25', slug: 'the-basic-boss-formula', line: '25% you are the boss. 50% you are the peer. 25% you work for them.', art: (
    <svg viewBox="0 0 200 200" className="mx-auto h-full">
      {[[0, 25, INK], [25, 75, BLUE], [75, 100, HI]].map(([a, b, c], i) => {
        const r = 70, C = 2 * Math.PI * r;
        return <circle key={i} className="fm-donut" cx="100" cy="100" r={r} fill="none" stroke={c as string} strokeWidth="34"
          strokeDasharray={`${(((b as number) - (a as number)) / 100) * C - 3} ${C}`} strokeDashoffset={-((a as number) / 100) * C} transform="rotate(-90 100 100)" />;
      })}
      <text x="100" y="108" textAnchor="middle" fontSize="22" fontWeight="700" fill={INK}>you</text>
    </svg>
  ) },
  { name: 'Two questions', slug: 'what-level-does-this-task-deserve', line: 'What does it cost if the output is wrong? How can I verify what comes back?', art: (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-1.5 text-[13px] font-bold" style={mono}>
      <div className="rounded-lg p-3" style={{ background: HI }}>Cheap if wrong<br />Easy to check</div>
      <div className="rounded-lg border-2 p-3" style={{ borderColor: INK }}>Costly if wrong<br />Easy to check</div>
      <div className="rounded-lg border-2 p-3" style={{ borderColor: INK }}>Cheap if wrong<br />Hard to check</div>
      <div className="rounded-lg p-3 text-white" style={{ background: INK }}>Costly if wrong<br />Hard to check</div>
    </div>
  ) },
  { name: 'Deep or wide', slug: 'am-i-technically-dangerous', line: 'Going deep vs going wide, and knowing which situation you are in.', art: (
    <svg viewBox="0 0 200 200" className="mx-auto h-full">
      <rect className="fm-grow" x="20" y="40" width="160" height="26" fill={BLUE} />
      <rect className="fm-grow-y" x="87" y="66" width="26" height="114" fill={INK} />
      <text x="100" y="32" textAnchor="middle" fontSize="14" fill={GREY} style={mono}>wide</text>
      <text x="124" y="150" fontSize="14" fill={GREY} style={mono}>deep</text>
    </svg>
  ) },
  { name: 'The watermelon', slug: 'leaders-dont-lie', line: 'Green on the outside, red when you delve into it. Beware of the watermelon.', art: (
    <svg viewBox="0 0 200 200" className="mx-auto h-full">
      <circle cx="100" cy="100" r="80" fill="#2E9E5B" />
      <circle className="fm-reveal" cx="100" cy="100" r="66" fill="#E8484F" />
      {[[80, 80], [120, 90], [95, 120], [70, 110], [125, 125]].map(([x, y], i) => <ellipse key={i} className="fm-reveal" cx={x} cy={y} rx="4" ry="7" fill={INK} />)}
    </svg>
  ) },
  { name: 'Up, up, down, down', slug: 'managing-up-up-down-down-left-right', line: 'Weigh the message, then pick how it travels: up, down or sideways.', art: (
    <div className="flex h-full items-center justify-center gap-2 text-[40px] font-bold">
      {['↑', '↑', '↓', '↓', '←', '→'].map((a, i) => (
        <span key={i} className="fm-key grid h-14 w-12 place-items-center rounded-lg border-2" style={{ borderColor: INK, animationDelay: `${i * 160}ms`, borderBottomWidth: 5 }}>{a}</span>
      ))}
    </div>
  ) },
];

/** Where a post opens in the Field manual demo. */
export const entryHref = (slug: string) => `/demo/redesigns/manual/${slug}`;

export type Theme = { id: ThemeId; name: string; colour: string };

/**
 * Chapters in manual order. A post lives in the chapter of its first theme and
 * is numbered by date within it, so new posts append (2.6 stays 2.6).
 */
export function chapters(posts: ConceptPost[], themes: Theme[]) {
  return themes.map((theme, ci) => {
    const entries = posts
      .filter((p) => p.themes[0] === theme.id)
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.title.localeCompare(b.title))
      .map((post, i) => ({ post, number: `${ci + 1}.${i + 1}` }));
    return { theme, number: ci + 1, entries };
  });
}

export const FOOTER_LINKS: [string, string][] = [
  ['all entries', '/demo/redesigns/manual/entries'],
  ['speaking', '/demo/redesigns/manual/speaking'],
  ['rss', '/feed.xml'],
  ['github', 'https://github.com/ibenstewart'],
  ['x', 'https://x.com/benstewart__'],
  ['linkedin', 'https://www.linkedin.com/in/ben-stewart-90944595/'],
  ['contact', 'mailto:ben@benstewart.ai'],
];

/** Motion and card CSS shared by the home page and entries. */
export const MANUAL_CSS = `
        .fm-step { animation: fm-in .55s cubic-bezier(.16,1,.3,1) both; }
        @keyframes fm-in { from { opacity: 0; transform: translateX(-18px); } }
        .fm-card { perspective: 1200px; }
        .fm-inner { transition: transform .7s cubic-bezier(.16,1,.3,1); transform-style: preserve-3d; }
        .fm-card[data-flip="true"] .fm-inner { transform: rotateY(180deg); }
        .fm-face { backface-visibility: hidden; }
        .fm-back { transform: rotateY(180deg); }
        .fm-card:hover .fm-donut { stroke-width: 40; }
        .fm-donut { transition: stroke-width .3s; }
        .fm-key { animation: fm-press 3.2s ease-in-out infinite; }
        @keyframes fm-press { 0%, 12%, 100% { transform: none; } 6% { transform: translateY(4px); } }
        .fm-reveal { transition: transform .5s cubic-bezier(.16,1,.3,1); transform-origin: 100px 100px; transform: scale(.0); }
        .fm-card:hover .fm-reveal, .fm-card:focus-within .fm-reveal { transform: scale(1); }
        .fm-bar { transition: width .8s cubic-bezier(.16,1,.3,1); }
        .fm-hl { background: linear-gradient(${HI}, ${HI}) 0 85% / 100% 38% no-repeat; }
        @media (prefers-reduced-motion: reduce) {
          .fm-step, .fm-key { animation: none; }
          .fm-inner { transition: none; }
          .fm-card[data-flip="true"] .fm-inner { transform: none; }
          .fm-card[data-flip="true"] .fm-front { visibility: hidden; }
          .fm-back { transform: none; }
          .fm-card:not([data-flip="true"]) .fm-back { visibility: hidden; }
          .fm-reveal { transform: scale(1); transition: none; }
        }
      `;
