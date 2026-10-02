import Link from 'next/link';
import { getAllPosts, pickPosts } from '@/lib/posts';
import { PostMeta } from '../PostMeta';
import { ArrowIcon } from '../icons';
import { sectionHeadingClass } from './sectionHeading';

type StartHereProps = {
  /** Heading on the arch, e.g. "Start here". */
  title: string;
  /** The line under the heading. */
  description: string;
  /** Posts to list, in order. Unknown slugs are skipped. */
  slugs: string[];
};

/**
 * "Start here" (DESIGN.md 4.2): a blond arch beside a numbered list of posts.
 * Each row is one link (the title's `.post-link` overlay); the numerals are
 * decorative, the ordered list carries the numbering.
 */
export async function StartHere({ title, description, slugs }: StartHereProps) {
  const all = await getAllPosts();
  const posts = pickPosts(all, slugs);

  return (
    <section
      className="col-full mt-[var(--section)] grid grid-cols-12 gap-x-6 mob:block"
      aria-labelledby="start-title"
    >
      <div className="col-span-4 col-start-1 flex min-h-[540px] flex-col justify-end rounded-t-full bg-blond p-10 tab:col-span-5 mob:aspect-[1/1.04] mob:min-h-0 mob:p-7">
        <ArrowIcon className="mb-7 size-11 text-accent mob:mb-5 mob:size-9 mob:rotate-90" />
        <h2 id="start-title" className={sectionHeadingClass}>
          {title}
        </h2>
        <p className="mt-4 max-w-[18em] text-[1.1875rem] leading-[1.45] text-ink">{description}</p>
      </div>
      <ol role="list" className="col-span-7 col-start-6 self-end mob:mt-6">
        {posts.map((post, i) => (
            <li
              key={post.slug}
              className="group relative grid grid-cols-[96px_minmax(0,1fr)] gap-x-2 border-t border-hair pt-8 pb-[34px] last:border-b tab:grid-cols-[64px_minmax(0,1fr)] mob:grid-cols-[52px_minmax(0,1fr)] mob:pt-6 mob:pb-[26px]"
            >
              <span
                aria-hidden="true"
                className="text-[4rem] leading-[0.8] font-bold tracking-[-0.04em] text-accent tabular-nums mob:text-[2.75rem]"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-[clamp(1.375rem,2vw,1.75rem)] leading-[1.15] font-medium tracking-[-0.02em] text-balance text-ink transition-colors group-hover:text-accent">
                  <Link href={`/posts/${post.slug}`} className="post-link">
                    {post.title}
                  </Link>
                </h3>
                {post.subtitle && (
                  <p className="mt-2 font-serif text-[1.1875rem] leading-[1.4] text-pretty text-muted italic mob:text-[1.0625rem]">
                    {post.subtitle}
                  </p>
                )}
                <PostMeta
                  date={post.date}
                  readingMinutes={post.readingMinutes}
                  className="mt-3.5 text-[0.9375rem] font-medium tracking-[0.005em] text-faint tabular-nums mob:text-[0.875rem]"
                />
              </div>
            </li>
        ))}
      </ol>
    </section>
  );
}
