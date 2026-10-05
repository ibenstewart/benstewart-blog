import type { Metadata } from 'next';
import Link from 'next/link';
import { PostList } from './components/PostList';

export const metadata: Metadata = {
  title: 'Not found'
};

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-sans text-3xl font-bold tracking-[-0.025em] text-ink">Nothing here.</h1>
      <p className="mt-3 text-muted">
        {"That page doesn't exist. Try one of these instead."}
      </p>
      <div className="mx-auto mt-8 max-w-[40rem] text-left">
        <PostList slugs={["what-level-does-this-task-deserve", "the-three-pound-question", "sustainable"]} />
      </div>
      <p className="mt-6">
        <Link href="/posts" className="text-ink underline decoration-accent underline-offset-4">
          All posts
        </Link>
        <span className="text-faint"> · </span>
        <Link href="/" className="text-ink underline decoration-accent underline-offset-4">
          Home
        </Link>
      </p>
    </div>
  );
}
