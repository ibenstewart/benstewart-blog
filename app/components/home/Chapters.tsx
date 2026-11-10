'use client';

import Link from 'next/link';
import type { Theme } from '@/lib/manual';
import { useReadList } from '../manual/readState';
import type { HomeEntry } from './types';

export type ChapterView = { theme: Theme; number: number; entries: HomeEntry[] };

/**
 * Part 3: every entry by chapter, with a tick box per entry and a progress
 * bar per chapter. Ticks live in this browser only (see readState).
 */
export function Chapters({ chapters, total }: { chapters: ChapterView[]; total: number }) {
  const { read, toggle } = useReadList();
  const readCount = chapters.flatMap((c) => c.entries).filter((e) => read.includes(e.slug)).length;

  return (
    <section id="chapters" aria-labelledby="chapters-title" className="col-bleed scroll-mt-4 px-[var(--gutter)] py-20 mob:py-14">
      <p className="label text-accent">Part 3 · Chapters</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 id="chapters-title" className="text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] text-ink">The whole manual.</h2>
          <p className="mt-4 text-[1.0625rem]">
            <Link href="/posts" className="font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:bg-hi">
              Prefer it by date? See every entry, newest first
            </Link>
          </p>
        </div>
        <div className="min-w-[260px]">
          <p className="font-mono text-[0.9375rem] text-ink">You&apos;ve read {readCount} of {total}</p>
          <div
            role="progressbar"
            aria-label="Entries read"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={readCount}
            className="mt-2 h-3 overflow-hidden rounded-full bg-ink/10"
          >
            <div className="grow-bar h-full rounded-full bg-accent" style={{ width: `${(readCount / total) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-10 columns-3 gap-4 tab:columns-2 mob:columns-1">
        {chapters.map(({ theme, number, entries }) => {
          const done = entries.filter((e) => read.includes(e.slug)).length;
          return (
            <section key={theme.id} aria-labelledby={`ch-${theme.id}`} className="mb-4 break-inside-avoid rounded-3xl border-2 border-ink p-6">
              <p className="label text-faint">Chapter {number}</p>
              <h3 id={`ch-${theme.id}`} className="mt-1 text-[1.625rem] leading-[1.05] font-bold tracking-[-0.02em] text-ink">{theme.name}</h3>
              <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div className="grow-bar h-full" style={{ width: `${entries.length ? (done / entries.length) * 100 : 0}%`, background: theme.colour }} />
              </div>
              <ul role="list" className="mt-5 grid gap-2.5">
                {entries.map((e) => {
                  const isRead = read.includes(e.slug);
                  return (
                    <li key={e.slug} className="grid grid-cols-[24px_1fr] items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggle(e.slug)}
                        aria-pressed={isRead}
                        aria-label={`Read: ${e.title}`}
                        className={`tick mt-px grid h-6 w-6 place-items-center rounded-md border-2 border-ink text-[0.8125rem] font-bold transition-colors ${isRead ? 'bg-ink text-hi' : 'bg-transparent text-ink hover:bg-hi'}`}
                      >
                        <span aria-hidden>{isRead ? '✓' : ''}</span>
                      </button>
                      <Link
                        href={`/posts/${e.slug}`}
                        className={`text-[1.0625rem] leading-[1.35] font-medium no-underline hover:underline ${isRead ? 'text-faint line-through' : 'text-ink'}`}
                      >
                        <span className="mr-2 font-mono text-[0.8125rem] text-accent">{e.number}</span>
                        {e.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
