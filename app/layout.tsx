import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { PersonJsonLd, WebsiteJsonLd } from './components/JsonLd';
import { SiteFooter } from './components/chrome/SiteFooter';
import { TopBar } from './components/chrome/TopBar';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site';

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
  variable: '--font-plex-mono',
  preload: false
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.benstewart.ai'),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  title: {
    default: SITE_TITLE,
    template: '%s | Ben Stewart'
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'Ben Stewart',
    url: '/',
    description: SITE_DESCRIPTION,
    images: [{
      url: '/images/og-default.png',
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@benstewart__',
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${schibsted.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body className="antialiased font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-[var(--gutter)] focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-medium focus:text-white focus:no-underline"
        >
          Skip to content
        </a>
        <WebsiteJsonLd />
        <PersonJsonLd />
        <div className="flex min-h-screen flex-col bg-paper text-ink">
          <TopBar />
          <main id="main" className="page-grid flex-1 content-start">
            {children}
          </main>
          <SiteFooter />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
