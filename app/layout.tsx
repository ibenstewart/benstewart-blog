import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import Link from 'next/link';
import { WebsiteJsonLd } from './components/JsonLd';

export { viewport } from './viewport';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.benstewart.ai'),
  alternates: {
    canonical: '/'
  },
  title: {
    default: 'Ben Stewart',
    template: '%s | Ben Stewart'
  },
  description: 'Engineer turned leader. Currently at Skyscanner. Writing about software and leadership since 2006.',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Ben Stewart',
    images: [{
      url: '/images/og-default.png',
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ibenstewart',
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.className}`}>
      <body className="antialiased tracking-tight text-lg">
        <WebsiteJsonLd />
        <div className="min-h-screen flex flex-col justify-between p-8 bg-white dark:bg-black text-gray-900 dark:text-gray-100 safe-top safe-bottom">
          <main className="max-w-[75ch] mx-auto w-full space-y-6 mt-4 md:mt-16">
            {children}
          </main>
          <Footer />
          <Analytics />
        </div>
      </body>
    </html>
  );
}

function Footer() {
  const links = [
    { name: 'posts', url: '/posts', external: false },
    { name: 'linkedin', url: 'https://www.linkedin.com/in/ben-stewart-90944595/', external: true },
    { name: 'contact', url: 'mailto:ben@benstewart.ai', external: true }
  ];

  return (
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {links.map((link) => {
          const linkClasses = "text-gray-500 hover:text-gray-400 dark:text-gray-500 dark:hover:text-gray-600 transition-colors duration-200";

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
