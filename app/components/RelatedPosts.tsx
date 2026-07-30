import Link from 'next/link';

type RelatedPost = { slug: string; title: string };
type RelatedPostsProps = { posts: RelatedPost[] };

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;
  return (
    <section className="mt-14">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.09em] text-accent mb-1">
        Keep reading
      </p>
      <ul>
        {posts.map(({ slug, title }) => (
          <li key={slug} className="border-b border-hair last:border-0">
            <Link
              href={`/posts/${slug}`}
              className="block py-3 font-serif text-[1.125rem] font-[500] text-ink no-underline hover:text-accent transition-colors"
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
