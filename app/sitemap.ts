import { promises as fs } from 'fs';
import path from 'path';

const SITE_URL = 'https://www.benstewart.ai';

async function getPostSlugs(dir: string) {
  const entries = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name === 'page.mdx')
    .map((entry) => {
      const relativePath = path.relative(
        dir,
        path.join(entry.parentPath, entry.name)
      );
      return path.dirname(relativePath);
    })
    .map((slug) => slug.replace(/\\/g, '/'));
}

export default async function sitemap() {
  const postsDirectory = path.join(process.cwd(), 'app', 'posts');
  const slugs = await getPostSlugs(postsDirectory);

  const posts = slugs
    .filter((slug) => slug !== '.')
    .map((slug) => ({
      url: `${SITE_URL}/posts/${slug}`,
      lastModified: new Date().toISOString()
    }));

  const routes = ['', '/posts', '/bio', '/speaking'].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date().toISOString()
  }));

  return [...routes, ...posts];
}
