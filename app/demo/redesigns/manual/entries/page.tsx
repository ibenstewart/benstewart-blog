import { getConceptPosts, THEMES } from '../../_lib/data';
import { BG, BLUE, GREY, INK, MANUAL_CSS, chapters, entryHref, mono } from '../content';
import { ManualFooter, ManualTopBar } from '../chrome';
import { EntriesList, type Row } from './EntriesList';

export const metadata = { title: 'All entries · Field manual' };

/** The manual by date: every entry, newest first, with its number and chapter. */
export default async function EntriesPage() {
  const posts = await getConceptPosts({ includeDrafts: true });
  const chs = chapters(posts, [...THEMES]);
  const where = new Map(chs.flatMap((c) => c.entries.map((e) => [e.post.slug, { number: e.number, chapter: c.theme.name }] as const)));
  const rows: Row[] = posts.map((p) => ({
    slug: p.slug,
    href: entryHref(p.slug),
    title: p.title,
    subtitle: p.subtitle,
    date: p.date,
    number: where.get(p.slug)?.number ?? '',
    chapter: where.get(p.slug)?.chapter ?? '',
    minutes: p.readingMinutes,
    draft: p.draft,
    imported: p.importDate,
  }));

  return (
    <div className="rd-root" style={{ background: BG, color: INK }}>
      <style>{MANUAL_CSS}</style>
      <ManualTopBar current="entries" />
      <header className="border-b-2 px-10 pb-12 pt-12 mob:px-6 mob:pb-9 mob:pt-8" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[13px] tracking-[0.1em]" style={{ ...mono, color: BLUE }}>INDEX · ALL ENTRIES</p>
          <h1 className="mt-5 text-[clamp(44px,6.6vw,96px)] font-bold leading-[0.92] tracking-[-0.045em]">Every entry, by date.</h1>
          <p className="mt-6 max-w-[56ch] text-[19px] leading-[1.6]" style={{ color: GREY }}>
            The chapters group the manual by theme. This is the same {posts.length} entries in the order they were written, for when you want to see what&apos;s new or read it from the start.
          </p>
        </div>
      </header>
      <section className="px-10 py-14 mob:px-6">
        <div className="mx-auto max-w-[1180px]">
          <EntriesList rows={rows} />
        </div>
      </section>
      <ManualFooter status={`GLASGOW · REVISION ${posts.length} · ALL ENTRIES BY DATE`} />
    </div>
  );
}
