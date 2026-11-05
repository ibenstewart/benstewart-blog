import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { currentHref, SiteNav } from './SiteNav';

const links = [
  { name: 'posts', url: '/posts' },
  { name: 'bio', url: '/bio' },
  { name: 'speaking', url: '/speaking' },
];

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('currentHref', () => {
  it('matches a section page and the pages under it', () => {
    expect(currentHref('/posts', links)).toBe('/posts');
    expect(currentHref('/posts/sustainable', links)).toBe('/posts');
    expect(currentHref('/bio', links)).toBe('/bio');
  });

  it('matches nothing on the homepage or a lookalike path', () => {
    expect(currentHref('/', links)).toBeNull();
    expect(currentHref('/postscript', links)).toBeNull();
    expect(currentHref(null, links)).toBeNull();
  });
});

describe('SiteNav', () => {
  it('marks the current page', () => {
    pathname = '/bio';
    render(<SiteNav links={links} />);
    expect(screen.getByRole('link', { name: 'bio' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'posts' })).not.toHaveAttribute('aria-current');
  });

  it('marks the section, not the page, inside a post', () => {
    pathname = '/posts/sustainable';
    render(<SiteNav links={links} />);
    expect(screen.getByRole('link', { name: 'posts' })).toHaveAttribute('aria-current', 'true');
  });

  it('marks nothing on the homepage', () => {
    pathname = '/';
    render(<SiteNav links={links} />);
    for (const link of screen.getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });
});
