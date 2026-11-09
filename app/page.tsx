import { getAllPosts } from '@/lib/posts';
import { chapters, entryNumbers, SITUATIONS, TOOLS } from '@/lib/manual';
import { Chapters } from './components/home/Chapters';
import { Situations } from './components/home/Situations';
import { Toolkit } from './components/home/Toolkit';
import type { HomeEntry } from './components/home/types';

/**
 * The home page is the manual's front matter, in three parts: situations
 * (reading orders by problem), the toolkit and the chapters. A server page
 * with three small client islands; each renders its default state on the
 * server, so the page reads fine before (or without) script.
 */
export default async function HomePage() {
  const posts = await getAllPosts();
  const numbers = entryNumbers(posts);
  const entry = (p: (typeof posts)[number]): HomeEntry => ({
    slug: p.slug,
    title: p.title,
    number: numbers.get(p.slug) ?? '',
    minutes: p.readingMinutes,
    draft: p.draft,
  });
  const titles = Object.fromEntries(posts.map((p) => [p.slug, p.title]));

  return (
    <>
      <Situations situations={SITUATIONS} entries={posts.map(entry)} count={posts.length} />
      <Toolkit tools={TOOLS} titles={titles} />
      <Chapters
        total={posts.length}
        chapters={chapters(posts).map((c) => ({ theme: c.theme, number: c.number, entries: c.entries.map((e) => entry(e.post)) }))}
      />
    </>
  );
}
