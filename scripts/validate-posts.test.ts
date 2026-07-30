import { describe, expect, it } from 'vitest';
import { checkPostHeaderFormat } from './validate-posts.mjs';

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
