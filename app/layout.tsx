import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Link from 'next/link';
import { WebsiteJsonLd } from './components/JsonLd';

export { viewport } from './viewport';

const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-schibsted'
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: '400',
  style: ['italic'],
  variable: '--font-source-serif'
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-plex-mono'
});

const siteDescription = 'Engineer turned leader. Currently at Skyscanner. Writing about software and leadership since 2006.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.benstewart.ai'),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  title: {
    default: 'Ben Stewart',
    template: '%s | Ben Stewart'
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    siteName: 'Ben Stewart',
    url: '/',
    description: siteDescription,
    images: [{
      url: '/images/og-default.png',
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@benstewart__',
    images: ['/images/og-default.png'],
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${schibsted.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body className="antialiased font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-[var(--gutter)] focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-medium focus:text-white focus:no-underline"
        >
          Skip to content
        </a>
        <WebsiteJsonLd />
        <div className="flex min-h-screen flex-col bg-paper text-ink">
          <Masthead />
          <main id="main" className="page-grid flex-1 content-start">
            {children}
          </main>
          <Footer />
          <Analytics />
        </div>
      </body>
    </html>
  );
}

const wordmarkClass =
  'whitespace-nowrap text-[1.375rem] leading-none font-bold tracking-[-0.03em] text-ink no-underline mob:text-[1.1875rem] tight:text-[1.125rem]';

function Masthead() {
  const links = [
    { name: 'posts', url: '/posts' },
    { name: 'bio', url: '/bio' },
    { name: 'speaking', url: '/speaking' }
  ];

  return (
    <header className="site-container flex items-center justify-between gap-6 pt-[calc(32px+env(safe-area-inset-top))] mob:gap-3 mob:pt-[calc(20px+env(safe-area-inset-top))]">
      <Link href="/" className={wordmarkClass}>
        Ben Stewart
      </Link>
      <nav aria-label="Primary">
        <ul role="list" className="flex items-center gap-[2px] rounded-full bg-accent p-1.5 mob:p-1">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                href={link.url}
                className="inline-flex h-11 items-center rounded-full px-5 text-[1.0625rem] font-medium tracking-[-0.005em] text-white no-underline transition-colors hover:bg-accent-deep hover:underline hover:decoration-[length:1.5px] hover:underline-offset-[5px] focus-visible:outline-2 focus-visible:-outline-offset-6 focus-visible:outline-white mob:h-[38px] mob:px-3 mob:text-base tight:px-2.5 tight:text-[0.9375rem]"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function Footer() {
  const links = [
    { name: 'posts', url: '/posts', external: false },
    { name: 'rss', url: '/feed.xml', external: false },
    { name: 'github', url: 'https://github.com/ibenstewart', external: true },
    { name: 'x', url: 'https://x.com/benstewart__', external: true },
    { name: 'linkedin', url: 'https://www.linkedin.com/in/ben-stewart-90944595/', external: true },
    { name: 'contact', url: 'mailto:ben@benstewart.ai', external: true }
  ];

  const pillClass =
    'inline-flex h-11 items-center rounded-full border border-hair px-5 text-base font-medium text-ink no-underline transition-colors hover:border-accent hover:text-accent mob:h-10 mob:px-4 mob:text-[0.9375rem]';

  return (
    <footer className="site-container mt-[var(--section)] pb-[calc(64px+env(safe-area-inset-bottom))]">
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-hair pt-10 mob:block">
        <div>
          <Link href="/" className={`block ${wordmarkClass}`}>
            Ben Stewart
          </Link>
          <p className="mt-2.5 text-[0.9375rem] font-medium tracking-[0.005em] text-red">Glasgow</p>
        </div>
        <nav aria-label="Footer">
          <ul role="list" className="flex flex-wrap gap-2.5 mob:mt-7">
            {links.map((link) => (
              <li key={link.name}>
                {link.external ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className={pillClass}>
                    {link.name}
                  </a>
                ) : (
                  <Link href={link.url} className={pillClass}>
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
