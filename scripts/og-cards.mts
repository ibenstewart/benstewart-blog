/**
 * Renders the 1200x630 share card for every post (drafts too) from
 * docs/og-card/template.html, plus the site card (public/images/og-default.png).
 *
 *   npm run og-cards                 every card
 *   npm run og-cards -- <slug> ...   just these posts
 *
 * Each card shows the entry number, the chapter, the display title and the
 * post's pull line (`quote`, or the subtitle), all from lib/posts.ts and
 * lib/manual.ts, so a card always matches the entry page. Output goes to
 * public/images/posts/<slug>-og.png; a post's metadata should point
 * openGraph.images and the <PostSchema> image prop at that file
 * (`npm run validate-posts` checks it exists).
 *
 * Needs Playwright's Chromium (`npx playwright install chromium` once) and
 * network access for Google Fonts.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { getAllPosts } from '../lib/posts.ts';
import { chapters } from '../lib/manual.ts';

const root = process.cwd();
const template = pathToFileURL(path.join(root, 'docs/og-card/template.html')).href;
const only = process.argv.slice(2);

const posts = await getAllPosts(undefined, { includeDrafts: true });
const cards: { out: string; query: Record<string, string> }[] = [];
for (const chapter of chapters(posts)) {
  for (const { post, number } of chapter.entries) {
    if (only.length && !only.includes(post.slug)) continue;
    cards.push({
      out: `public/images/posts/${post.slug}-og.png`,
      query: {
        t: post.title,
        n: number,
        c: `Chapter ${chapter.number} · ${chapter.theme.name}`,
        col: chapter.theme.colour,
        q: post.quote ?? post.subtitle ?? '',
      },
    });
  }
}
if (!only.length) cards.push({ out: 'public/images/og-default.png', query: {} });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const card of cards) {
  await page.goto(`${template}?${new URLSearchParams(card.query)}`);
  await page.waitForSelector('body[data-ready]');
  await page.screenshot({ path: path.join(root, card.out) });
  console.log('wrote', card.out);
}
await browser.close();
