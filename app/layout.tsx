import './globals.css';
import type { Metadata } from 'next';
import { Outfit, Source_Serif_4 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Link from 'next/link';
import { WebsiteJsonLd } from './components/JsonLd';

export { viewport } from './viewport';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit'
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-source-serif'
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
    <html lang="en" className={`${outfit.variable} ${sourceSerif.variable}`}>
      <body className="antialiased tracking-tight text-lg font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2 focus:text-ink focus:ring-2 focus:ring-accent"
        >
          Skip to content
        </a>
        <WebsiteJsonLd />
        <div className="min-h-screen flex flex-col justify-between p-8 bg-paper text-ink safe-top safe-bottom">
          <Masthead />
          <main id="main" className="max-w-[75ch] mx-auto w-full space-y-6 mt-4 md:mt-16">
            {children}
          </main>
          <Footer />
          <Analytics />
        </div>
      </body>
    </html>
  );
}

function Masthead() {
  const links = [
    { name: 'posts', url: '/posts' },
    { name: 'bio', url: '/bio' },
    { name: 'speaking', url: '/speaking' }
  ];

  return (
    <header className="max-w-[75ch] mx-auto w-full flex items-center justify-between gap-3 border-b border-hair pb-4">
      <Link
        href="/"
        className="font-serif text-[17px] text-ink no-underline"
        style={{ fontWeight: 620 }}
      >
        Ben Stewart
      </Link>
      <nav className="flex items-center gap-3 sm:gap-5">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            className="font-sans text-[13px] text-muted hover:text-ink transition-colors duration-200 no-underline"
          >
            {link.name}
          </Link>
        ))}
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

  return (
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {links.map((link) => {
          const linkClasses = "font-sans text-[13px] text-faint hover:text-muted no-underline transition-colors duration-200";

          if (link.external) {
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClasses}
              >
                {link.name}
              </a>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.url}
              className={linkClasses}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
