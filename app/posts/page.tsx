import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { chapters } from '@/lib/manual';
import { EntriesList, type EntryRow } from '@/app/components/manual/EntriesList';
import { PageHead } from '@/app/components/manual/PageHead';
import { textLinkClass } from '@/app/components/TextLink';

const postsDescription = "Every entry in Ben Stewart's field manual on leading engineering teams through AI, newest first.";

export const metadata: Metadata = pageMetadata({
  title: 'Every entry on engineering leadership and AI',
  description: postsDescription,
  path: '/posts',
});

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
          Same {posts.length} entries as the <Link href="/#chapters" className={textLinkClass}>chapters</Link>, in the order I wrote them. Handy if you want to see what&apos;s new, or start at the beginning.
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
