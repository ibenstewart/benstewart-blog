import { promises as fs } from 'fs';
import path from 'path';
import { Feed } from 'feed';

const SITE_URL = 'https://www.benstewart.ai';
const SITE_DESCRIPTION = 'Engineer turned leader. Currently at Skyscanner. Writing about software and leadership since 2006.';
const MAX_ITEMS = 50;

type PostFrontmatter = {
  slug: string;
  title: string;
  description: string;
  date: string;
};

async function readPosts(): Promise<PostFrontmatter[]> {
  const postsDirectory = path.join(process.cwd(), 'app', 'posts');
  const entries = await fs.readdir(postsDirectory, {
    recursive: true,
    withFileTypes: true,
  });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name === 'page.mdx')
    .map((entry) => ({
      slug: path.basename(entry.parentPath),
      filePath: path.join(entry.parentPath, entry.name),
    }));

  const posts = await Promise.all(
    files.map(async ({ slug, filePath }) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const titleMatch =
        content.match(/title:\s*"((?:[^"\\]|\\.)*)"/) ||
        content.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
      const descriptionMatch =
        content.match(/description:\s*"((?:[^"\\]|\\.)*)"/) ||
        content.match(/description:\s*'((?:[^'\\]|\\.)*)'/);
      const dateMatch = content.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/);

      if (!titleMatch || !descriptionMatch || !dateMatch) return null;

      return {
        slug,
        title: titleMatch[1],
        description: descriptionMatch[1],
        date: dateMatch[1],
      };
    })
  );

  return posts.filter((p): p is PostFrontmatter => p !== null);
}

export async function GET() {
  const posts = await readPosts();
  posts.sort((a, b) => b.date.localeCompare(a.date));

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
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      content: post.description,
      author: [author],
      date: new Date(post.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
