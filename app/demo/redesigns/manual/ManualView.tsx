'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ConceptPost } from '../_lib/data';
import { BG, BLUE, GREY, HI, INK, MANUAL_CSS, SITUATIONS, TOOLS, chapters, entryHref, mono, type Theme } from './content';
import { ManualFooter, ManualTopBar } from './chrome';


export function ManualView({ posts, themes }: { posts: ConceptPost[]; themes: Theme[] }) {
  const [sit, setSit] = useState(SITUATIONS[0].id);
  const [minutes, setMinutes] = useState(5);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [read, setRead] = useState<string[]>([]);
  const bySlug = (s: string) => posts.find((p) => p.slug === s)!;

  useEffect(() => {
    try { setRead(JSON.parse(localStorage.getItem('fm-read') ?? '[]')); } catch {}
    const fromHash = SITUATIONS.find((s) => `#${s.id}` === window.location.hash);
    if (fromHash) setSit(fromHash.id);
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
      <style>{MANUAL_CSS}</style>

      <ManualTopBar />

      {/* Part 1: Situations */}
      <section id="situations" className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] border-b-2 tab:grid-cols-1" style={{ borderColor: INK }}>
        <div className="border-r-2 p-10 tab:border-r-0 tab:border-b-2 mob:p-6" style={{ borderColor: INK }}>
          <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>PART 1 · SITUATIONS</p>
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
                  <Link href={entryHref(slug)} className="group grid grid-cols-[64px_1fr] gap-5 rounded-2xl p-6 no-underline transition-colors hover:bg-white/10"
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
                  <Link href={entryHref(p.slug)} className="flex justify-between gap-3 rounded-lg px-3 py-2 text-[15px] font-medium no-underline hover:bg-white/10" style={{ color: '#fff' }}>
                    <span className="truncate">{p.title}</span><span className="shrink-0 opacity-60" style={mono}>{p.readingMinutes}m</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Part 2: Toolkit */}
      <section id="toolkit" className="border-b-2 px-10 py-20 mob:px-6" style={{ borderColor: INK }}>
        <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>PART 2 · TOOLKIT</p>
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
                    <Link href={entryHref(t.slug)} className="text-[15px] font-medium" style={{ color: HI }}>
                      Read “{bySlug(t.slug).title}” →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Part 3: Chapters */}
      <section id="chapters" className="px-10 py-20 mob:px-6">
        <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>PART 3 · CHAPTERS</p>
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
          {chapters(posts, themes).map(({ theme: t, number, entries }) => {
            const list = entries.map((e) => e.post);
            const done = list.filter((p) => read.includes(p.slug)).length;
            return (
              <div key={t.id} className="rounded-3xl border-2 p-5" style={{ borderColor: INK }}>
                <p className="text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>CHAPTER {number}</p>
                <h3 className="mt-1 text-[22px] font-bold leading-[1.05] tracking-[-0.02em]">{t.name}</h3>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(14,15,18,.1)' }}>
                  <div className="fm-bar h-full" style={{ width: `${list.length ? (done / list.length) * 100 : 0}%`, background: t.colour }} />
                </div>
                <ul className="mt-4 grid gap-2.5">
                  {entries.map(({ post: p, number: n }) => {
                    const isRead = read.includes(p.slug);
                    return (
                      <li key={p.slug} className="grid grid-cols-[22px_1fr] gap-2.5">
                        <button onClick={() => toggleRead(p.slug)} aria-pressed={isRead} aria-label={`Mark ${p.title} as read`}
                          className="mt-0.5 grid h-[20px] w-[20px] place-items-center rounded-md border-2 text-[12px] font-bold transition-colors"
                          style={{ borderColor: INK, background: isRead ? INK : 'transparent', color: HI }}>{isRead ? '✓' : ''}</button>
                        <Link href={entryHref(p.slug)} className="text-[15px] font-medium leading-[1.3] no-underline hover:underline"
                          style={{ color: isRead ? GREY : INK, textDecoration: isRead ? 'line-through' : undefined }}>
                          <span className="mr-1.5 text-[12px]" style={{ ...mono, color: t.colour }}>{n}</span>{p.title}
                          {p.draft && <span className="ml-1.5 rounded px-1.5 py-0.5 align-middle text-[10px] tracking-[0.08em]" style={{ ...mono, background: HI, color: INK }}>DRAFT</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <ManualFooter status={`GLASGOW · REVISION ${posts.length} · YOU'VE READ ${read.length} OF ${posts.length}`} />
    </div>
  );
}
