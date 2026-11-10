'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { textLinkClass } from '../TextLink';

export type StepView = { label: string; slug: string; href: string; number: string; title: string; line: string | null };
export type OrderStepView = StepView & { id: string };
export type RelatedView = { slug: string; number: string; title: string; minutes: number };

/**
 * The one thing to read next, with the hand-picked entries beside it as
 * plain links. A post on a reading order points at the next step of that
 * order; the home page's situation links add `?via=<id>`, so a reader who
 * arrived from one situation carries on down that one. Everything else gets
 * `fallback` (next in its chapter, or failing that another entry). The
 * server renders the default, so nothing waits for script.
 */
export function NextStep({
  orderSteps,
  finished,
  fallback,
  related,
}: {
  orderSteps: OrderStepView[];
  /** Reading orders this post is the last step of. */
  finished: string[];
  fallback: StepView | null;
  related: RelatedView[];
}) {
  const [via, setVia] = useState<string | null>(null);

  useEffect(() => {
    setVia(new URLSearchParams(window.location.search).get('via'));
  }, []);

  const next = (via && finished.includes(via) ? null : orderSteps.find((o) => o.id === via) ?? orderSteps[0]) ?? fallback;
  const also = related.filter((r) => r.slug !== next?.slug);
  if (!next && also.length === 0) return null;

  return (
    <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-x-16 gap-y-12 cards:grid-cols-1">
      {next && (
        <div>
          <h2 className="label text-accent">{next.label}</h2>
          <Link
            href={next.href}
            className="surface-dark group mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-3xl bg-accent p-7 text-white no-underline transition-transform hover:-translate-y-1 mob:grid-cols-[1fr_auto] mob:gap-x-4 mob:gap-y-2 mob:p-6"
          >
            <span className="font-mono text-[2.125rem] font-bold text-hi mob:col-span-2 mob:text-[1.5rem]">{next.number}</span>
            <span>
              <span className="block text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.05] font-bold tracking-[-0.02em] group-hover:underline">{next.title}</span>
              {next.line && <span className="mt-2 block text-[1rem] leading-[1.45] text-white/90">{next.line}</span>}
            </span>
            <span aria-hidden className="nudge text-[1.75rem] font-bold text-hi">→</span>
          </Link>
        </div>
      )}
      {also.length > 0 && (
        <div>
          <h2 className="label text-accent">Also worth a read</h2>
          <ul role="list" className="mt-5 grid gap-4">
            {also.map((r) => (
              <li key={r.slug} className="text-[1.125rem] leading-[1.35]">
                <Link href={`/posts/${r.slug}`} className={`font-bold ${textLinkClass}`}>{r.title}</Link>
                <span className="label ml-3 whitespace-nowrap text-faint mob:mt-1 mob:ml-0 mob:block">{r.number} · {r.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
