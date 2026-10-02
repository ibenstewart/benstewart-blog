import Link from 'next/link';
import { getAllPosts, pickPosts } from '@/lib/posts';
import { ArrowIcon } from './icons';
import { RelatedPosts } from './RelatedPosts';

type PostNavProps = {
  slug: string;
  related?: string[];
};

const halfClasses =
  'group block border-y border-hair pt-7 pb-8 text-ink no-underline';
const dirClasses =
  'flex items-center gap-2.5 text-[0.9375rem] leading-[1.2] font-medium text-accent';
const titleClasses =
  'mt-2.5 block text-[1.375rem] leading-[1.2] font-medium tracking-[-0.015em] text-balance transition-colors group-hover:text-accent mob:text-[1.1875rem]';

/**
 * The end of every post (DESIGN.md 4.3): "Keep reading" cards for the
 * hand-picked `related` slugs, then the newer/older pager. Newer and older
 * are derived from post dates via lib/posts.ts.
 */
export async function PostNav({ slug, related = [] }: PostNavProps) {
  const posts = await getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older =
    index !== -1 && index < posts.length - 1 ? posts[index + 1] : null;

  const relatedPosts = pickPosts(posts, related);

  return (
    <>
      <RelatedPosts posts={relatedPosts} />
      {(newer || older) && (
        <nav
          aria-label="Post navigation"
          className={`col-full grid grid-cols-2 gap-x-6 mob:grid-cols-1 ${
            relatedPosts.length ? 'mt-24 mob:mt-[72px]' : 'mt-[var(--section)]'
          }`}
        >
          {newer && (
            <Link href={`/posts/${newer.slug}`} className={`${halfClasses} col-start-1`}>
              <span className={dirClasses}>
                <ArrowIcon className="h-[18px] w-[18px] shrink-0 -scale-x-100" />
                Newer
              </span>
              <span className={titleClasses}>{newer.title}</span>
            </Link>
          )}
          {older && (
            <Link
              href={`/posts/${older.slug}`}
              className={`${halfClasses} col-start-2 text-right mob:col-start-1 mob:text-left ${
                newer ? 'mob:border-t-0' : ''
              }`}
            >
              <span className={`${dirClasses} justify-end mob:justify-start`}>
                Older
                <ArrowIcon className="h-[18px] w-[18px] shrink-0" />
              </span>
              <span className={titleClasses}>{older.title}</span>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
