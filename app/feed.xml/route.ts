import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';

const SITE_URL = 'https://www.benstewart.ai';
const SITE_DESCRIPTION = 'Engineer turned leader. Currently at Skyscanner. Writing about software and leadership since 2006.';
const MAX_ITEMS = 50;

export async function GET() {
  const posts = (await getAllPosts()).filter(
    (post) => post.date !== null && post.description !== null
  );

  const author = {
    name: 'Ben Stewart',
    email: 'ben@benstewart.ai',
    link: `${SITE_URL}/bio`,
  };

  const feed = new Feed({
    title: 'Ben Stewart',
    description: SITE_DESCRIPTION,
    id: SITE_URL,
    link: SITE_URL,
    language: 'en',
    image: `${SITE_URL}/images/og-default.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} Ben Stewart`,
    feedLinks: { rss2: `${SITE_URL}/feed.xml` },
    author,
  });

  for (const post of posts.slice(0, MAX_ITEMS)) {
    const url = `${SITE_URL}/posts/${post.slug}`;
    feed.addItem({
      title: post.metaTitle,
      id: url,
      link: url,
      description: post.description!,
      content: post.description!,
      author: [author],
      date: new Date(post.date!),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
