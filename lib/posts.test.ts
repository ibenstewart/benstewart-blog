import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getAllPosts } from './posts';

async function setupPostsDir() {
  const root = await mkdtemp(join(tmpdir(), 'posts-test-'));
  const postsDir = join(root, 'app', 'posts');
  await mkdir(postsDir, { recursive: true });
  return { root, postsDir };
}

async function writePost(postsDir: string, slug: string, body: string) {
  const dir = join(postsDir, slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'page.mdx'), body, 'utf-8');
}

describe('getAllPosts', () => {
  let postsDir: string;
  let root: string;

  beforeEach(async () => {
    ({ root, postsDir } = await setupPostsDir());
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('discovers every post directory containing a page.mdx', async () => {
    await writePost(postsDir, 'alpha', `export const metadata = { title: "A", date: "2024-01-01" };`);
    await writePost(postsDir, 'beta', `export const metadata = { title: "B", date: "2024-02-02" };`);

    const posts = await getAllPosts(postsDir);
    expect(posts.map((p) => p.slug).sort()).toEqual(['alpha', 'beta']);
  });

  it('skips files that are not page.mdx', async () => {
    const dir = join(postsDir, 'a-post');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'page.mdx'), `export const metadata = { title: "Real", date: "2024-01-01" };`);
    await writeFile(join(dir, 'Widget.tsx'), `export const metadata = { title: "Not a post", date: "1999-12-31" };`);

    const posts = await getAllPosts(postsDir);
    expect(posts).toHaveLength(1);
    expect(posts[0].metaTitle).toBe('Real');
  });

  it('uses the first H1 heading as the display title and metadata title for SEO', async () => {
    await writePost(
      postsDir,
      'a-post',
      [
        'export const metadata = {',
        '  title: "Long SEO Title: Why You Should Care",',
        '  date: "2024-05-12",',
        '};',
        '',
        '# Short Display Title',
        '',
        'Body text.',
      ].join('\n')
    );

    const [post] = await getAllPosts(postsDir);
    expect(post.title).toBe('Short Display Title');
    expect(post.metaTitle).toBe('Long SEO Title: Why You Should Care');
  });

  it('falls back to the metadata title when there is no H1', async () => {
    await writePost(postsDir, 'no-h1', `export const metadata = { title: "Only Title", date: "2024-01-01" };`);

    const [post] = await getAllPosts(postsDir);
    expect(post.title).toBe('Only Title');
  });

  it('extracts subtitle and description', async () => {
    await writePost(
      postsDir,
      'full',
      [
        'export const metadata = {',
        '  title: "T",',
        '  date: "2024-01-01",',
        '  subtitle: "A short subtitle",',
        '  description: "A longer description for SEO.",',
        '};',
      ].join('\n')
    );

    const [post] = await getAllPosts(postsDir);
    expect(post.subtitle).toBe('A short subtitle');
    expect(post.description).toBe('A longer description for SEO.');
  });

  it('unescapes quotes in single-quoted values', async () => {
    await writePost(
      postsDir,
      'apostrophe',
      `export const metadata = { title: 'Ralph Isn\\'t the Point', date: "2024-01-01" };`
    );

    const [post] = await getAllPosts(postsDir);
    expect(post.metaTitle).toBe("Ralph Isn't the Point");
  });

  it('sorts newest first, breaking date ties by title', async () => {
    await writePost(postsDir, 'old', `export const metadata = { title: "Old", date: "2020-01-01" };`);
    await writePost(postsDir, 'tie-b', `export const metadata = { title: "Bravo", date: "2024-01-01" };`);
    await writePost(postsDir, 'tie-a', `export const metadata = { title: "Alpha", date: "2024-01-01" };`);
    await writePost(postsDir, 'new', `export const metadata = { title: "New", date: "2025-06-06" };`);

    const posts = await getAllPosts(postsDir);
    expect(posts.map((p) => p.slug)).toEqual(['new', 'tie-a', 'tie-b', 'old']);
  });

  it('returns a null date when metadata has no date', async () => {
    await writePost(postsDir, 'undated', `# Just a heading`);

    const [post] = await getAllPosts(postsDir);
    expect(post.date).toBeNull();
    expect(post.title).toBe('Just a heading');
  });

  it('uses the PostHeader title prop as the display title when present', async () => {
    await writePost(
      postsDir,
      'migrated',
      [
        'export const metadata = {',
        '  title: "Long SEO Title: Why You Should Care",',
        '  date: "2024-05-12",',
        '};',
        '',
        '<PostHeader title="Short Display Title" slug="migrated" />',
        '',
        'Body text.',
      ].join('\n')
    );

    const [post] = await getAllPosts(postsDir);
    expect(post.title).toBe('Short Display Title');
    expect(post.metaTitle).toBe('Long SEO Title: Why You Should Care');
  });

  it('prefers the PostHeader title prop over a legacy H1 when both are present', async () => {
    await writePost(
      postsDir,
      'both',
      [
        'export const metadata = { title: "Meta Title", date: "2024-01-01" };',
        '',
        '# Legacy Heading',
        '',
        '<PostHeader title="PostHeader Title" slug="both" />',
      ].join('\n')
    );

    const [post] = await getAllPosts(postsDir);
    expect(post.title).toBe('PostHeader Title');
  });

  it('unescapes quotes in a PostHeader title prop', async () => {
    await writePost(
      postsDir,
      'apostrophe-header',
      [
        'export const metadata = { title: "Meta", date: "2024-01-01" };',
        '',
        `<PostHeader title="Ralph Isn\\'t the Point" slug="apostrophe-header" />`,
      ].join('\n')
    );

    const [post] = await getAllPosts(postsDir);
    expect(post.title).toBe("Ralph Isn't the Point");
  });

  describe('readingMinutes', () => {
    it('rounds to the nearest minute at 230 words per minute', async () => {
      const words = new Array(460).fill('word').join(' '); // 460 words -> 2 min
      await writePost(
        postsDir,
        'two-minutes',
        [
          'export const metadata = { title: "T", date: "2024-01-01" };',
          '',
          `# Title`,
          '',
          words,
        ].join('\n')
      );

      const [post] = await getAllPosts(postsDir);
      expect(post.readingMinutes).toBe(2);
    });

    it('floors reading time at 1 minute for very short posts', async () => {
      await writePost(
        postsDir,
        'short',
        [
          'export const metadata = { title: "T", date: "2024-01-01" };',
          '',
          '# Title',
          '',
          'Just a few words here.',
        ].join('\n')
      );

      const [post] = await getAllPosts(postsDir);
      expect(post.readingMinutes).toBe(1);
    });

    it('excludes the metadata block, JSX tags, and fenced code blocks from the word count', async () => {
      const bodyWords = new Array(230).fill('word').join(' '); // exactly 1 min of real body words
      const codeFillerWords = new Array(1000).fill('codefiller').join(' '); // would alone push well past 1 min if counted
      const descriptionFillerWords = new Array(100).fill('padding').join(' ');
      await writePost(
        postsDir,
        'stripped',
        [
          'export const metadata = {',
          '  title: "T",',
          '  date: "2024-01-01",',
          `  description: "${descriptionFillerWords}",`,
          '};',
          '',
          '<PostHeader title="Title" slug="stripped" />',
          '',
          '<PostSchema title="T" description="d" date="2024-01-01" slug="stripped" />',
          '',
          '```js',
          codeFillerWords,
          '```',
          '',
          bodyWords,
        ].join('\n')
      );

      const [post] = await getAllPosts(postsDir);
      // If the metadata block, JSX tags, or fenced code block leaked into the
      // count, 1000+ extra words would push this well past 1 minute.
      expect(post.readingMinutes).toBe(1);
    });
  });
});
