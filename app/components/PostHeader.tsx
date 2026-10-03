import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { ArrowIcon } from './icons';
import { PostMeta } from './PostMeta';

type PostHeaderProps = {
  title: string;
  slug: string;
};

/**
 * Opens a post (DESIGN.md 4.3, "Post header"): a breadcrumb pill back to
 * /posts, the display title, the standfirst (subtitle) and a sentence-case
 * meta line (date and reading time). Only `title` and `slug` are passed as
 * props; the date, reading time and subtitle are resolved from the shared
 * post index (lib/posts.ts) by slug, so they stay in sync with the metadata
 * export.
 */
export async function PostHeader({ title, slug }: PostHeaderProps) {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const post = posts.find((p) => p.slug === slug);

  return (
    <header className="post-head col-full pt-[clamp(64px,7.5vw,108px)] text-center mob:pt-16">
      <p>
        <Link
          href="/posts"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-hair pr-[18px] pl-3.5 text-base font-medium text-ink no-underline transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowIcon className="h-4 w-4 -scale-x-100 text-accent" />
          posts
        </Link>
      </p>
      <h1 className="mx-auto mt-9 max-w-[15em] text-[clamp(2.375rem,5.3vw,4.75rem)] leading-[1.02] font-bold tracking-[-0.035em] text-balance text-ink mob:mt-7">
        {title}
      </h1>
      {post?.subtitle && (
        <p className="mx-auto mt-7 max-w-[31em] font-serif text-[clamp(1.25rem,1.85vw,1.625rem)] leading-[1.4] font-normal text-balance text-muted italic mob:mt-5">
          {post.subtitle}
        </p>
      )}
      <PostMeta
        date={post?.date}
        readingMinutes={post?.readingMinutes}
        className="mt-6 text-base font-medium tracking-[0.005em] text-faint tabular-nums"
      />
    </header>
  );
}
