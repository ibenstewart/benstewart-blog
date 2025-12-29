import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

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
  description: 'Engineer turned leader. Currently at Skyscanner. Writing about software and leadership since 2006.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.className}`}>
      <body className="antialiased tracking-tight text-lg">
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
    { name: 'linkedin', url: 'https://www.linkedin.com/in/ben-stewart-90944595/' }
  ];

  return (
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-400 dark:text-gray-500 dark:hover:text-gray-600 transition-colors duration-200"
          >
            {link.name}
          </a>
        ))}
      </div>
    </footer>
  );
}
