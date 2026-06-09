import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

const postsDescription = 'All posts by Ben Stewart on engineering leadership, AI-native engineering, and running large teams.';

export const metadata: Metadata = {
  title: 'Posts',
  description: postsDescription,
  alternates: { canonical: 'https://www.benstewart.ai/posts' },
  openGraph: {
    title: 'Posts | Ben Stewart',
    description: postsDescription,
    url: 'https://www.benstewart.ai/posts',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
};

function formatDate(date: string | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-medium mb-8">Writing</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.slug}>
            <div className="flex items-baseline justify-between gap-4">
              <Link
                href={`/posts/${post.slug}`}
                className="text-lg underline decoration-neutral-500 underline-offset-[2.5px] hover:decoration-neutral-400 dark:decoration-neutral-500 dark:hover:decoration-neutral-600 transition-colors"
              >
                {post.title}
              </Link>
              {post.date && (
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(post.date)}
                </span>
              )}
            </div>
            {post.subtitle && (
              <p className="mt-0.5 text-base text-gray-600 dark:text-gray-400">
                {post.subtitle}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
