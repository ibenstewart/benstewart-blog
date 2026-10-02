import Link from 'next/link';
import { getAllPosts, pickPosts } from '@/lib/posts';
import { PostMeta } from './PostMeta';

type PostListProps = {
  /**
   * When provided, renders only these slugs, in this order, silently skipping
   * any that don't exist. Otherwise renders every post, newest first.
   */
  slugs?: string[];
};

/**
 * Editorial rows for a set of posts: title, optional subtitle, and a
 * sentence-case meta line with the UK-formatted date and reading time. Used
 * on /posts (full index).
 */
export async function PostList({ slugs }: PostListProps) {
  const posts = await getAllPosts();

  const items = slugs ? pickPosts(posts, slugs) : posts;

  return (
    <div>
      {items.map((post) => (
        <Link
          key={post.slug}
          href={`/posts/${post.slug}`}
          className="group block py-4 border-b border-hair last:border-0"
        >
          <p className="font-sans text-[1.125rem] font-medium text-ink group-hover:text-accent transition-colors">
            {post.title}
          </p>
          {post.subtitle && (
            <p className="font-serif italic text-[0.975rem] text-muted mt-0.5">
              {post.subtitle}
            </p>
          )}
          <PostMeta
            date={post.date}
            readingMinutes={post.readingMinutes}
            className="font-sans text-[0.9375rem] font-medium tracking-[0.005em] tabular-nums text-faint mt-1.5"
          />
        </Link>
      ))}
    </div>
  );
}
