import type { Post } from './posts';
import * as data from './manual-data.mjs';

/**
 * The Field manual's structure on top of the post index: chapters, entry
 * numbers, situations (reading orders) and tools. The copy lives in
 * lib/manual-data.mjs; this file types it and works things out from it.
 */

export type ThemeId = 'people' | 'words' | 'breaks' | 'ai' | 'self';
export type Theme = { id: ThemeId; name: string; colour: string };
export type Situation = { id: string; label: string; path: [slug: string, why: string][] };
export type Tool = { id: string; name: string; slug: string; line: string };

export const THEMES = data.THEMES as Theme[];
export const SITUATIONS = data.SITUATIONS as Situation[];
export const TOOLS = data.TOOLS as Tool[];

export type Entry = { post: Post; number: string };
export type Chapter = { theme: Theme; number: number; entries: Entry[] };

/** The chapter a post lives in: its first theme. Posts with no known theme go in the first chapter. */
export function chapterOf(post: Pick<Post, 'themes'>): Theme {
  return THEMES.find((t) => t.id === post.themes[0]) ?? THEMES[0];
}

/**
 * Chapters in manual order. A post is numbered by date within its chapter
 * (title breaks ties), so a new post lands at the end and existing numbers
 * never move. Drafts sort after every published post, so previewing one
 * doesn't shift anything either.
 */
export function chapters(posts: Post[]): Chapter[] {
  return THEMES.map((theme, ci) => {
    const entries = posts
      .filter((p) => chapterOf(p).id === theme.id)
      .sort(
        (a, b) =>
          Number(a.draft) - Number(b.draft) ||
          (a.date ?? '').localeCompare(b.date ?? '') ||
          a.title.localeCompare(b.title)
      )
      .map((post, i) => ({ post, number: `${ci + 1}.${i + 1}` }));
    return { theme, number: ci + 1, entries };
  });
}

/** Every entry number by slug. */
export function entryNumbers(posts: Post[]): Map<string, string> {
  return new Map(chapters(posts).flatMap((c) => c.entries.map((e) => [e.post.slug, e.number] as const)));
}

/** Where a post sits: its chapter, its entry and the next entry in the chapter (wrapping round). */
export function locate(posts: Post[], slug: string) {
  for (const chapter of chapters(posts)) {
    const i = chapter.entries.findIndex((e) => e.post.slug === slug);
    if (i === -1) continue;
    const published = chapter.entries.filter((e) => !e.post.draft && e.post.slug !== slug);
    const after = chapter.entries.slice(i + 1).find((e) => !e.post.draft) ?? published[0] ?? null;
    return { chapter, entry: chapter.entries[i], next: after };
  }
  return null;
}

/** The reading orders a post is on, with its step in each. */
export function ordersFor(slug: string) {
  return SITUATIONS.flatMap((s) => {
    const step = s.path.findIndex(([p]) => p === slug);
    return step === -1 ? [] : [{ ...s, step }];
  });
}

/** The tools that come from a post. */
export function toolsFor(slug: string): Tool[] {
  return TOOLS.filter((t) => t.slug === slug);
}

/** Where an entry lives. */
export const entryHref = (slug: string) => `/posts/${slug}`;
