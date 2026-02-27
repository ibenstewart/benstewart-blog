import Link from 'next/link';

type RelatedPost = { slug: string; title: string };
type RelatedPostsProps = { posts: RelatedPost[] };

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;
  return (
    <section className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Related
      </p>
      <ul className="space-y-1">
        {posts.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              href={`/posts/${slug}`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
