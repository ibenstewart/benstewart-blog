'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Tool } from '@/lib/manual';
import { ToolArt } from '../manual/ToolArt';

/**
 * Part 2: the named frameworks as cards that flip to their one-line
 * summary. The hidden face is `inert`, so Tab and screen readers only ever
 * meet the face you can see, and focus moves to the face that turns up.
 * With reduced motion the faces swap without turning.
 */
export function Toolkit({ tools, titles }: { tools: Tool[]; titles: Record<string, string> }) {
  const [open, setOpen] = useState<string | null>(null);
  const backs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const fronts = useRef<Record<string, HTMLButtonElement | null>>({});

  const flip = (id: string | null, from?: string) => {
    setOpen(id);
    requestAnimationFrame(() => {
      if (id) backs.current[id]?.focus();
      else if (from) fronts.current[from]?.focus();
    });
  };

  return (
    <section id="toolkit" aria-labelledby="toolkit-title" className="col-bleed scroll-mt-4 border-b-2 border-ink px-[var(--gutter)] py-20 mob:py-14">
      <p className="label text-accent">Part 2 · Toolkit</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h2 id="toolkit-title" className="text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] text-ink">
          Six tools you can steal.
        </h2>
        <p className="text-[1rem] text-faint">Flip a card for the short version.</p>
      </div>
      <ul role="list" className="mt-10 grid grid-cols-3 gap-5 cards:grid-cols-2 mob:grid-cols-1">
        {tools.map((t, i) => {
          const on = open === t.id;
          return (
            <li key={t.id} className="tool-card flip h-[340px] mob:h-[270px]" data-open={on || undefined}>
              <div className="flip-inner relative h-full">
                <button
                  ref={(el) => { fronts.current[t.id] = el; }}
                  type="button"
                  onClick={() => flip(t.id)}
                  aria-expanded={on}
                  inert={on}
                  className="flip-face flip-front absolute inset-0 flex flex-col rounded-3xl border-2 border-ink bg-card p-6 text-left"
                >
                  <span className="label flex w-full justify-between text-faint">
                    <span>Tool {String(i + 1).padStart(2, '0')}</span>
                    <span aria-hidden>Flip ↻</span>
                  </span>
                  <span className="mt-4 min-h-0 w-full flex-1"><ToolArt id={t.id} /></span>
                  <span className="mt-4 text-[1.625rem] font-bold tracking-[-0.02em] text-ink">{t.name}</span>
                </button>
                <div inert={!on} className="flip-face flip-back surface-dark absolute inset-0 flex flex-col rounded-3xl bg-ink p-6 text-paper">
                  <button type="button" onClick={() => flip(null, t.id)} className="label self-end rounded px-1 text-hi">
                    Back <span aria-hidden>↺</span>
                  </button>
                  <p className="mt-4 flex-1 text-[1.625rem] leading-[1.15] font-bold tracking-[-0.02em]">{t.line}</p>
                  <Link
                    ref={(el) => { backs.current[t.id] = el; }}
                    href={`/posts/${t.slug}`}
                    className="text-[0.9375rem] font-medium text-hi underline decoration-2 underline-offset-[0.22em]"
                  >
                    Read “{titles[t.slug]}” <span aria-hidden className="nudge inline-block">→</span>
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
