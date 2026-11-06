import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Redesign concepts',
  robots: { index: false, follow: false },
};

/**
 * Concept pages wrap themselves in `.rd-root`, which hides the Glasgow Civic
 * masthead and footer and lets the page take the whole viewport, so each
 * concept can be judged as a complete site rather than a page inside this one.
 */
export default function RedesignsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        body:has(.rd-root) header.site-container,
        body:has(.rd-root) footer.site-container { display: none; }
        main:has(> .rd-root) { display: block; padding: 0; }
        main > .rd-root { margin: 0; }
      `}</style>
      {children}
    </>
  );
}
