import Link from 'next/link';
import { TopNav, type NavLink } from './TopNav';

export const NAV_LINKS: NavLink[] = [
  { label: 'situations', href: '/#situations', wide: true },
  { label: 'toolkit', href: '/#toolkit', wide: true },
  { label: 'chapters', href: '/#chapters' },
  { label: 'all entries', href: '/posts' },
  { label: 'speaking', href: '/speaking' },
  { label: 'bio', href: '/bio' },
];

/** The Field manual top bar: the wordmark with its badge, and the main nav. */
export function TopBar() {
  return (
    <header className="site-chrome flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-2 border-ink bg-paper px-[var(--gutter)] pt-[calc(14px+env(safe-area-inset-top))] pb-3.5">
      <Link href="/" className="inline-flex items-center gap-2.5 text-[1.25rem] leading-none font-bold tracking-[-0.03em] text-ink no-underline">
        Ben Stewart
        <span className="rounded bg-ink px-2 py-1 font-mono text-[0.75rem] font-normal tracking-[0.08em] text-paper uppercase">Field manual</span>
      </Link>
      <TopNav links={NAV_LINKS} />
    </header>
  );
}
