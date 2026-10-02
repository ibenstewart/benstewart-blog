import { formatUkDate } from '@/lib/posts';

type PostMetaProps = {
  date?: string | null;
  readingMinutes?: number | null;
  className?: string;
  /** Render an empty `aria-hidden` span when there is nothing to show (keeps card subgrid rows aligned). */
  placeholder?: boolean;
};

/** The sentence-case meta line: "20 February 2026 · 9 min read". */
export function PostMeta({ date, readingMinutes, className, placeholder }: PostMetaProps) {
  const dateLabel = formatUkDate(date ?? null);
  const readingLabel = readingMinutes != null ? `${readingMinutes} min read` : null;

  if (!dateLabel && !readingLabel) return placeholder ? <span aria-hidden="true" /> : null;

  return (
    <p className={className}>
      {dateLabel && date && <time dateTime={date}>{dateLabel}</time>}
      {dateLabel && readingLabel && ' · '}
      {readingLabel}
    </p>
  );
}
