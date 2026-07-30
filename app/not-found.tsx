import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Not found'
};

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-serif text-3xl text-ink">Nothing here.</h1>
      <p className="mt-3 text-muted">
        The page you are looking for does not exist, or has moved.
      </p>
      <p className="mt-6">
        <Link href="/" className="text-ink underline decoration-accent underline-offset-4">
          Back home
        </Link>
      </p>
    </div>
  );
}
