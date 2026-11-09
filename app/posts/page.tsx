import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { chapters } from '@/lib/manual';
import { EntriesList, type EntryRow } from '@/app/components/manual/EntriesList';
import { PageHead } from '@/app/components/manual/PageHead';
import { textLinkClass } from '@/app/components/TextLink';

const postsDescription = 'Every field report by Ben Stewart on leading engineering teams through AI, newest first.';

export const metadata: Metadata = {
  title: 'All entries',
  description: postsDescription,
  alternates: { canonical: 'https://www.benstewart.ai/posts' },
  openGraph: {
    title: 'All entries | Ben Stewart',
    description: postsDescription,
    url: 'https://www.benstewart.ai/posts',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
};

/** The manual by date: every published entry, newest first, with its number and chapter. */
export default async function PostsPage() {
  const posts = await getAllPosts();
  const where = new Map(
    chapters(posts).flatMap((c) => c.entries.map((e) => [e.post.slug, { number: e.number, theme: c.theme }] as const))
  );
  const rows: EntryRow[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? null,
    date: p.date ?? null,
    number: where.get(p.slug)?.number ?? '',
    chapter: where.get(p.slug)?.theme.name ?? '',
    colour: where.get(p.slug)?.theme.colour ?? 'var(--faint)',
    minutes: p.readingMinutes,
    imported: p.importDate,
  }));

  return (
    <>
      <PageHead label="Index · All entries" title="Every entry, by date.">
        <p className="mt-6 max-w-[56ch] text-[1.1875rem] leading-[1.6] text-faint">
          The <Link href="/#chapters" className={textLinkClass}>chapters</Link> group the manual by theme. This is the same {posts.length} entries in the order they were written, for when you want to see what&apos;s new or read it from the start.
        </p>
      </PageHead>
      <section aria-label="Entries" className="col-bleed">
        <div className="mx-auto max-w-[1180px] px-[var(--gutter)] py-14">
          <EntriesList rows={rows} />
        </div>
      </section>
    </>
  );
}
