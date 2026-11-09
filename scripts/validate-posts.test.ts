import { describe, expect, it } from 'vitest';
import { checkManualMetadata, checkManualRefs, checkPostHeaderFormat } from './validate-posts.mjs';

describe('checkPostHeaderFormat', () => {
  it('fails when the body has both a legacy H1 and a <PostHeader> (mixed format)', () => {
    const body = [
      '# Legacy Heading',
      '',
      '<PostHeader title="New Title" slug="my-post" />',
      '',
      'Body text.',
    ].join('\n');

    const errors = checkPostHeaderFormat(body, 'my-post');
    expect(errors).toContain(
      'post body has both a legacy "# " H1 and a <PostHeader> component (mixed format not allowed)'
    );
  });

  it('fails when the body has neither a legacy H1 nor a <PostHeader>', () => {
    const body = ['Just some body text.', '', 'No heading at all.'].join('\n');

    const errors = checkPostHeaderFormat(body, 'my-post');
    expect(errors).toContain(
      'post body has neither a legacy "# " H1 nor a <PostHeader> component'
    );
  });

  it('passes for a valid PostHeader-only post', () => {
    const body = [
      '<PostHeader title="My Post" slug="my-post" />',
      '',
      'Body text.',
    ].join('\n');

    expect(checkPostHeaderFormat(body, 'my-post')).toEqual([]);
  });

  it('fails when the PostHeader slug does not match the directory slug', () => {
    const body = [
      '<PostHeader title="My Post" slug="wrong-slug" />',
      '',
      'Body text.',
    ].join('\n');

    const errors = checkPostHeaderFormat(body, 'my-post');
    expect(errors).toContain('PostHeader slug "wrong-slug" does not match directory "my-post"');
  });

  it('passes for a valid PostHeader post whose body has a fenced code block containing a "# " line (regression case)', () => {
    const body = [
      '<PostHeader title="My Post" slug="my-post" />',
      '',
      'Here is a shell snippet:',
      '',
      '```bash',
      '# This is a comment, not a markdown heading',
      'echo "hello"',
      '```',
      '',
      'More body text.',
    ].join('\n');

    expect(checkPostHeaderFormat(body, 'my-post')).toEqual([]);
  });

  it('passes for a legacy H1-only post', () => {
    const body = ['# My Legacy Post', '', 'Body text.'].join('\n');

    expect(checkPostHeaderFormat(body, 'my-post')).toEqual([]);
  });
});

describe('checkManualMetadata', () => {
  const meta = (extra: string) => `{ title: "T", date: "2024-01-01", ${extra} }`;

  it('passes with known themes and a quote', () => {
    expect(checkManualMetadata(meta('themes: ["ai", "words"], quote: "A line."'))).toEqual([]);
  });

  it('fails when themes are missing, empty, unknown, repeated or too many', () => {
    expect(checkManualMetadata(meta('quote: "A line."'))[0]).toMatch(/missing metadata.themes/);
    expect(checkManualMetadata(meta('themes: [], quote: "A line."'))[0]).toMatch(/is empty/);
    expect(checkManualMetadata(meta('themes: ["robots"], quote: "A line."'))[0]).toMatch(/unknown theme "robots"/);
    expect(checkManualMetadata(meta('themes: ["ai", "ai"], quote: "A line."'))[0]).toMatch(/repeats a theme/);
    expect(
      checkManualMetadata(meta('themes: ["ai", "words", "self", "people", "breaks", "ai"], quote: "A line."')).join(' ')
    ).toMatch(/the most is 5/);
  });

  it('fails when the quote is missing or empty', () => {
    expect(checkManualMetadata(meta('themes: ["ai"]'))).toEqual(['missing metadata.quote (one pull line from the post)']);
    expect(checkManualMetadata(meta('themes: ["ai"], quote: "  "'))).toEqual(['metadata.quote is empty']);
  });
});

describe('checkManualRefs', () => {
  it('passes against the real posts and fails for a missing or draft post', async () => {
    const { manualSlugRefs } = await import('../lib/manual-data.mjs');
    const slugs = [...new Set(manualSlugRefs().map((r: { slug: string }) => r.slug))] as string[];
    expect(checkManualRefs(slugs, new Set(slugs))).toEqual([]);

    const [gone, drafted, ...rest] = slugs;
    const errors = checkManualRefs([drafted, ...rest], new Set(rest));
    expect(errors.some((e: string) => e.includes(`"${gone}", which has no post directory`))).toBe(true);
    expect(errors.some((e: string) => e.includes(`"${drafted}", which is a draft`))).toBe(true);
  });
});
