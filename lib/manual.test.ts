import { describe, expect, it } from 'vitest';
import { chapters, chapterOf, entryNumbers, locate, ordersFor, SITUATIONS, THEMES, toolsFor } from './manual';
import { getAllPosts, type Post } from './posts';

const post = (slug: string, date: string, themes: string[], extra: Partial<Post> = {}): Post => ({
  slug,
  title: slug,
  metaTitle: slug,
  subtitle: null,
  description: null,
  date,
  readingMinutes: 3,
  draft: false,
  words: 600,
  themes,
  quote: null,
  importDate: false,
  ...extra,
});

describe('chapters', () => {
  it('files each post under its first theme and numbers by date within the chapter', () => {
    const posts = [
      post('b', '2024-02-01', ['ai']),
      post('a', '2024-01-01', ['ai', 'people']),
      post('p', '2023-01-01', ['people']),
    ];
    const chs = chapters(posts);
    expect(chs.map((c) => c.theme.id)).toEqual(THEMES.map((t) => t.id));
    const ai = chs.find((c) => c.theme.id === 'ai')!;
    expect(ai.entries.map((e) => [e.post.slug, e.number])).toEqual([['a', '4.1'], ['b', '4.2']]);
    expect(entryNumbers(posts).get('p')).toBe('1.1');
  });

  it('breaks date ties by title, so the Substack imports keep a stable order', () => {
    const posts = [post('zebra', '2023-09-18', ['words']), post('apple', '2023-09-18', ['words'])];
    expect(chapters(posts)[1].entries.map((e) => e.post.slug)).toEqual(['apple', 'zebra']);
  });

  it('puts drafts after every published entry so they never shift a number', () => {
    const posts = [post('draft', '2020-01-01', ['ai'], { draft: true }), post('live', '2024-01-01', ['ai'])];
    expect(entryNumbers(posts).get('live')).toBe('4.1');
    expect(entryNumbers(posts).get('draft')).toBe('4.2');
  });

  it('sends a post with no known theme to the first chapter', () => {
    expect(chapterOf(post('x', '2024-01-01', [])).id).toBe(THEMES[0].id);
  });
});

describe('locate', () => {
  it('finds the next published entry in the chapter, wrapping round and skipping drafts', () => {
    const posts = [
      post('one', '2024-01-01', ['ai']),
      post('two', '2024-02-01', ['ai']),
      post('wip', '2024-03-01', ['ai'], { draft: true }),
    ];
    expect(locate(posts, 'one')?.next?.post.slug).toBe('two');
    expect(locate(posts, 'two')?.next?.post.slug).toBe('one');
    expect(locate(posts, 'wip')?.next?.post.slug).toBe('one');
    expect(locate(posts, 'missing')).toBeNull();
  });
});

describe('situations and tools', () => {
  it('gives a post its step on every reading order it is on', () => {
    const [first] = SITUATIONS;
    const [slug] = first.path[1];
    expect(ordersFor(slug).find((o) => o.id === first.id)?.step).toBe(1);
  });

  it('finds the tools that come from a post', () => {
    expect(toolsFor('waist').map((t) => t.id)).toEqual(['waist']);
    expect(toolsFor('no-such-post')).toEqual([]);
  });
});

describe('entry numbers on the real posts', () => {
  // A changed number means old links and share cards point at a different
  // entry. If this snapshot changes, check it was meant to.
  it('match the snapshot', async () => {
    const posts = await getAllPosts();
    expect(Object.fromEntries(entryNumbers(posts))).toMatchSnapshot();
  });
});
