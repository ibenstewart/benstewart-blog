import { PostCard, type PostCardPost } from './PostCard';

type RelatedPostsProps = { posts: PostCardPost[] };

/**
 * "Keep reading" (DESIGN.md 4.3): a full-width section with the hand-picked
 * related posts as homepage-style cards, three across, stacking at 960px.
 * Accepts full `Post` objects (from PostNav) or the legacy `{ slug, title }`.
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;
  return (
    <section className="col-full mt-[var(--section)]" aria-labelledby="keep-title">
      <h2
        id="keep-title"
        className="text-[clamp(2rem,3vw,2.75rem)] leading-none font-bold tracking-[-0.035em] text-ink"
      >
        Keep reading
      </h2>
      <ul className="cards mt-12 mob:mt-9" role="list">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </ul>
    </section>
  );
}
