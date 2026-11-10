import Link from 'next/link';
import { getAllPosts, pickPosts, type Post } from '@/lib/posts';
import { entryNumbers, locate, ordersFor, toolsFor } from '@/lib/manual';
import { NextStep, type OrderStepView, type StepView } from './manual/NextStep';
import { ReadToggle } from './manual/ReadToggle';
import { textLinkClass } from './TextLink';

type PostNavProps = {
  slug: string;
  related?: string[];
};

/**
 * The end of every entry, kept short on purpose: Mark as read, one next step
 * (the reading order it's on, otherwise the next entry in its chapter) with
 * the hand-picked related entries beside it as plain links, newer and older
 * by date, and two lines from the author.
 */
export async function PostNav({ slug, related = [] }: PostNavProps) {
  const all = await getAllPosts(undefined, { includeDrafts: true });
  const published = all.filter((p) => !p.draft);
  const numbers = entryNumbers(all);
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const where = locate(all, slug);
  const tools = toolsFor(slug);

  const index = published.findIndex((p) => p.slug === slug);
  const newer = index > 0 ? published[index - 1] : null;
  const older = index !== -1 && index < published.length - 1 ? published[index + 1] : null;
  const relatedPosts = pickPosts(published, related);

  const orderSteps: OrderStepView[] = ordersFor(slug).flatMap((o) => {
    const step = o.path[o.step + 1];
    const post = step && bySlug.get(step[0]);
    if (!post || post.draft) return [];
    return [{
      id: o.id,
      label: `Next · ${o.label} · step ${o.step + 2} of ${o.path.length}`,
      slug: post.slug,
      href: `/posts/${post.slug}?via=${o.id}`,
      number: numbers.get(post.slug) ?? '',
      title: post.title,
      line: step[1],
    }];
  });

  const plain = (label: string, p: Post): StepView => ({
    label,
    slug: p.slug,
    href: `/posts/${p.slug}`,
    number: numbers.get(p.slug) ?? '',
    title: p.title,
    line: p.subtitle ?? p.quote ?? null,
  });
  const chapterNext = where?.next?.post;
  const spare = relatedPosts[0] ?? older ?? newer;
  const fallback = chapterNext
    ? plain(`Next in chapter ${where.chapter.number} · ${where.chapter.theme.name}`, chapterNext)
    : spare
      ? plain('Next', spare)
      : null;

  return (
    <section aria-label="What next" className="entry-end col-bleed mt-[var(--section)] border-t-2 border-ink">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-[var(--gutter)] py-14 mob:gap-10 mob:py-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ReadToggle slug={slug} />
          {tools.map((t) => (
            <p key={t.id} className="text-[1rem] text-muted">
              {'This is where '}
              <Link href="/#toolkit" className={`font-bold ${textLinkClass}`}>{t.name}</Link>
              {' in the toolkit comes from.'}
            </p>
          ))}
        </div>

        <NextStep
          orderSteps={orderSteps}
          finished={ordersFor(slug).filter((o) => o.step === o.path.length - 1).map((o) => o.id)}
          fallback={fallback}
          related={relatedPosts.map((p) => ({ slug: p.slug, number: numbers.get(p.slug) ?? '', title: p.title, minutes: p.readingMinutes }))}
        />

        {(newer || older) && (
          <nav aria-label="By date" className="grid grid-cols-2 gap-x-6 border-t-2 border-ink pt-5 mob:grid-cols-1 mob:gap-y-4">
            {newer && (
              <Link href={`/posts/${newer.slug}`} className="group col-start-1 block text-ink no-underline">
                <span className="label flex items-center gap-2 text-accent"><span aria-hidden className="nudge nudge-back">←</span>Newer</span>
                <span className="mt-1 block text-[1.0625rem] font-bold group-hover:underline">{newer.title}</span>
              </Link>
            )}
            {older && (
              <Link href={`/posts/${older.slug}`} className="group col-start-2 block text-right text-ink no-underline mob:col-start-1 mob:text-left">
                <span className="label flex items-center justify-end gap-2 text-accent mob:justify-start">Older<span aria-hidden className="nudge">→</span></span>
                <span className="mt-1 block text-[1.0625rem] font-bold group-hover:underline">{older.title}</span>
              </Link>
            )}
          </nav>
        )}

        <aside aria-label="About the author" className="max-w-[680px]">
          <p className="text-[1rem] leading-[1.6] text-muted">
            {"I'm Ben Stewart, VP of Engineering at Skyscanner. If this doesn't match what you've seen, tell me at "}
            <a href="mailto:ben@benstewart.ai" className={textLinkClass}>ben@benstewart.ai</a>
            {' or on '}
            <a href="https://www.linkedin.com/in/ben-stewart-90944595/" target="_blank" rel="noopener noreferrer" className={textLinkClass}>LinkedIn</a>
            {'. The '}
            <Link href="/feed.xml" className={textLinkClass}>RSS feed</Link>
            {' gets everything new.'}
          </p>
        </aside>
      </div>
    </section>
  );
}
