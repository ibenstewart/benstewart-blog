import { promises as fs } from 'fs';
import path from 'path';

const SITE_URL = 'https://www.benstewart.ai';

type PostInfo = {
  slug: string;
  date: string | null;
};

async function getPostsWithDates(dir: string): Promise<PostInfo[]> {
  const entries = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true
  });

  const posts = entries
    .filter((entry) => entry.isFile() && entry.name === 'page.mdx')
    .map((entry) => {
      const relativePath = path.relative(
        dir,
        path.join(entry.parentPath, entry.name)
      );
      return {
        slug: path.dirname(relativePath).replace(/\\/g, '/'),
        filePath: path.join(entry.parentPath, entry.name)
      };
    })
    .filter((post) => post.slug !== '.');

  const postsWithDates: PostInfo[] = await Promise.all(
    posts.map(async (post) => {
      try {
        const content = await fs.readFile(post.filePath, 'utf-8');
        const dateMatch = content.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/);
        return {
          slug: post.slug,
          date: dateMatch ? dateMatch[1] : null
        };
      } catch {
        return { slug: post.slug, date: null };
      }
    })
  );

  return postsWithDates;
}

export default async function sitemap() {
  const postsDirectory = path.join(process.cwd(), 'app', 'posts');
  const postsWithDates = await getPostsWithDates(postsDirectory);

  const posts = postsWithDates.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.date ? new Date(post.date).toISOString() : new Date().toISOString()
  }));

  const routes = ['', '/posts', '/bio', '/speaking'].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString()
  }));

  return [...routes, ...posts];
}
