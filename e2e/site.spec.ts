import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { extractMetadataBlock } from '../lib/mdx-parsing.mjs';

/**
 * Every page loads with no console errors, no sideways scroll and no broken
 * images of our own, at desktop and phone widths. A smaller set also gets an
 * axe-core scan that fails on any serious or critical issue.
 */

/** Published post slugs, read synchronously (Playwright collects tests synchronously). */
function publishedSlugs() {
  const dir = path.join(process.cwd(), 'app', 'posts');
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(dir, d.name, 'page.mdx')))
    .map((d) => d.name)
    .filter((slug) => !/\bdraft:\s*true\b/.test(extractMetadataBlock(readFileSync(path.join(dir, slug, 'page.mdx'), 'utf-8')) ?? ''))
    .sort();
}

const PAGES = ['/', '/posts', '/bio', '/speaking', '/copy-review'];
const AXE_ENTRIES = [
  'sustainable',
  'waist',
  'what-level-does-this-task-deserve',
  'i-built-this-blog-with-claude-code',
  'practical-postmortems',
];

// Third parties the site doesn't control (and that a sandbox may block).
const NOISE = /vercel-scripts|_vercel\/insights|twimg|twitter|syndication|youtube|ytimg|googlevideo|doubleclick|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_BLOCKED/i;

/** `missing` is a path that's meant to 404, so its own 404 isn't an error. */
function watchErrors(page: Page, missing?: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const where = m.location().url ?? '';
    if (NOISE.test(m.text()) || NOISE.test(where)) return;
    if (missing && where.endsWith(missing) && /status of 404/.test(m.text())) return;
    errors.push(`console: ${m.text()}`);
  });
  page.on('requestfailed', (r) => {
    if (!NOISE.test(r.url()) && new URL(r.url()).origin === new URL(page.url() || r.url()).origin) {
      errors.push(`request failed: ${r.url()}`);
    }
  });
  return errors;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
}

async function checkPage(page: Page, path: string, status = 200) {
  const errors = watchErrors(page, status === 404 ? path : undefined);
  const res = await page.goto(path, { waitUntil: 'load' });
  expect(res?.status(), `${path} status`).toBe(status);
  await scrollThrough(page);
  await page.waitForLoadState('networkidle').catch(() => {});

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `${path} scrolls sideways by ${overflow}px`).toBeLessThanOrEqual(0);

  const broken = await page.evaluate(() =>
    [...document.images]
      .filter((img) => new URL(img.currentSrc || img.src, location.href).origin === location.origin)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('src'))
  );
  expect(broken, `${path} broken images`).toEqual([]);

  await expect(page.locator('h1'), `${path} has one h1`).toHaveCount(1);
  expect(errors, `${path} errors`).toEqual([]);
}

async function axe(page: Page, path: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    // The YouTube player's own markup isn't ours to fix.
    .exclude('iframe[src*="youtube"]')
    .analyze();
  const bad = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
  expect(bad, `${path} accessibility`).toEqual([]);
}

test.describe('pages', () => {
  for (const path of PAGES) {
    test(`${path} loads cleanly`, async ({ page }) => {
      await checkPage(page, path);
    });
  }

  test('a missing page is a 404 with the manual around it', async ({ page }) => {
    await checkPage(page, '/no-such-entry', 404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("This page isn't in the manual.");
  });
});

test.describe('entries', () => {
  for (const slug of publishedSlugs()) {
    test(`/posts/${slug} loads cleanly`, async ({ page }) => {
      await checkPage(page, `/posts/${slug}`);
      await expect(page.locator('.post-head')).toBeVisible();
      await expect(page.locator('.entry-end')).toBeVisible();
    });
  }
});

test.describe('accessibility', () => {
  for (const path of [...PAGES, '/no-such-entry', ...AXE_ENTRIES.map((s) => `/posts/${s}`)]) {
    test(`${path} has no serious axe issues`, async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      await axe(page, path);
    });
  }
});

test.describe('behaviour', () => {
  test('picking a situation swaps the reading order and announces it', async ({ page }) => {
    await page.goto('/');
    const fire = page.getByRole('button', { name: "Something's on fire" });
    await fire.click();
    await expect(fire).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#reading-order h2')).toContainText("Something's on fire");
    await expect(page.locator('#reading-order [aria-live="polite"]')).toContainText('Reading order for');
  });

  test('a situation link preselects that reading order', async ({ page }) => {
    await page.goto('/?situation=talk#situations');
    await expect(page.locator('#reading-order h2')).toContainText('I talk too much in meetings');
  });

  test('ticking an entry survives a reload and shows on the date list', async ({ page }) => {
    await page.goto('/#chapters');
    const tick = page.getByRole('button', { name: /^Read: / }).first();
    const name = (await tick.getAttribute('aria-label'))!.replace(/^Read: /, '');
    await tick.click();
    await expect(tick).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: `Read: ${name}` })).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/posts');
    await expect(page.getByText("you've read 1")).toBeVisible();
  });

  test('pages still work when storage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    });
    const errors = watchErrors(page);
    await page.goto('/');
    await page.getByRole('button', { name: /^Read: / }).first().click();
    await page.goto('/posts/sustainable');
    await page.getByRole('button', { name: 'Mark as read' }).first().click();
    expect(errors).toEqual([]);
  });

  test('nothing scrolls sideways at 320px', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop project only');
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ['/', '/posts', '/bio', '/speaking', '/posts/what-level-does-this-task-deserve']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at 320px`).toBeLessThanOrEqual(0);
    }
  });
});
