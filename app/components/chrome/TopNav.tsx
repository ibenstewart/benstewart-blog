'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavLink = { label: string; href: string; /** Hidden on phones, where the row runs out of room. */ wide?: boolean };

/** Which link a path belongs to: entries count as chapters, the listing as all entries. */
export function currentLabel(pathname: string): string | null {
  if (pathname === '/posts') return 'all entries';
  if (pathname.startsWith('/posts/')) return 'chapters';
  if (pathname.startsWith('/speaking')) return 'speaking';
  if (pathname.startsWith('/bio')) return 'bio';
  return null;
}

/**
 * The top bar's links. The page you're on is ink and marked aria-current;
 * the rest are grey. Hash links into the home page never claim to be current.
 */
export function TopNav({ links }: { links: NavLink[] }) {
  const current = currentLabel(usePathname() ?? '/');
  return (
    <nav aria-label="Main" className="mob:-mx-1.5 mob:w-full mob:overflow-x-auto">
      <ul role="list" className="flex gap-1 font-mono text-[0.875rem] mob:text-[0.8125rem]">
        {links.map((l) => {
          const on = l.label === current;
          return (
            <li key={l.label} className={l.wide ? 'mob:hidden' : undefined}>
              <Link
                href={l.href}
                aria-current={on ? 'page' : undefined}
                className={`inline-flex min-h-[32px] items-center rounded-lg px-2 whitespace-nowrap no-underline transition-colors hover:bg-hi hover:text-ink mob:px-1.5 ${
                  on ? 'text-ink underline decoration-accent decoration-2 underline-offset-[0.35em]' : 'text-faint'
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
