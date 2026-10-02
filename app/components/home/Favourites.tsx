import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { ArrowIcon } from '../icons';
import { PostCard } from '../PostCard';
import { sectionHeadingClass } from './sectionHeading';

type FavouritesProps = {
  /** Section heading, e.g. "Some of my favourite writing". */
  title: string;
  /** Posts to show as cards, in order. Unknown slugs are skipped. */
  slugs: string[];
};

/**
 * "Some of my favourite writing" (DESIGN.md 4.2): three cards in a row
 * (stacking at 960px), then the primary "View all posts" pill.
 */
export async function Favourites({ title, slugs }: FavouritesProps) {
  const all = await getAllPosts();
  const posts = slugs.flatMap((slug) => all.filter((p) => p.slug === slug));

  return (
    <section className="col-full mt-[var(--section)]" aria-labelledby="faves-title">
      <h2 id="faves-title" className={sectionHeadingClass}>
        {title}
      </h2>
      <ul role="list" className="cards mt-16 mob:mt-10 cards:[&_.post-card-title]:max-w-[30em]">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </ul>
      <Link
        href="/posts"
        className="mt-16 inline-flex h-14 items-center gap-3 rounded-full bg-accent px-7 text-[1.125rem] font-medium tracking-[-0.005em] text-white transition-colors hover:bg-accent-deep focus-visible:outline-ink mob:mt-12 mob:h-11 mob:px-[18px] mob:text-base"
      >
        View all posts
        <ArrowIcon className="size-5" />
      </Link>
    </section>
  );
}
