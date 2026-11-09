import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { SceneFooter } from './SceneFooter';

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: 'all entries', href: '/posts' },
  { label: 'speaking', href: '/speaking' },
  { label: 'rss', href: '/feed.xml' },
  { label: 'github', href: 'https://github.com/ibenstewart', external: true },
  { label: 'x', href: 'https://x.com/benstewart__', external: true },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/ben-stewart-90944595/', external: true },
  { label: 'contact', href: 'mailto:ben@benstewart.ai', external: true },
];

const pill =
  'inline-flex h-11 items-center rounded-xl border-2 border-white/55 px-4 text-base font-bold text-white no-underline transition-colors hover:bg-white hover:text-accent';

/**
 * The footer: the wordmark and links in the sky of the mesas, an
 * illustration by @uixhassan, credited under the wordmark.
 */
export async function SiteFooter() {
  const filed = (await getAllPosts()).length;
  return (
    <SceneFooter src="/images/footer/mesas.jpg" sky="#003593" focus="22% 100%" className="site-chrome surface-dark border-t-2 border-ink">
      <div className="px-[var(--gutter)] pt-16 text-white">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <Link href="/" className="text-[clamp(2rem,4vw,3.5rem)] leading-none font-bold tracking-[-0.04em] text-white no-underline">
              Ben Stewart
            </Link>
            <span className="ml-2.5 inline-block -translate-y-1.5 rounded bg-hi px-2 py-1 align-middle font-mono text-[0.8125rem] tracking-[0.08em] text-ink uppercase">
              Field manual
            </span>
            <p className="mt-4 font-mono text-[0.8125rem] tracking-[0.1em] text-white/85 uppercase">
              Glasgow · {filed} entries filed
            </p>
            <p className="mt-2 font-mono text-[0.8125rem] tracking-[0.1em] text-white/85 uppercase">
              Illustration by{' '}
              <a href="https://x.com/uixhassan" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-2 underline-offset-[0.22em]">
                @uixhassan
              </a>
            </p>
          </div>
          <nav aria-label="Footer">
            <ul role="list" className="flex flex-wrap gap-2">
              {LINKS.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={pill}>{l.label}</a>
                  ) : (
                    <Link href={l.href} className={pill}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </SceneFooter>
  );
}
