'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Situation } from '@/lib/manual';
import type { HomeEntry } from './types';

const STEP_LABELS = ['Read first', 'Then', 'If you have time'];

/**
 * Part 1: pick the problem in front of you and get a three-step reading
 * order, plus a "no time" picker by minutes. The first situation renders on
 * the server; `?situation=<id>` (from an entry's "Use this when" chips)
 * picks another after hydration. A polite live region announces the new
 * reading order when it changes.
 */
export function Situations({ situations, entries, count }: { situations: Situation[]; entries: HomeEntry[]; count: number }) {
  const [sit, setSit] = useState(situations[0].id);
  const [minutes, setMinutes] = useState(5);
  const [announce, setAnnounce] = useState('');
  const bySlug = new Map(entries.map((e) => [e.slug, e]));

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('situation');
    if (wanted && situations.some((s) => s.id === wanted)) setSit(wanted);
  }, [situations]);

  const pick = (id: string) => {
    setSit(id);
    const s = situations.find((x) => x.id === id)!;
    const titles = s.path.map(([slug]) => bySlug.get(slug)?.title).filter(Boolean);
    setAnnounce(`Reading order for ${s.label}: ${titles.join(', then ')}.`);
  };

  const current = situations.find((s) => s.id === sit)!;
  const fits = entries
    .filter((e) => !e.draft && e.minutes <= minutes)
    .sort((a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title))
    .slice(0, 6);

  return (
    <section id="situations" aria-labelledby="situations-title" className="col-bleed grid scroll-mt-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)] border-b-2 border-ink tab:grid-cols-1">
      <div className="border-r-2 border-ink px-[var(--gutter)] py-12 tab:border-r-0 tab:border-b-2 mob:py-9">
        <p className="label text-accent">Part 1 · Situations</p>
        <h1 id="situations-title" className="mt-5 text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.92] font-bold tracking-[-0.045em] text-ink">
          What are you <span className="hl">dealing with</span> today?
        </h1>
        <p className="mt-6 max-w-[42ch] text-[1.125rem] leading-[1.5] text-faint">
          I&apos;m Ben Stewart, VP of Engineering at Skyscanner. I&apos;ve written {count} field reports on leading engineering teams through AI. Pick the problem you&apos;ve got and I&apos;ll tell you which ones to read, and in what order.
        </p>
        <ul role="list" className="mt-8 grid gap-2">
          {situations.map((s) => {
            const on = s.id === sit;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => pick(s.id)}
                  aria-pressed={on}
                  aria-controls="reading-order"
                  className={`flex min-h-12 w-full items-center justify-between gap-4 rounded-xl border-2 border-ink px-5 py-3 text-left text-[1.125rem] font-bold transition-[background-color,color,translate] duration-200 hover:translate-x-1 ${
                    on ? 'surface-dark bg-ink text-paper' : 'bg-transparent text-ink hover:bg-hi'
                  }`}
                >
                  {s.label}
                  <span aria-hidden className={on ? 'text-hi' : 'text-faint'}>{on ? '●' : '→'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div id="reading-order" className="surface-dark bg-accent px-[var(--gutter)] py-12 text-white mob:py-9">
        <h2 className="label text-white/85">Reading order · {current.label}</h2>
        <p aria-live="polite" className="sr-only">{announce}</p>
        <ol key={sit} className="mt-6 grid gap-4">
          {current.path.map(([slug, why], i) => {
            const e = bySlug.get(slug);
            if (!e) return null;
            return (
              <li key={slug} className="step-in" style={{ animationDelay: `${i * 110}ms` }}>
                <Link
                  href={`/posts/${slug}?via=${current.id}`}
                  className="group grid grid-cols-[64px_1fr] gap-5 rounded-2xl bg-white/[0.06] p-6 text-white no-underline outline-1 outline-white/25 transition-colors hover:bg-white/10 mob:grid-cols-[44px_1fr] mob:gap-4 mob:p-5"
                >
                  <span aria-hidden className="text-[3.5rem] leading-[0.8] font-bold tracking-[-0.04em] text-hi mob:text-[2.75rem]">{i + 1}</span>
                  <span>
                    <span className="label block text-white/80">{STEP_LABELS[i]} · {e.minutes} min</span>
                    <span className="mt-1.5 block text-[clamp(1.375rem,2.2vw,1.875rem)] leading-[1.05] font-bold tracking-[-0.02em] group-hover:underline">{e.title}</span>
                    <span className="mt-2 block text-[1.0625rem] text-white/90">{why}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 rounded-2xl bg-ink p-6">
          <label htmlFor="minutes" className="flex flex-wrap items-baseline gap-3 text-[1.375rem] font-bold tracking-[-0.02em]">
            No time? I&apos;ve got
            <span className="rounded-md bg-hi px-2 font-mono text-[1.75rem] text-ink">{minutes}</span>
            minutes.
          </label>
          <input
            id="minutes"
            type="range"
            min={2}
            max={12}
            value={minutes}
            onChange={(e) => setMinutes(+e.target.value)}
            aria-valuetext={`${minutes} minutes`}
            className="mt-4 h-6 w-full accent-[var(--hi)]"
          />
          <ul role="list" className="mt-4 grid grid-cols-2 gap-2 mob:grid-cols-1">
            {fits.map((e) => (
              <li key={e.slug}>
                <Link href={`/posts/${e.slug}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-white no-underline hover:bg-white/10">
                  <span className="truncate">{e.title}</span>
                  <span className="shrink-0 font-mono text-white/70">{e.minutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
