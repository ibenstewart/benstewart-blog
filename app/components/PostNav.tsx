import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { RelatedPosts } from './RelatedPosts';

type PostNavProps = {
  slug: string;
  related?: string[];
};

const linkClasses =
  'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2';
const labelClasses =
  'block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1';

export async function PostNav({ slug, related = [] }: PostNavProps) {
  const posts = await getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older =
    index !== -1 && index < posts.length - 1 ? posts[index + 1] : null;

  const relatedPosts = related.flatMap((relatedSlug) => {
    const post = posts.find((p) => p.slug === relatedSlug);
    return post ? [{ slug: post.slug, title: post.title }] : [];
  });

  return (
    <>
      <RelatedPosts posts={relatedPosts} />
      {(newer || older) && (
        <nav
          aria-label="Post navigation"
          className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-8"
        >
          <div className="max-w-[45%]">
            {newer && (
              <Link href={`/posts/${newer.slug}`} className="group">
                <span className={labelClasses}>&larr; Newer</span>
                <span className={linkClasses}>{newer.title}</span>
              </Link>
            )}
          </div>
          <div className="max-w-[45%] text-right">
            {older && (
              <Link href={`/posts/${older.slug}`} className="group">
                <span className={labelClasses}>Older &rarr;</span>
                <span className={linkClasses}>{older.title}</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
