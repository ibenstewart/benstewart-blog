import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { SITUATIONS, entryNumbers } from '@/lib/manual';
import { EntryCard } from './components/manual/EntryCard';
import { PageHead } from './components/manual/PageHead';

export const metadata: Metadata = {
  title: 'Not found',
};

const button = 'inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink px-5 text-[1.0625rem] font-bold no-underline';

/**
 * A missing page sends people to the "I'm new here" reading order, plus
 * the two ways into the whole manual.
 */
export default async function NotFound() {
  const posts = await getAllPosts();
  const numbers = entryNumbers(posts);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const start = SITUATIONS[0];
  const path = start.path.flatMap(([slug, why]) => {
    const post = bySlug.get(slug);
    return post ? [{ post, why }] : [];
  });

  return (
    <>
      <PageHead label="Error 404 · Not found" title="This page isn't in the manual.">
        <p className="mt-6 max-w-[52ch] text-[1.1875rem] leading-[1.6] text-faint">
          The link might be old or mistyped. Every post is still here, by chapter or by date.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#chapters" className={`${button} surface-dark bg-ink text-paper`}>
            Browse the chapters <span aria-hidden className="nudge text-hi">→</span>
          </Link>
          <Link href="/posts" className={`${button} text-ink hover:bg-hi`}>Every entry, by date</Link>
        </div>
      </PageHead>
      {path.length > 0 && (
        <section aria-labelledby="start-title" className="col-bleed">
          <div className="mx-auto max-w-[1180px] px-[var(--gutter)] py-16 mob:py-12">
            <p className="label text-accent">Or start here</p>
            <h2 id="start-title" className="mt-4 text-[clamp(2rem,3vw,2.75rem)] leading-none font-bold tracking-[-0.035em] text-ink">
              {start.label}
            </h2>
            <ol role="list" className="mt-8 grid grid-cols-3 gap-4 cards:grid-cols-1">
              {path.map(({ post, why }) => (
                <EntryCard key={post.slug} post={post} number={numbers.get(post.slug)} why={why} />
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
