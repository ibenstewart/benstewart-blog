import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { useMDXComponents } from './mdx-components';

const components = useMDXComponents();
const A = components.a;

function renderLink(props: { href?: string; children?: React.ReactNode }) {
  const { container } = render(<A {...props}>{props.children ?? 'link'}</A>);
  const anchor = container.querySelector('a');
  if (!anchor) throw new Error('expected an <a> to be rendered');
  return anchor;
}

describe('mdx-components <a>', () => {
  it('renders an internal absolute path through next/link (no target/rel)', () => {
    const a = renderLink({ href: '/posts/waist' });

    expect(a).toHaveAttribute('href', '/posts/waist');
    expect(a).not.toHaveAttribute('target');
    expect(a).not.toHaveAttribute('rel');
  });

  it('renders an in-page anchor as a plain <a> with no target/rel', () => {
    const a = renderLink({ href: '#section-two' });

    expect(a).toHaveAttribute('href', '#section-two');
    expect(a).not.toHaveAttribute('target');
    expect(a).not.toHaveAttribute('rel');
  });

  it('renders an external https link with target=_blank and rel=noopener noreferrer', () => {
    const a = renderLink({ href: 'https://example.com/article' });

    expect(a).toHaveAttribute('href', 'https://example.com/article');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('treats mailto: as external (target=_blank, rel set)', () => {
    const a = renderLink({ href: 'mailto:ben@benstewart.ai' });

    expect(a).toHaveAttribute('href', 'mailto:ben@benstewart.ai');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('treats http:// as external', () => {
    const a = renderLink({ href: 'http://example.com' });

    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves children content', () => {
    const a = renderLink({ href: '/bio', children: 'About Ben' });
    expect(a).toHaveTextContent('About Ben');
  });

  it('applies the underline class to every link variant', () => {
    const internal = renderLink({ href: '/posts' });
    const anchor = renderLink({ href: '#top' });
    const external = renderLink({ href: 'https://example.com' });

    for (const a of [internal, anchor, external]) {
      expect(a.className).toMatch(/underline/);
    }
  });
});
