import Link from 'next/link';
import { getAllPosts, pickPosts } from '@/lib/posts';
import { entryNumbers, locate, ordersFor, toolsFor } from '@/lib/manual';
import { EntryCard } from './manual/EntryCard';
import { NextStep, type OrderView } from './manual/NextStep';
import { ReadToggle } from './manual/ReadToggle';
import { ToolArt } from './manual/ToolArt';
import { textLinkClass } from './TextLink';

type PostNavProps = {
  slug: string;
  related?: string[];
};

/**
 * The end of every entry: the tool it gave the toolkit, the next step (its
 * reading order, or the next entry in its chapter), the hand-picked related
 * entries, newer and older by date, and a short note from the author.
 */
export async function PostNav({ slug, related = [] }: PostNavProps) {
  const all = await getAllPosts(undefined, { includeDrafts: true });
  const published = all.filter((p) => !p.draft);
  const numbers = entryNumbers(all);
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const where = locate(all, slug);
  const tools = toolsFor(slug);

  const orders: OrderView[] = ordersFor(slug).map((o) => ({
    id: o.id,
    label: o.label,
    step: o.step,
    items: o.path.flatMap(([s, why]) => {
      const p = bySlug.get(s);
      return p ? [{ slug: s, title: p.title, number: numbers.get(s) ?? '', minutes: p.readingMinutes, why }] : [];
    }),
  }));
  const next = where?.next;
  const chapterNext = next
    ? {
        chapter: `chapter ${where.chapter.number} · ${where.chapter.theme.name}`,
        number: next.number,
        slug: next.post.slug,
        title: next.post.title,
        subtitle: next.post.subtitle,
      }
    : null;

  const relatedPosts = pickPosts(published, related);
  const index = published.findIndex((p) => p.slug === slug);
  const newer = index > 0 ? published[index - 1] : null;
  const older = index !== -1 && index < published.length - 1 ? published[index + 1] : null;

  return (
    <section aria-label="What next" className="entry-end col-bleed mt-[var(--section)] border-t-2 border-ink">
      <div className="mx-auto grid max-w-[1180px] gap-16 px-[var(--gutter)] py-16 mob:gap-12 mob:py-12">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-[1.25rem] font-bold tracking-[-0.015em] text-ink">Finished?</p>
          <ReadToggle slug={slug} />
        </div>

        {tools.map((t) => (
          <div key={t.id} data-open className="tool-card grid grid-cols-[220px_minmax(0,1fr)] items-center gap-8 rounded-3xl border-2 border-ink bg-card p-6 cards:grid-cols-1">
            <div className="h-[170px]"><ToolArt id={t.id} /></div>
            <div>
              <p className="label text-faint">The tool in this entry</p>
              <p className="mt-2 text-[1.75rem] font-bold tracking-[-0.02em] text-ink">{t.name}</p>
              <p className="mt-1 max-w-[46ch] text-[1.0625rem] leading-[1.5] text-muted">{t.line}</p>
              <Link href="/#toolkit" className={`mt-3 inline-block text-[0.9375rem] font-bold ${textLinkClass}`}>All six tools</Link>
            </div>
          </div>
        ))}

        <NextStep orders={orders} chapterNext={chapterNext} />

        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-[clamp(2rem,3vw,2.75rem)] leading-none font-bold tracking-[-0.035em] text-ink">Keep reading</h2>
            <ul role="list" className="mt-8 grid grid-cols-3 gap-4 cards:grid-cols-1">
              {relatedPosts.map((p) => (
                <EntryCard key={p.slug} post={p} number={numbers.get(p.slug)} />
              ))}
            </ul>
          </div>
        )}

        {(newer || older) && (
          <nav aria-label="By date" className="grid grid-cols-2 gap-x-6 border-y-2 border-ink mob:grid-cols-1">
            {newer && (
              <Link href={`/posts/${newer.slug}`} className="group col-start-1 block py-6 text-ink no-underline">
                <span className="label flex items-center gap-2 text-accent"><span aria-hidden className="nudge nudge-back">←</span>Newer</span>
                <span className="mt-2 block text-[1.25rem] font-bold tracking-[-0.015em] group-hover:underline">{newer.title}</span>
              </Link>
            )}
            {older && (
              <Link href={`/posts/${older.slug}`} className={`group col-start-2 block py-6 text-right text-ink no-underline mob:col-start-1 mob:text-left ${newer ? 'mob:border-t-2 mob:border-ink' : ''}`}>
                <span className="label flex items-center justify-end gap-2 text-accent mob:justify-start">Older<span aria-hidden className="nudge">→</span></span>
                <span className="mt-2 block text-[1.25rem] font-bold tracking-[-0.015em] group-hover:underline">{older.title}</span>
              </Link>
            )}
          </nav>
        )}

        <aside aria-label="About the author" className="max-w-[680px]">
          <p className="text-[1.0625rem] leading-[1.62] text-muted">
            {"I'm Ben Stewart, VP of Engineering at Skyscanner, and I write field reports here about leading engineering teams through AI. If this entry doesn't match what you've seen, tell me at "}
            <a href="mailto:ben@benstewart.ai" className={textLinkClass}>ben@benstewart.ai</a>
            {". I'm on "}
            <a href="https://www.linkedin.com/in/ben-stewart-90944595/" target="_blank" rel="noopener noreferrer" className={textLinkClass}>LinkedIn</a>
            {', and the '}
            <Link href="/feed.xml" className={textLinkClass}>RSS feed</Link>
            {' gets every new entry. Running a podcast or an event? '}
            <Link href="/speaking" className={textLinkClass}>{"Here's what I talk about"}</Link>.
          </p>
        </aside>
      </div>
    </section>
  );
}
