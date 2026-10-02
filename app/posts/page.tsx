import type { Metadata } from 'next';
import { PostList } from '@/app/components/PostList';

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

export default async function PostsPage() {
  return (
    <div>
      <h1 className="font-sans text-3xl font-bold tracking-[-0.025em] text-ink mob:text-2xl mb-8">Writing</h1>
      <PostList />
    </div>
  );
}
