import { formatUkDate, getAllPosts } from '@/lib/posts';

type PostHeaderProps = {
  title: string;
  slug: string;
};

/**
 * Renders a post's kicker (date + reading time), display title, and
 * subtitle. Only `title` and `slug` are passed as props; the date, reading
 * time, and subtitle are resolved from the shared post index (lib/posts.ts)
 * by slug, so they stay in sync with the metadata export.
 */
export async function PostHeader({ title, slug }: PostHeaderProps) {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  const dateLabel = formatUkDate(post?.date ?? null);
  const readingLabel = post ? `${post.readingMinutes} min read` : null;
  const kicker = [dateLabel, readingLabel].filter(Boolean).join(' · ');

  return (
    <header className="mb-[2.5rem]">
      {kicker && (
        <p className="mb-[0.85rem] font-sans text-[13px] font-medium tracking-[0.09em] uppercase text-faint">
          {kicker}
        </p>
      )}
      <h1 className="text-balance font-serif text-[clamp(2.35rem,6.4vw,3.85rem)] font-semibold leading-[1.04] tracking-[-0.018em] text-ink">
        {title}
      </h1>
      {post?.subtitle && (
        <p className="mt-[1rem] font-[430] font-serif text-[1.3rem] italic leading-[1.45] text-muted">
          {post.subtitle}
        </p>
      )}
    </header>
  );
}
