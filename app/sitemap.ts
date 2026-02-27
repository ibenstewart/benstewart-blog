import { promises as fs } from 'fs';
import path from 'path';

const SITE_URL = 'https://www.benstewart.ai';

type PostInfo = {
  slug: string;
  date: string | null;
  lastModified: string | null;
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
        const lastModifiedMatch = content.match(/lastModified:\s*["'](\d{4}-\d{2}-\d{2})["']/);
        return {
          slug: post.slug,
          date: dateMatch ? dateMatch[1] : null,
          lastModified: lastModifiedMatch ? lastModifiedMatch[1] : null
        };
      } catch {
        return { slug: post.slug, date: null, lastModified: null };
      }
    })
  );

  return postsWithDates;
}

export default async function sitemap() {
  const postsDirectory = path.join(process.cwd(), 'app', 'posts');
  const postsWithDates = await getPostsWithDates(postsDirectory);

  const posts = postsWithDates.map((post) => {
    const freshness = post.lastModified ?? post.date;
    return {
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: freshness ? new Date(freshness).toISOString() : new Date().toISOString()
    };
  });

  const routes = ['', '/posts', '/bio', '/speaking'].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString()
  }));

  return [...routes, ...posts];
}
