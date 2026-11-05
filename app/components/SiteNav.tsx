'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

export type NavLink = { name: string; url: string };

/** The nav link the current path sits under (`/posts/x` is under `/posts`), if any. */
export function currentHref(pathname: string | null, links: NavLink[]): string | null {
  if (!pathname) return null;
  const match = links.find((link) => pathname === link.url || pathname.startsWith(`${link.url}/`));
  return match ? match.url : null;
}

const linkClass =
  'relative z-[1] inline-flex h-11 items-center rounded-full px-5 text-[1.0625rem] font-medium tracking-[-0.005em] text-white no-underline transition-colors hover:underline hover:decoration-[length:1.5px] hover:underline-offset-[5px] focus-visible:outline-2 focus-visible:-outline-offset-6 focus-visible:outline-white mob:h-[38px] mob:px-3 mob:text-base tight:px-2.5 tight:text-[0.9375rem]';

/**
 * The blue nav pill (DESIGN.md 4.1) with a "you are here" marker (3.6): one
 * deep-blue segment sits under the current section and glides to whichever
 * link is hovered or focused, then back. The segment is measured from the
 * links, so it follows font loading and resizes. Before hydration (or without
 * script) the current link carries the fill itself; `data-ready` hands it to
 * the segment. Reduced motion makes the segment jump instead of glide.
 */
export function SiteNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const current = currentHref(pathname, links);
  const navRef = useRef<HTMLElement>(null);
  const segRef = useRef<HTMLSpanElement>(null);

  const place = useCallback((target: HTMLElement | null, instant = false) => {
    const nav = navRef.current;
    const seg = segRef.current;
    if (!nav || !seg) return;
    if (!target) {
      delete seg.dataset.on;
      return;
    }
    // Appearing from nothing should not slide in from the last spot.
    if (instant || seg.dataset.on === undefined) {
      nav.dataset.instant = '';
      requestAnimationFrame(() => requestAnimationFrame(() => delete nav.dataset.instant));
    }
    seg.style.width = `${target.offsetWidth}px`;
    seg.style.height = `${target.offsetHeight}px`;
    seg.style.translate = `${target.offsetLeft}px ${target.offsetTop}px`;
    seg.dataset.on = '';
  }, []);

  const currentLink = useCallback(
    () => navRef.current?.querySelector<HTMLElement>('a[aria-current]') ?? null,
    [],
  );

  // First paint: snap to the current link, then let the segment take over the fill.
  useLayoutEffect(() => {
    place(currentLink(), true);
    navRef.current?.setAttribute('data-ready', '');
  }, [place, currentLink]);

  // Client-side navigation: glide to the new section.
  useEffect(() => {
    place(currentLink());
  }, [current, place, currentLink]);

  // Link widths change when the web font arrives and at the breakpoints.
  useEffect(() => {
    const snap = () => place(currentLink(), true);
    window.addEventListener('resize', snap);
    document.fonts?.ready.then(snap);
    return () => window.removeEventListener('resize', snap);
  }, [place, currentLink]);

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="site-nav relative"
      onMouseLeave={() => place(currentLink())}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) place(currentLink());
      }}
    >
      <span ref={segRef} className="nav-seg" aria-hidden="true" />
      <ul role="list" className="flex items-center gap-[2px] rounded-full bg-accent p-1.5 mob:p-1">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.url}
              aria-current={pathname === link.url ? 'page' : current === link.url ? 'true' : undefined}
              className={linkClass}
              onMouseEnter={(e) => place(e.currentTarget)}
              onFocus={(e) => place(e.currentTarget)}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
