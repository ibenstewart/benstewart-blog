import { promises as fs } from 'fs';
import path from 'path';

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

function unescapeQuotes(value: string): string {
  return value.replace(/\\(['"])/g, '$1');
}

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

function matchQuoted(content: string, key: string): string | null {
  const double = content.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (double) return unescapeQuotes(double[1]);
  const single = content.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
  if (single) return unescapeQuotes(single[1]);
  return null;
}

/** Extracts a `prop="value"` attribute (double-quoted, with escaped-quote support) from a JSX tag. */
function matchQuotedProp(content: string, tag: string, prop: string): string | null {
  const tagMatch = content.match(new RegExp(`<${tag}[^>]*>`));
  if (!tagMatch) return null;
  const propMatch = tagMatch[0].match(new RegExp(`\\b${prop}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return propMatch ? unescapeQuotes(propMatch[1]) : null;
}

/**
 * Extracts the `export const metadata = {...}` block using brace-depth
 * counting, mirroring scripts/validate-posts.mjs, so the reading-time word
 * count doesn't include metadata text.
 */
function extractMetadataBlock(content: string): string | null {
  const start = content.indexOf('export const metadata');
  if (start === -1) return null;

  const braceStart = content.indexOf('{', start);
  if (braceStart === -1) return null;

  let depth = 0;
  for (let i = braceStart; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    if (depth === 0) return content.slice(start, i + 2); // include trailing `;`
  }
  return null;
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

  body = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ');

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
