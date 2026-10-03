import Link from 'next/link';
import { getAllPosts, groupPostsByYear, UNDATED } from '@/lib/posts';
import { sectionHeadingClass } from './sectionHeading';

type ArchiveDirectoryProps = {
  /** Section heading, e.g. "Archive". */
  title: string;
  /** Slugs already featured higher up the page, left out of the archive. */
  exclude: string[];
};

/** A year with more than this many posts spans two directory columns (KTD6). */
const WIDE_YEAR = 6;

/** "N more posts, YYYY to YYYY", from the posts actually listed (DESIGN.md 4.2). */
function archiveSummary(count: number, years: string[]): string {
  const noun = count === 1 ? 'post' : 'posts';
  const first = years[years.length - 1];
  const last = years[0];
  if (!last) return `${count} more ${noun}`;
  return `${count} more ${noun}, ${first === last ? last : `${first} to ${last}`}`;
}

/**
 * "Archive" (DESIGN.md 4.2): every post not featured above, as a building
 * directory board grouped by year, newest first. Desktop is a 3-column grid
 * (busy years span 2 and flow into 2 CSS columns); tablet is one year per row
 * in 2 CSS columns; mobile is a single column.
 *
 * No `grid-auto-flow: dense`: a wide year that doesn't fit starts a new row
 * and leaves a gap, rather than reordering the years.
 */
export async function ArchiveDirectory({ title, exclude }: ArchiveDirectoryProps) {
  const posts = (await getAllPosts()).filter((p) => !exclude.includes(p.slug));
  if (!posts.length) return null;

  const groups = groupPostsByYear(posts);
  const years = groups.map((g) => g.year).filter((y) => y !== UNDATED);

  return (
    <section className="col-full mt-[var(--section)]" aria-labelledby="archive-title">
      <div className="flex flex-wrap items-baseline justify-between gap-6 mob:block">
        <h2 id="archive-title" className={sectionHeadingClass}>
          {title}
        </h2>
        <p className="text-[1.0625rem] font-medium tracking-[0.005em] text-faint mob:mt-3 mob:text-base">
          {archiveSummary(posts.length, years)}
        </p>
      </div>
      <div className="mt-14 grid grid-cols-3 items-start gap-x-12 gap-y-[72px] tab:grid-cols-1 tab:gap-y-14 mob:mt-10 mob:gap-y-11">
        {groups.map(({ year, posts: yearPosts }) => {
          const wide = yearPosts.length > WIDE_YEAR;
          return (
            <div key={year} className={wide ? 'col-span-2 tab:col-auto' : undefined}>
              <h3 className="border-b-2 border-ink pb-3.5 text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums mob:pb-3 mob:text-[1.5rem]">
                {year}
              </h3>
              <ul
                role="list"
                className={`${wide ? 'columns-2 gap-x-12' : ''} tab:columns-2 tab:gap-x-10 mob:columns-1`}
              >
                {yearPosts.map((post) => (
                  <li
                    key={post.slug}
                    className="group relative flex break-inside-avoid items-baseline justify-between gap-5 border-b border-hair pt-[13px] pb-[14px] mob:gap-4 mob:pt-3 mob:pb-[13px]"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="post-link text-[1.0625rem] leading-[1.35] font-medium tracking-[-0.005em] text-pretty transition-colors group-hover:text-accent mob:text-base"
                    >
                      {post.title}
                    </Link>
                    <span className="flex-none text-[0.9375rem] font-medium tracking-[0.005em] whitespace-nowrap text-faint tabular-nums mob:text-[0.875rem]">
                      {post.readingMinutes} min
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
