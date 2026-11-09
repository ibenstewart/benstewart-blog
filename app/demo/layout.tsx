import type { Metadata } from 'next';

/** Old design experiments: reachable by link, kept out of search. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
