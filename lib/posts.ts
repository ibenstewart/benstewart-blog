import { promises as fs } from 'fs';
import path from 'path';

export type Post = {
  slug: string;
  /** Display title taken from the post's first `# ` heading. */
  title: string;
  /** SEO title from the metadata export (often longer than the display title). */
  metaTitle: string;
  subtitle: string | null;
  description: string | null;
  date: string | null;
};

function unescapeQuotes(value: string): string {
  return value.replace(/\\(['"])/g, '$1');
}

function matchQuoted(content: string, key: string): string | null {
  const double = content.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (double) return unescapeQuotes(double[1]);
  const single = content.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (single) return unescapeQuotes(single[1]);
  return null;
}

/**
 * Reads every post's page.mdx and returns the parsed frontmatter-style
 * metadata, sorted newest first (ties broken by title). This is the single
 * source of truth for the posts listing, the RSS feed, and post navigation.
 */
export async function getAllPosts(
  dir: string = path.join(process.cwd(), 'app', 'posts')
): Promise<Post[]> {
  const entries = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true,
  });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name === 'page.mdx')
    .filter((entry) => path.resolve(entry.parentPath) !== path.resolve(dir))
    .map((entry) => ({
      slug: path.basename(entry.parentPath),
      filePath: path.join(entry.parentPath, entry.name),
    }));

  const posts = await Promise.all(
    files.map(async ({ slug, filePath }) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const metaTitle = matchQuoted(content, 'title');
      const headingMatch = content.match(/^#\s+(.+?)\s*$/m);
      const title = headingMatch ? headingMatch[1] : metaTitle;
      if (!title) return null;

      return {
        slug,
        title,
        metaTitle: metaTitle ?? title,
        subtitle: matchQuoted(content, 'subtitle'),
        description: matchQuoted(content, 'description'),
        date: content.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1] ?? null,
      };
    })
  );

  return posts
    .filter((post): post is Post => post !== null)
    .sort(
      (a, b) =>
        (b.date ?? '').localeCompare(a.date ?? '') ||
        a.title.localeCompare(b.title)
    );
}
