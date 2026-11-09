'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type OrderView = {
  id: string;
  label: string;
  step: number;
  items: { slug: string; title: string; number: string; minutes: number; why: string }[];
};
export type ChapterNextView = { chapter: string; number: string; slug: string; title: string; subtitle: string | null };

const STATES = {
  done: { tag: 'Before this', card: 'border-ink bg-transparent text-faint', tagColour: 'text-accent' },
  here: { tag: "You're here", card: 'surface-dark border-ink bg-ink text-white', tagColour: 'text-hi' },
  next: { tag: 'Next', card: 'surface-dark border-accent bg-accent text-white', tagColour: 'text-hi' },
  later: { tag: 'After that', card: 'border-ink bg-card text-ink', tagColour: 'text-accent' },
} as const;

/**
 * What to read next. A post on a reading order shows that order with this
 * post marked; the home page's situation links add `?via=<id>`, so a reader
 * who arrived from one situation sees that one. Everything else gets the
 * next entry in its chapter. The server renders the default, so nothing
 * waits for script.
 */
export function NextStep({ orders, chapterNext }: { orders: OrderView[]; chapterNext: ChapterNextView | null }) {
  const [via, setVia] = useState(orders[0]?.id ?? null);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('via');
    if (wanted && orders.some((o) => o.id === wanted)) setVia(wanted);
  }, [orders]);

  const order = orders.find((o) => o.id === via);
  const chapterBlock = chapterNext && (
    <div>
      <h2 className="label text-accent">Next in {chapterNext.chapter}</h2>
      <Link
        href={`/posts/${chapterNext.slug}`}
        className="surface-dark group mt-6 grid max-w-[720px] grid-cols-[auto_1fr] items-center gap-6 rounded-3xl bg-accent p-7 text-white no-underline transition-transform hover:-translate-y-1 mob:grid-cols-1 mob:gap-3"
      >
        <span className="font-mono text-[2.125rem] font-bold text-hi">{chapterNext.number}</span>
        <span>
          <span className="block text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.05] font-bold tracking-[-0.02em] group-hover:underline">{chapterNext.title}</span>
          {chapterNext.subtitle && <span className="mt-2 block text-[1rem] opacity-85">{chapterNext.subtitle}</span>}
        </span>
      </Link>
    </div>
  );

  if (order) {
    const last = order.step === order.items.length - 1;
    const others = orders.filter((o) => o.id !== order.id);
    return (
      <div>
        <h2 className="label text-accent">
          Reading order · {order.label} · step {order.step + 1} of {order.items.length}
        </h2>
        <ol className="mt-6 grid grid-cols-3 gap-4 cards:grid-cols-1">
          {order.items.map((it, i) => {
            const state = i < order.step ? 'done' : i === order.step ? 'here' : i === order.step + 1 ? 'next' : 'later';
            const s = STATES[state];
            return (
              <li key={it.slug}>
                <Link
                  href={`/posts/${it.slug}?via=${order.id}`}
                  aria-current={state === 'here' ? 'page' : undefined}
                  className={`group flex h-full flex-col rounded-3xl border-2 p-6 no-underline transition-transform hover:-translate-y-1 ${s.card}`}
                >
                  <span className="label flex items-center justify-between gap-3">
                    <span className={s.tagColour}>{s.tag}</span>
                    <span className="opacity-80">Entry {it.number} · {it.minutes} min</span>
                  </span>
                  <span className="mt-4 text-[clamp(1.375rem,2.2vw,1.75rem)] leading-[1.08] font-bold tracking-[-0.02em] group-hover:underline">
                    {it.title}
                  </span>
                  <span className="mt-2 text-[1rem] opacity-85">{it.why}</span>
                  {state === 'next' && <span aria-hidden className="nudge mt-5 text-[1.75rem] font-bold text-hi">→</span>}
                </Link>
              </li>
            );
          })}
        </ol>
        {others.length > 0 && (
          <p className="mt-6 text-[0.9375rem] text-faint">
            Also on the reading order for{' '}
            {others.map((o, i) => (
              <span key={o.id}>
                {i ? ', ' : ''}
                <button type="button" onClick={() => setVia(o.id)} className="text-ink underline decoration-accent decoration-2 underline-offset-[0.22em] hover:bg-hi">
                  {o.label.toLowerCase()}
                </button>
              </span>
            ))}
            .
          </p>
        )}
        {last && chapterBlock && <div className="mt-12">{chapterBlock}</div>}
      </div>
    );
  }

  return chapterBlock || null;
}
