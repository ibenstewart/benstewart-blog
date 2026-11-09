'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import type { ConceptPost, ThemeId } from '../_lib/data';
import { SceneFooter } from '../_lib/SceneFooter';

type Theme = { id: ThemeId; name: string; colour: string };

const BG = '#F6F5F0';
const INK = '#0E0F12';
const GREY = '#5C5F66';
const BLUE = '#1740D8';
const HI = '#FFD84A';
const mono = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' } as const;

/* Situations: the reading paths are a proposal, written for this concept. */
const SITUATIONS: { id: string; label: string; path: [string, string][] }[] = [
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

const TOOLS: { name: string; slug: string; line: string; art: ReactNode }[] = [
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

export function ManualView({ posts, themes }: { posts: ConceptPost[]; themes: Theme[] }) {
  const [sit, setSit] = useState(SITUATIONS[0].id);
  const [minutes, setMinutes] = useState(5);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const bySlug = (s: string) => posts.find((p) => p.slug === s)!;

  useEffect(() => {
    try { setRead(JSON.parse(localStorage.getItem('fm-read') ?? '[]')); } catch {}
  }, []);
  const toggleRead = (slug: string) => {
    const next = read.includes(slug) ? read.filter((s) => s !== slug) : [...read, slug];
    setRead(next);
    try { localStorage.setItem('fm-read', JSON.stringify(next)); } catch {}
  };

  const current = SITUATIONS.find((s) => s.id === sit)!;
  const fits = posts.filter((p) => p.readingMinutes <= minutes).sort((a, b) => b.readingMinutes - a.readingMinutes).slice(0, 6);

  return (
    <div className="rd-root fm min-h-screen" style={{ background: BG, color: INK }}>
      <style>{`
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
      `}</style>

      {/* Top bar */}
      <header className="flex items-center justify-between border-b-2 px-6 py-4" style={{ borderColor: INK }}>
        <Link href="/demo/redesigns" className="text-[20px] font-bold tracking-[-0.03em] no-underline" style={{ color: INK }}>
          Ben Stewart <span className="ml-2 rounded px-2 py-0.5 align-middle text-[12px] tracking-[0.08em]" style={{ ...mono, background: INK, color: BG }}>FIELD MANUAL</span>
        </Link>
        <nav className="flex gap-5 text-[14px] font-medium mob:hidden" style={{ ...mono, color: GREY }}>
          <span>§1 situations</span><span>§2 toolkit</span><span>§3 chapters</span><span>bio</span>
        </nav>
      </header>

      {/* §1 Situations */}
      <section className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] border-b-2 tab:grid-cols-1" style={{ borderColor: INK }}>
        <div className="border-r-2 p-10 tab:border-r-0 tab:border-b-2 mob:p-6" style={{ borderColor: INK }}>
          <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>§1 · SITUATIONS</p>
          <h1 className="mt-5 text-[clamp(44px,5.6vw,84px)] font-bold leading-[0.92] tracking-[-0.045em]">
            What are you <span className="fm-hl">dealing with</span> today?
          </h1>
          <p className="mt-6 max-w-[42ch] text-[18px] leading-[1.5]" style={{ color: GREY }}>
            {posts.length} field reports on leading engineers and working with AI, sorted by the problem in front of you rather than the date I wrote them.
          </p>
          <ul className="mt-8 grid gap-2">
            {SITUATIONS.map((s) => {
              const on = s.id === sit;
              return (
                <li key={s.id}>
                  <button onClick={() => setSit(s.id)} aria-pressed={on}
                    className="flex w-full items-center justify-between rounded-xl border-2 px-5 py-3.5 text-left text-[18px] font-bold transition-[background,color,transform] duration-200 hover:translate-x-1"
                    style={{ borderColor: INK, background: on ? INK : 'transparent', color: on ? BG : INK }}>
                    {s.label}<span aria-hidden style={{ color: on ? HI : GREY }}>{on ? '●' : '→'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-10 mob:p-6" style={{ background: BLUE, color: '#fff' }}>
          <p className="text-[13px] tracking-[0.1em] opacity-80" style={mono}>READING ORDER · {current.label.toUpperCase()}</p>
          <ol key={sit} className="mt-6 grid gap-4">
            {current.path.map(([slug, why], i) => {
              const p = bySlug(slug);
              return (
                <li key={slug} className="fm-step" style={{ animationDelay: `${i * 110}ms` }}>
                  <Link href={`/posts/${slug}`} className="group grid grid-cols-[64px_1fr] gap-5 rounded-2xl p-6 no-underline transition-colors hover:bg-white/10"
                    style={{ color: '#fff', background: 'rgba(255,255,255,.06)', outline: '1px solid rgba(255,255,255,.22)' }}>
                    <span className="text-[56px] font-bold leading-[0.8] tracking-[-0.04em]" style={{ color: HI }}>{i + 1}</span>
                    <span>
                      <span className="block text-[13px] tracking-[0.08em] opacity-75" style={mono}>{['READ FIRST', 'THEN', 'IF YOU HAVE TIME'][i]} · {p.readingMinutes} MIN</span>
                      <span className="mt-1.5 block text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.05] tracking-[-0.02em] group-hover:underline">{p.title}</span>
                      <span className="mt-2 block text-[17px] opacity-85">{why}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 rounded-2xl p-6" style={{ background: INK }}>
            <label className="flex flex-wrap items-baseline gap-3 text-[22px] font-bold tracking-[-0.02em]">
              No time? I&apos;ve got
              <span className="rounded-md px-2 text-[28px]" style={{ background: HI, color: INK, ...mono }}>{minutes}</span>
              minutes.
            </label>
            <input type="range" min={2} max={12} value={minutes} onChange={(e) => setMinutes(+e.target.value)} className="mt-4 w-full accent-[#FFD84A]" aria-label="Minutes available" />
            <ul className="mt-4 grid grid-cols-2 gap-2 mob:grid-cols-1">
              {fits.map((p) => (
                <li key={p.slug} className="fm-step">
                  <Link href={`/posts/${p.slug}`} className="flex justify-between gap-3 rounded-lg px-3 py-2 text-[15px] font-medium no-underline hover:bg-white/10" style={{ color: '#fff' }}>
                    <span className="truncate">{p.title}</span><span className="shrink-0 opacity-60" style={mono}>{p.readingMinutes}m</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* §2 Toolkit */}
      <section className="border-b-2 px-10 py-20 mob:px-6" style={{ borderColor: INK }}>
        <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>§2 · TOOLKIT</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(36px,4.4vw,64px)] font-bold leading-[0.95] tracking-[-0.04em]">Six tools you can steal.</h2>
          <p className="text-[16px]" style={{ color: GREY }}>Tap a card to flip it.</p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-5 cards:grid-cols-2 mob:grid-cols-1">
          {TOOLS.map((t, i) => {
            const on = flipped === t.name;
            return (
              <div key={t.name} className="fm-card h-[340px]" data-flip={on}>
                <div className="fm-inner relative h-full">
                  <button onClick={() => setFlipped(on ? null : t.name)} aria-pressed={on}
                    className="fm-face fm-front absolute inset-0 flex flex-col rounded-3xl border-2 p-6 text-left" style={{ borderColor: INK, background: '#fff' }}>
                    <span className="flex justify-between text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}><span>TOOL {String(i + 1).padStart(2, '0')}</span><span>FLIP ↻</span></span>
                    <span className="mt-4 min-h-0 flex-1">{t.art}</span>
                    <span className="mt-4 text-[26px] font-bold tracking-[-0.02em]">{t.name}</span>
                  </button>
                  <div className="fm-face fm-back absolute inset-0 flex flex-col rounded-3xl p-6" style={{ background: INK, color: BG }}>
                    <button onClick={() => setFlipped(null)} className="self-end text-[12px] tracking-[0.1em]" style={{ ...mono, color: HI }}>BACK ↺</button>
                    <p className="mt-4 flex-1 text-[26px] font-bold leading-[1.15] tracking-[-0.02em]">{t.line}</p>
                    <Link href={`/posts/${t.slug}`} className="text-[15px] font-medium" style={{ color: HI }}>
                      Read “{bySlug(t.slug).title}” →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* §3 Chapters */}
      <section className="px-10 py-20 mob:px-6">
        <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>§3 · CHAPTERS</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[clamp(36px,4.4vw,64px)] font-bold leading-[0.95] tracking-[-0.04em]">The whole manual.</h2>
          <div className="min-w-[260px]">
            <p className="text-[15px] font-medium" style={mono}>You&apos;ve read {read.length} of {posts.length}</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full" style={{ background: 'rgba(14,15,18,.1)' }}>
              <div className="fm-bar h-full rounded-full" style={{ width: `${(read.length / posts.length) * 100}%`, background: BLUE }} />
            </div>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-5 gap-4 tab:grid-cols-2 mob:grid-cols-1">
          {themes.map((t, ci) => {
            const list = posts.filter((p) => p.themes[0] === t.id);
            const done = list.filter((p) => read.includes(p.slug)).length;
            return (
              <div key={t.id} className="rounded-3xl border-2 p-5" style={{ borderColor: INK }}>
                <p className="text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>CHAPTER {ci + 1}</p>
                <h3 className="mt-1 text-[22px] font-bold leading-[1.05] tracking-[-0.02em]">{t.name}</h3>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(14,15,18,.1)' }}>
                  <div className="fm-bar h-full" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%`, background: t.colour }} />
                </div>
                <ul className="mt-4 grid gap-2.5">
                  {list.map((p) => {
                    const isRead = read.includes(p.slug);
                    return (
                      <li key={p.slug} className="grid grid-cols-[22px_1fr] gap-2.5">
                        <button onClick={() => toggleRead(p.slug)} aria-pressed={isRead} aria-label={`Mark ${p.title} as read`}
                          className="mt-0.5 grid h-[20px] w-[20px] place-items-center rounded-md border-2 text-[12px] font-bold transition-colors"
                          style={{ borderColor: INK, background: isRead ? INK : 'transparent', color: HI }}>{isRead ? '✓' : ''}</button>
                        <Link href={`/posts/${p.slug}`} className="text-[15px] font-medium leading-[1.3] no-underline hover:underline"
                          style={{ color: isRead ? GREY : INK, textDecoration: isRead ? 'line-through' : undefined }}>{p.title}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer: out in the field */}
      <SceneFooter src="/images/footer/mesas.jpg" sky="#003593" className="border-t-2" style={{ borderColor: INK }}>
        <div className="px-10 pt-16 mob:px-6" style={{ color: '#fff' }}>
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <p className="text-[clamp(32px,4vw,56px)] font-bold leading-none tracking-[-0.04em]">
                Ben Stewart <span className="ml-1 rounded px-2 py-1 align-middle text-[13px] tracking-[0.08em]" style={{ ...mono, background: HI, color: INK }}>FIELD MANUAL</span>
              </p>
              <p className="mt-4 text-[13px] tracking-[0.1em] opacity-80" style={mono}>GLASGOW · REVISION {posts.length} · YOU&apos;VE READ {read.length} OF {posts.length}</p>
            </div>
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-2">
                {[['posts', '/posts'], ['rss', '/feed.xml'], ['github', 'https://github.com/ibenstewart'], ['x', 'https://x.com/benstewart__'], ['linkedin', 'https://www.linkedin.com/in/ben-stewart-90944595/'], ['contact', 'mailto:ben@benstewart.ai']].map(([n, href]) => (
                  <li key={n}>
                    <a href={href} className="inline-flex h-11 items-center rounded-xl border-2 px-4 text-[16px] font-bold no-underline transition-colors hover:bg-white hover:text-[#003593]" style={{ borderColor: 'rgba(255,255,255,.55)', color: '#fff' }}>{n}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </SceneFooter>
    </div>
  );
}
