import Link from 'next/link';
import { formatUkDate, getAllPosts } from '@/lib/posts';
import { locate, ordersFor } from '@/lib/manual';
import { Contents } from './manual/Contents';
import { ReadToggle } from './manual/ReadToggle';

type PostHeaderProps = {
  title: string;
  slug: string;
};

/**
 * Opens a post as a Field manual entry: the chapter it's filed under, its
 * entry number, the display title, the standfirst (subtitle) under the
 * highlighter, the meta line, mark as read, and the situations it's on.
 * Only `title` and `slug` are passed; everything else comes from the post
 * index (lib/posts.ts) and the manual (lib/manual.ts) by slug.
 *
 * It also numbers the post's sections: the entry number goes into a CSS
 * variable that the h2 counter reads, so "4.2.1" comes from CSS, not markup.
 */
export async function PostHeader({ title, slug }: PostHeaderProps) {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const post = posts.find((p) => p.slug === slug);
  const where = locate(posts, slug);
  const number = where?.entry.number ?? '';
  const orders = ordersFor(slug);
  const filed = post?.importDate ? 'From the Substack archive' : post?.date ? `Filed ${formatUkDate(post.date)}` : null;

  return (
    <header className="post-head col-bleed border-b-2 border-ink">
      {number && <style>{`#main{--entry:"${number}"}`}</style>}
      <div className="mx-auto max-w-[1180px] px-[var(--gutter)] pt-12 pb-12 mob:pt-8 mob:pb-9">
        <p className="label text-faint">
          <Link href="/#chapters" className="text-faint no-underline hover:text-ink hover:underline">All chapters</Link>
          {where && (
            <>
              <span aria-hidden> / </span>
              <span className="text-ink">
                <span aria-hidden className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-[0.05em]" style={{ background: where.chapter.theme.colour }} />
                Chapter {where.chapter.number} · {where.chapter.theme.name}
              </span>
            </>
          )}
        </p>
        <div className="mt-6 flex items-start gap-6 mob:block">
          {number && (
            <span className="shrink-0 rounded-2xl bg-ink px-4 py-3 font-mono text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none font-bold tracking-[-0.03em] text-hi mob:mb-4 mob:inline-block">
              <span className="sr-only">Entry </span>
              {number}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-[clamp(2.5rem,6.4vw,5.75rem)] leading-[0.95] font-bold tracking-[-0.045em] text-ink">{title}</h1>
            {post?.subtitle && (
              <p className="mt-5 max-w-[34ch] text-[clamp(1.25rem,2vw,1.625rem)] leading-[1.3] font-medium tracking-[-0.01em] text-ink">
                <span className="hl">{post.subtitle}</span>
              </p>
            )}
          </div>
        </div>
        <div className="label mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-faint">
          {post?.draft && <span className="rounded bg-hi px-2 py-1 text-ink">Draft · not published</span>}
          {post && <span>{post.readingMinutes} min read</span>}
          {filed && <span>{filed}</span>}
          {post && <span>{post.words.toLocaleString('en-GB')} words</span>}
          <ReadToggle slug={slug} />
        </div>
        {orders.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="label mr-1 text-faint">Use this when</span>
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/?situation=${o.id}#situations`}
                className="surface-dark inline-flex min-h-9 items-center rounded-full bg-accent px-4 text-[0.9375rem] font-bold text-white no-underline transition-transform hover:-translate-y-0.5"
              >
                {o.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      {number && <Contents entry={number} />}
    </header>
  );
}
