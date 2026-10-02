import Link from 'next/link';
import { formatUkDate, type Post } from '@/lib/posts';

/** A full `Post`, or the legacy `{ slug, title }` shape with the rest optional. */
export type PostCardPost = Pick<Post, 'slug' | 'title'> &
  Partial<Pick<Post, 'subtitle' | 'date' | 'readingMinutes'>>;

type PostCardProps = { post: PostCardPost };

/**
 * One "favourite" card (DESIGN.md 4.2, reused by Keep reading in 4.3): a 2px
 * ink top rule, the title, the subtitle as a serif-italic excerpt and a
 * sentence-case meta line. The whole card is the link, via a `::after`
 * overlay on the title link (`.post-link`), which also carries the focus ring.
 *
 * Renders an `<li>`: place it inside a `<ul className="cards" role="list">`,
 * whose subgrid rows line up titles, excerpts and meta across the row.
 */
export function PostCard({ post }: PostCardProps) {
  const dateLabel = formatUkDate(post.date ?? null);
  const readingLabel =
    post.readingMinutes != null ? `${post.readingMinutes} min read` : null;

  return (
    <li className="post-card">
      <h3 className="post-card-title">
        <Link href={`/posts/${post.slug}`} className="post-link">
          {post.title}
        </Link>
      </h3>
      {post.subtitle ? (
        <p className="post-card-excerpt font-serif italic">{post.subtitle}</p>
      ) : (
        <span aria-hidden="true" />
      )}
      {dateLabel || readingLabel ? (
        <p className="post-card-meta">
          {dateLabel && post.date && <time dateTime={post.date}>{dateLabel}</time>}
          {dateLabel && readingLabel && ' · '}
          {readingLabel}
        </p>
      ) : (
        <span aria-hidden="true" />
      )}
    </li>
  );
}
