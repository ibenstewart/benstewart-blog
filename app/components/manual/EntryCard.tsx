import Link from 'next/link';
import type { Post } from '@/lib/posts';
import { entryHref } from '@/lib/manual';

/**
 * An entry as a card: its number and reading time, the title and its pull
 * line. The whole card is the link. Renders an `<li>`.
 */
export function EntryCard({ post, number, why }: { post: Post; number?: string; why?: string }) {
  return (
    <li>
      <Link
        href={entryHref(post.slug)}
        className="group flex h-full flex-col rounded-3xl border-2 border-ink bg-card p-6 text-ink no-underline transition-transform hover:-translate-y-1"
      >
        <span className="label text-faint">
          {number ? `Entry ${number} · ` : ''}
          {post.readingMinutes} min
        </span>
        <span className="mt-3 text-[clamp(1.375rem,2.2vw,1.625rem)] leading-[1.08] font-bold tracking-[-0.02em] group-hover:underline">
          {post.title}
        </span>
        {(why ?? post.quote ?? post.subtitle) && (
          <span className="mt-3 text-[1rem] leading-[1.45] text-faint">{why ?? post.quote ?? post.subtitle}</span>
        )}
        <span aria-hidden className="nudge mt-auto pt-5 text-[1.5rem] font-bold text-accent">→</span>
      </Link>
    </li>
  );
}
