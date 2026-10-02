import { promises as fs } from 'fs';
import path from 'path';
import {
  extractMetadataBlock,
  matchQuoted,
  matchQuotedProp,
  stripFencedCodeBlocks,
} from './mdx-parsing.mjs';

export type Post = {
  slug: string;
  /** Display title taken from the post's `<PostHeader title="...">` prop, falling back to its legacy `# ` heading. */
  title: string;
  /** SEO title from the metadata export (often longer than the display title). */
  metaTitle: string;
  subtitle: string | null;
  description: string | null;
  date: string | null;
  /** Estimated reading time in minutes, floored at 1. */
  readingMinutes: number;
};

/** Formats an ISO `YYYY-MM-DD` date as a UK-style date, e.g. "9 January 2025". */
export function formatUkDate(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Estimates reading time from the post body: strips the metadata export
 * block, JSX tags, and fenced code blocks, then counts words at 230 wpm,
 * rounding to the nearest minute with a floor of 1.
 */
function computeReadingMinutes(content: string): number {
  let body = content;
  const metaBlock = extractMetadataBlock(content);
  if (metaBlock) body = body.replace(metaBlock, '');

  body = stripFencedCodeBlocks(body).replace(/<[^>]+>/g, ' ');

  const words = body.split(/\s+/).filter(Boolean);
  return Math.max(1, Math.round(words.length / 230));
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
      const postHeaderTitle = matchQuotedProp(content, 'PostHeader', 'title');
      const headingMatch = content.match(/^#\s+(.+?)\s*$/m);
      const title = postHeaderTitle ?? (headingMatch ? headingMatch[1] : metaTitle);
      if (!title) return null;

      return {
        slug,
        title,
        metaTitle: metaTitle ?? title,
        subtitle: matchQuoted(content, 'subtitle'),
        description: matchQuoted(content, 'description'),
        date: content.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/)?.[1] ?? null,
        readingMinutes: computeReadingMinutes(content),
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

/**
 * The posts named by `slugs`, in that order. Unknown slugs are skipped.
 */
export function pickPosts(posts: Post[], slugs: string[]): Post[] {
  return slugs.flatMap((slug) => {
    const post = posts.find((p) => p.slug === slug);
    return post ? [post] : [];
  });
}

/** Group label for posts with no date. */
export const UNDATED = 'Undated';

/**
 * Groups posts by publication year for the homepage archive (plan KTD6).
 * Years run newest first; posts keep their input order within a year; posts
 * with no date go in a final "Undated" group.
 */
export function groupPostsByYear(posts: Post[]): { year: string; posts: Post[] }[] {
  const byYear = new Map<string, Post[]>();
  const undated: Post[] = [];

  for (const post of posts) {
    const year = post.date?.slice(0, 4);
    if (!year) {
      undated.push(post);
      continue;
    }
    const group = byYear.get(year);
    if (group) group.push(post);
    else byYear.set(year, [post]);
  }

  const groups = [...byYear.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, yearPosts]) => ({ year, posts: yearPosts }));

  return undated.length ? [...groups, { year: UNDATED, posts: undated }] : groups;
}
