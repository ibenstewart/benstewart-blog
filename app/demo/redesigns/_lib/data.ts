import { promises as fs } from 'fs';
import path from 'path';
import { getAllPosts, type Post } from '@/lib/posts';
import { extractMetadataBlock, stripFencedCodeBlocks } from '@/lib/mdx-parsing.mjs';

/**
 * Shared data for the three redesign concepts. Everything is real: titles,
 * dates and word counts come from the posts on disk; themes and quotes are
 * hand-tagged from each post's own KeyPoint and PullQuote text.
 */

export const THEMES = [
  { id: 'people', name: 'Leading people', colour: '#2F5BD3' },
  { id: 'words', name: 'Saying it well', colour: '#D2462B' },
  { id: 'breaks', name: 'When it breaks', colour: '#E0A419' },
  { id: 'ai', name: 'Working with AI', colour: '#1F8A70' },
  { id: 'self', name: 'Looking after yourself', colour: '#8A4FBF' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

const TAGS: Record<string, ThemeId[]> = {
  'the-invisible-manager': ['people'],
  'shared-documents-are-not-shared-understanding': ['words'],
  'am-i-jealous-of-my-team': ['self', 'people'],
  'so-i-think-i-burned-out': ['self', 'breaks'],
  'practical-postmortems': ['breaks', 'people'],
  'am-i-technically-dangerous': ['self'],
  'end-of-year-manager-checklist': ['self', 'people'],
  'leaders-dont-lie': ['words', 'people'],
  'leadership-as-a-service': ['people'],
  'managing-up-up-down-down-left-right': ['words'],
  'meeting-rooms-are-now-free': ['words', 'self'],
  'reading-list': ['self'],
  'the-basic-boss-formula': ['people'],
  'the-ideal-senior-engineer': ['people', 'self'],
  'waist': ['words'],
  'you-cant-hum-while-holding-your-nose': ['breaks', 'people'],
  'the-truth-about-authentic-leadership': ['people'],
  'a-prompt-to-your-leadership-style': ['ai', 'people'],
  'sustainable': ['ai', 'self'],
  'i-built-this-blog-with-claude-code': ['ai'],
  'ralph-isnt-the-point': ['ai', 'words'],
  'the-three-pound-question': ['ai'],
  'multi-agent-ai-strategy': ['ai'],
  'ai-made-writing-free': ['ai', 'words'],
  'what-level-does-this-task-deserve': ['ai'],
};

/** One line per post, lifted from the post itself (KeyPoint, PullQuote or subtitle). */
export const QUOTES: Record<string, string> = {
  'the-invisible-manager': "Your job as a manager is not to be the best engineer in the room.",
  'shared-documents-are-not-shared-understanding': 'A document describes what someone wants. It rarely captures why they want it.',
  'am-i-jealous-of-my-team': 'I missed the feeling of building. But I was still building, just different things.',
  'so-i-think-i-burned-out': "The solution to burnout isn't working faster. It's doing less.",
  'practical-postmortems': "Psychological safety isn't a nice-to-have in postmortems. It's the prerequisite.",
  'leaders-dont-lie': 'Plans are nothing. Planning is everything.',
  'meeting-rooms-are-now-free': 'Your company now has as many meeting rooms as you have calendar slots.',
  'waist': 'Why Am I Still Talking. Be the last to speak.',
  'you-cant-hum-while-holding-your-nose': 'No organisation has been managed out of a crisis. Every single one was led.',
  'sustainable': 'Speed of iteration beats quality of iteration.',
  'i-built-this-blog-with-claude-code': "The tool doesn't have taste. You do.",
  'multi-agent-ai-strategy': "That's not strategy. That's expensive confirmation bias with better formatting.",
  'ai-made-writing-free': "The cost of writing didn't disappear. It moved from the writer's time to the reader's brain.",
  'what-level-does-this-task-deserve': 'What does it cost if the output is wrong? How can I verify what comes back?',
  'ralph-isnt-the-point': 'What AI coding tools actually teach you.',
  'the-three-pound-question': 'What I learned from an expensive conversation with a chatbot.',
  'the-basic-boss-formula': '25% you are the boss. 50% you are the peer. 25% you work for them.',
  'am-i-technically-dangerous': 'Going deep vs going wide.',
};

export type ConceptPost = Post & {
  words: number;
  themes: ThemeId[];
  quote: string | null;
  /** True for the eleven posts stamped with the Substack import date. */
  importDate: boolean;
  /** The first few prose paragraphs, markdown stripped. */
  lede: string[];
};

async function readBody(slug: string) {
  const file = path.join(process.cwd(), 'app', 'posts', slug, 'page.mdx');
  const content = await fs.readFile(file, 'utf-8');
  let body = content;
  const meta = extractMetadataBlock(content);
  if (meta) body = body.replace(meta, '');
  return stripFencedCodeBlocks(body);
}

function countWords(body: string): number {
  return body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

function extractLede(body: string): string[] {
  const afterSchema = body.split(/<PostSchema[\s\S]*?\/>/)[1] ?? body;
  return afterSchema
    .replace(/<FAQJsonLd[\s\S]*?\/>/g, '')
    .replace(/<\/?Lede>/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => /^[A-Z"'\u2018\u201C]/.test(p) && !p.includes('{') && p.length > 60)
    .slice(0, 3)
    .map((p) =>
      p
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*?([^*]+)\*\*?/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
    );
}

export async function getConceptPosts(): Promise<ConceptPost[]> {
  const posts = await getAllPosts();
  return Promise.all(
    posts.map(async (post) => {
      const body = await readBody(post.slug);
      return {
      ...post,
      words: countWords(body),
      lede: extractLede(body),
      themes: TAGS[post.slug] ?? ['people'],
      quote: QUOTES[post.slug] ?? post.subtitle,
      importDate: post.date === '2023-09-18',
      };
    })
  );
}
