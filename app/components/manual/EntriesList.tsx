'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useReadList } from './readState';

export type EntryRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  date: string | null;
  number: string;
  chapter: string;
  colour: string;
  minutes: number;
  imported: boolean;
};

const short = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : '';

/**
 * Every published entry by date, newest or oldest first, grouped by year,
 * with the reader's read ticks. Rows arrive newest first from the server.
 */
export function EntriesList({ rows }: { rows: EntryRow[] }) {
  const [oldest, setOldest] = useState(false);
  const { read } = useReadList();
  const readCount = rows.filter((r) => read.includes(r.slug)).length;

  const years = useMemo(() => {
    const sorted = oldest ? [...rows].reverse() : rows;
    const out: [string, EntryRow[]][] = [];
    for (const r of sorted) {
      const y = r.date?.slice(0, 4) ?? 'Undated';
      if (out.at(-1)?.[0] !== y) out.push([y, []]);
      out.at(-1)![1].push(r);
    }
    return out;
  }, [rows, oldest]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[0.9375rem] text-ink">
          {rows.length} entries · you&apos;ve read {readCount}
        </p>
        <div role="group" aria-label="Order" className="inline-flex rounded-xl border-2 border-ink p-1">
          {([['Newest first', false], ['Oldest first', true]] as const).map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setOldest(value)}
              aria-pressed={oldest === value}
              className={`h-9 rounded-lg px-4 text-[0.875rem] font-bold transition-colors ${oldest === value ? 'surface-dark bg-ink text-hi' : 'text-ink hover:bg-hi'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {years.map(([year, list]) => (
        <section key={year} className="mt-12" aria-labelledby={`y-${year}`}>
          <h2 id={`y-${year}`} className="flex items-baseline gap-4 border-b-2 border-ink pb-3 text-[clamp(2rem,3.6vw,3rem)] leading-none font-bold tracking-[-0.04em] text-ink">
            {year}
            <span className="label font-normal text-faint">{list.length} {list.length === 1 ? 'entry' : 'entries'}</span>
          </h2>
          {list.some((r) => r.imported) && (
            <p className="mt-3 text-[0.9375rem] text-faint">
              The older posts came over from Substack together, so they all carry the import date, 18 September 2023.
            </p>
          )}
          <ol role="list">
            {list.map((r) => {
              const isRead = read.includes(r.slug);
              const when = r.imported ? 'Imported' : short(r.date);
              return (
                <li key={r.slug} className="border-b border-hair">
                  <Link
                    href={`/posts/${r.slug}`}
                    className="group grid grid-cols-[90px_64px_minmax(0,1fr)_200px_64px] items-baseline gap-4 py-4 text-ink no-underline mob:grid-cols-[52px_minmax(0,1fr)] mob:gap-x-3 mob:gap-y-1"
                  >
                    <span className="label text-faint mob:hidden">{when}</span>
                    <span className="font-mono text-[0.875rem] font-bold text-accent">{r.number}</span>
                    <span className="min-w-0">
                      <span className={`text-[1.25rem] leading-[1.2] font-bold tracking-[-0.015em] group-hover:underline ${isRead ? 'text-faint' : 'text-ink'}`}>
                        {isRead && (
                          <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-[5px] bg-ink align-[2px] text-[0.6875rem] text-hi">
                            <span aria-hidden>✓</span>
                            <span className="sr-only">Read: </span>
                          </span>
                        )}
                        {r.title}
                      </span>
                      {r.subtitle && <span className="mt-1 block text-[1rem] leading-[1.45] text-faint">{r.subtitle}</span>}
                    </span>
                    <span className="label text-faint mob:col-start-2">
                      <span className="hidden mob:inline">{when} · </span>
                      <span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full align-[0.05em]" style={{ background: r.colour }} />
                      {r.chapter}
                      <span className="hidden mob:inline"> · <span className="whitespace-nowrap">{r.minutes} min</span></span>
                    </span>
                    <span className="label text-right text-faint mob:hidden">{r.minutes} min</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
