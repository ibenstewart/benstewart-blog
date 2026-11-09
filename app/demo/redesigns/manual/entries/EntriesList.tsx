'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const INK = '#0E0F12';
const HI = '#FFD84A';
const GREY = '#5C5F66';
const BLUE = '#003593';
const mono = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' } as const;

export type Row = {
  slug: string;
  href: string;
  title: string;
  subtitle: string | null;
  date: string | null;
  number: string;
  chapter: string;
  minutes: number;
  draft: boolean;
  imported: boolean;
};

const fmt = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).toUpperCase() : '';

/** Every entry by date, newest or oldest first, grouped by year, with read ticks. */
export function EntriesList({ rows }: { rows: Row[] }) {
  const [oldest, setOldest] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  useEffect(() => {
    try { setRead(JSON.parse(localStorage.getItem('fm-read') ?? '[]')); } catch {}
  }, []);

  const years = useMemo(() => {
    const sorted = oldest ? [...rows].reverse() : rows;
    const out: [string, Row[]][] = [];
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
        <p className="text-[15px] font-medium" style={mono}>
          {rows.length} entries · you&apos;ve read {read.filter((s) => rows.some((r) => r.slug === s)).length}
        </p>
        <div role="group" aria-label="Order" className="inline-flex rounded-xl border-2 p-1" style={{ borderColor: INK }}>
          {[['Newest first', false], ['Oldest first', true]].map(([l, v]) => (
            <button key={String(l)} onClick={() => setOldest(v as boolean)} aria-pressed={oldest === v}
              className="h-9 rounded-lg px-4 text-[14px] font-bold transition-colors"
              style={{ background: oldest === v ? INK : 'transparent', color: oldest === v ? HI : INK }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {years.map(([y, list]) => (
        <section key={y} className="mt-12" aria-labelledby={`y-${y}`}>
          <h2 id={`y-${y}`} className="flex items-baseline gap-4 border-b-2 pb-3 text-[clamp(32px,3.6vw,48px)] font-bold leading-none tracking-[-0.04em]" style={{ borderColor: INK }}>
            {y}
            <span className="text-[13px] font-normal tracking-[0.1em]" style={{ ...mono, color: GREY }}>{list.length} {list.length === 1 ? 'ENTRY' : 'ENTRIES'}</span>
          </h2>
          {list.some((r) => r.imported) && (
            <p className="mt-3 text-[15px]" style={{ color: GREY }}>
              The older posts came over from Substack together, so they all carry the import date, 18 September 2023.
            </p>
          )}
          <ol>
            {list.map((r) => {
              const isRead = read.includes(r.slug);
              return (
                <li key={r.slug} className="border-b" style={{ borderColor: 'rgba(14,15,18,.14)' }}>
                  <Link href={r.href} className="group grid grid-cols-[90px_64px_minmax(0,1fr)_180px_64px] items-baseline gap-4 py-4 no-underline mob:grid-cols-[52px_minmax(0,1fr)] mob:gap-x-3 mob:gap-y-1" style={{ color: INK }}>
                    <span className="text-[13px] tracking-[0.08em] mob:hidden" style={{ ...mono, color: GREY }}>{r.imported ? 'IMPORTED' : fmt(r.date)}</span>
                    <span className="text-[14px] font-bold" style={{ ...mono, color: BLUE }}>{r.number}</span>
                    <span className="min-w-0">
                      <span className="text-[20px] font-bold leading-[1.2] tracking-[-0.015em] group-hover:underline" style={{ color: isRead ? GREY : INK }}>
                        {isRead && <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-[5px] align-[2px] text-[11px]" style={{ background: INK, color: HI }} aria-label="Read">✓</span>}
                        {r.title}
                      </span>
                      {r.draft && <span className="ml-2 rounded px-1.5 py-0.5 align-middle text-[10px] tracking-[0.08em]" style={{ ...mono, background: HI, color: INK }}>DRAFT</span>}
                      {r.subtitle && <span className="mt-1 block text-[16px] leading-[1.45]" style={{ color: GREY }}>{r.subtitle}</span>}
                    </span>
                    <span className="text-[13px] tracking-[0.06em] mob:col-start-2" style={{ ...mono, color: GREY }}>
                      <span className="hidden mob:inline">{r.imported ? 'IMPORTED' : fmt(r.date)} · </span>{r.chapter.toUpperCase()}<span className="hidden mob:inline"> · {r.minutes} MIN</span>
                    </span>
                    <span className="text-right text-[13px] mob:hidden" style={{ ...mono, color: GREY }}>{r.minutes} MIN</span>
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
