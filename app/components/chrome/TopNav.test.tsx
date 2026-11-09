import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { currentLabel, TopNav } from './TopNav';

let pathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

const links = [
  { label: 'toolkit', href: '/#toolkit', wide: true },
  { label: 'all entries', href: '/posts' },
  { label: 'bio', href: '/bio' },
];

describe('currentLabel', () => {
  it('maps paths to the link they belong to', () => {
    expect(currentLabel('/posts')).toBe('all entries');
    expect(currentLabel('/posts/waist')).toBe('chapters');
    expect(currentLabel('/speaking')).toBe('speaking');
    expect(currentLabel('/bio')).toBe('bio');
    expect(currentLabel('/')).toBeNull();
  });
});

describe('TopNav', () => {
  it('marks only the current page', () => {
    pathname = '/bio';
    render(<TopNav links={links} />);
    expect(screen.getByRole('link', { name: 'bio' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'all entries' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'toolkit' }).closest('li')).toHaveClass('mob:hidden');
  });
});
