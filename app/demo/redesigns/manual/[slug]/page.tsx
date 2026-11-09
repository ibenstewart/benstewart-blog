import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { getAllPosts } from '@/lib/posts';
import { getConceptPosts, THEMES } from '../../_lib/data';
import { BG, BLUE, GREY, HI, INK, MANUAL_CSS, SITUATIONS, TOOLS, chapters, entryHref, mono } from '../content';
import { ManualFooter, ManualTopBar } from '../chrome';
import { ENTRY_CSS, fmComponents } from './components';
import { Contents, ReadToggle } from './EntryClient';
import { LOADERS } from './loaders';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  return posts.filter((p) => LOADERS[p.slug]).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = (await getAllPosts(undefined, { includeDrafts: true })).find((p) => p.slug === slug);
  return { title: post ? `${post.title} · Field manual` : 'Field manual' };
}

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase() : 'UNDATED';

/**
 * A post as a Field manual entry: its real MDX, rendered with the manual's
 * components, inside a numbered entry with the situations it belongs to, its
 * tools, a live contents list and the next step in its reading order.
 */
export default async function EntryPage({ params }: Params) {
  const { slug } = await params;
  const posts = await getConceptPosts({ includeDrafts: true });
  const post = posts.find((p) => p.slug === slug);
  const load = LOADERS[slug];
  if (!post || !load) notFound();
  const { default: Mdx } = await load();

  const chs = chapters(posts, [...THEMES]);
  const ch = chs.find((c) => c.entries.some((e) => e.post.slug === slug))!;
  const idx = ch.entries.findIndex((e) => e.post.slug === slug);
  const entry = ch.entries[idx];
  const numberOf = (s: string) => chs.flatMap((c) => c.entries).find((e) => e.post.slug === s)?.number;
  const bySlug = (s: string) => posts.find((p) => p.slug === s)!;

  const orders = SITUATIONS.filter((s) => s.path.some(([p]) => p === slug)).map((s) => ({
    ...s,
    step: s.path.findIndex(([p]) => p === slug),
  }));
  const order = orders[0];
  const tools = TOOLS.filter((t) => t.slug === slug);
  const nextInChapter = ch.entries.length > 1 ? ch.entries[(idx + 1) % ch.entries.length] : null;

  return (
    <div className="rd-root fm min-h-screen" style={{ background: BG, color: INK }}>
      <style>{MANUAL_CSS + ENTRY_CSS({ INK, BLUE, HI, GREY })}</style>
      <ManualTopBar current="chapters" />

      {/* Entry header */}
      <header className="border-b-2 px-10 pb-12 pt-12 mob:px-6 mob:pb-9 mob:pt-8" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>
            <Link href="/demo/redesigns/manual#chapters" className="no-underline hover:underline" style={{ color: GREY }}>ALL CHAPTERS</Link>
            {' / '}
            <span style={{ color: ch.theme.colour }}>CHAPTER {ch.number} · {ch.theme.name.toUpperCase()}</span>
          </p>
          <div className="mt-6 flex items-start gap-6 mob:block">
            <span className="shrink-0 rounded-2xl px-4 py-3 text-[clamp(28px,3.4vw,44px)] font-bold leading-none tracking-[-0.03em] mob:mb-4 mob:inline-block"
              style={{ ...mono, background: INK, color: HI }}><span className="sr-only">Entry </span>{entry.number}</span>
            <div className="min-w-0">
              <h1 className="text-[clamp(40px,6.4vw,92px)] font-bold leading-[0.95] tracking-[-0.045em]">{post.title}</h1>
              {post.subtitle && (
                <p className="mt-5 max-w-[34ch] text-[clamp(20px,2vw,26px)] font-medium leading-[1.3] tracking-[-0.01em]">
                  <span className="fm-hl">{post.subtitle}</span>
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] tracking-[0.08em]" style={{ ...mono, color: GREY }}>
            {post.draft && <span className="rounded px-2 py-1" style={{ background: HI, color: INK }}>DRAFT · NOT PUBLISHED</span>}
            <span>{post.readingMinutes} MIN READ</span>
            <span>{post.importDate ? 'FROM THE SUBSTACK ARCHIVE' : `FILED ${fmtDate(post.date)}`}</span>
            <span>{post.words.toLocaleString('en-GB')} WORDS</span>
            <ReadToggle slug={slug} />
          </div>
          {orders.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[13px] tracking-[0.08em]" style={{ ...mono, color: GREY }}>USE THIS WHEN</span>
              {orders.map((o) => (
                <Link key={o.id} href={`/demo/redesigns/manual#${o.id}`}
                  className="inline-flex h-9 items-center rounded-full px-4 text-[15px] font-bold no-underline transition-transform hover:-translate-y-0.5"
                  style={{ background: BLUE, color: '#fff' }}>
                  {o.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-[1180px] grid-cols-[250px_minmax(0,1fr)] gap-16 px-10 py-16 tab:grid-cols-1 tab:gap-12 mob:px-6 mob:py-10">
        <aside className="tab:order-2">
          <div className="sticky top-6 grid gap-8 tab:static">
            <Contents entry={entry.number} />
            {tools.map((t) => (
              <div key={t.name} className="fm-card rounded-3xl border-2 p-5" style={{ borderColor: INK, background: '#fff' }}>
                <p className="text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>TOOL IN THIS ENTRY</p>
                <div className="mt-3 h-[150px]">{t.art}</div>
                <p className="mt-3 text-[22px] font-bold tracking-[-0.02em]">{t.name}</p>
                <p className="mt-1 text-[15px] leading-[1.45]" style={{ color: GREY }}>{t.line}</p>
              </div>
            ))}
          </div>
        </aside>
        <article id="fm-article" className="fm-prose min-w-0 max-w-[680px]" style={{ '--fm-entry': `"${entry.number}"` } as CSSProperties}>
          <Mdx components={fmComponents} />
        </article>
      </div>

      {/* Next step */}
      <section className="border-t-2 px-10 py-16 mob:px-6 mob:py-12" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          {order ? (
            <>
              <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>
                READING ORDER · {order.label.toUpperCase()} · STEP {order.step + 1} OF {order.path.length}
              </p>
              <ol className="mt-6 grid grid-cols-3 gap-4 cards:grid-cols-1">
                {order.path.map(([s, why], i) => {
                  const p = bySlug(s);
                  const state = i < order.step ? 'done' : i === order.step ? 'here' : i === order.step + 1 ? 'next' : 'later';
                  const styles: Record<string, CSSProperties> = {
                    done: { borderColor: INK, color: GREY, background: 'transparent' },
                    here: { borderColor: INK, background: INK, color: '#fff' },
                    next: { borderColor: BLUE, background: BLUE, color: '#fff' },
                    later: { borderColor: INK, color: INK, background: '#fff' },
                  };
                  return (
                    <li key={s}>
                      <Link href={entryHref(s)} className="group flex h-full flex-col rounded-3xl border-2 p-6 no-underline transition-transform hover:-translate-y-1" style={styles[state]}>
                        <span className="flex items-center justify-between text-[12px] tracking-[0.1em]" style={mono}>
                          <span style={{ color: state === 'here' || state === 'next' ? HI : BLUE }}>
                            {state === 'here' ? "YOU'RE HERE" : state === 'next' ? 'NEXT' : state === 'done' ? 'BEFORE THIS' : 'AFTER THAT'}
                          </span>
                          <span className="opacity-70">ENTRY {numberOf(s)} · {p.readingMinutes} MIN</span>
                        </span>
                        <span className="mt-4 text-[clamp(22px,2.2vw,28px)] font-bold leading-[1.08] tracking-[-0.02em] group-hover:underline">{p.title}</span>
                        <span className="mt-2 text-[16px] opacity-80">{why}</span>
                        {state === 'next' && <span className="nudge mt-5 text-[28px] font-bold" style={{ color: HI }}>→</span>}
                      </Link>
                    </li>
                  );
                })}
              </ol>
              {orders.length > 1 && (
                <p className="mt-6 text-[15px]" style={{ color: GREY }}>
                  Also on the reading order for{' '}
                  {orders.slice(1).map((o, i) => (
                    <span key={o.id}>{i ? ', ' : ''}<Link href={`/demo/redesigns/manual#${o.id}`} style={{ color: INK }}>{o.label.toLowerCase()}</Link></span>
                  ))}.
                </p>
              )}
            </>
          ) : nextInChapter ? (
            <>
              <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>NEXT IN CHAPTER {ch.number} · {ch.theme.name.toUpperCase()}</p>
              <Link href={entryHref(nextInChapter.post.slug)} className="group mt-6 grid max-w-[720px] grid-cols-[auto_1fr] items-center gap-6 rounded-3xl p-7 no-underline transition-transform hover:-translate-y-1" style={{ background: BLUE, color: '#fff' }}>
                <span className="text-[34px] font-bold" style={{ ...mono, color: HI }}>{nextInChapter.number}</span>
                <span>
                  <span className="block text-[clamp(24px,2.6vw,32px)] font-bold leading-[1.05] tracking-[-0.02em] group-hover:underline">{nextInChapter.post.title}</span>
                  {nextInChapter.post.subtitle && <span className="mt-2 block text-[16px] opacity-80">{nextInChapter.post.subtitle}</span>}
                </span>
              </Link>
            </>
          ) : null}
        </div>
      </section>

      <ManualFooter status={`GLASGOW · REVISION ${posts.length} · YOU'RE READING ENTRY ${entry.number}`} />
    </div>
  );
}
