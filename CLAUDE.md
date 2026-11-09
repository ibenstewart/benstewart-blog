# Ben Stewart's Blog

## Project Overview
Personal blog for Ben Stewart - engineer turned leader at Skyscanner. Writing about software engineering and leadership.

**Site URL:** https://www.benstewart.ai

## Tech Stack
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Content:** MDX files in `app/posts/[slug]/page.mdx`
- **Fonts:** Schibsted Grotesk (everything you read), IBM Plex Mono (labels, entry numbers, badges, code), both via next/font Google Fonts
- **Design system:** Field manual, spec in `docs/design/field-manual/DESIGN.md` (Glasgow Civic is superseded)
- **Deployment:** Vercel (auto-deploys from GitHub)
- **Repo:** https://github.com/ibenstewart/benstewart-blog

## Quick Commands
```bash
npm run dev              # Start dev server (uses Turbopack)
npm run build            # Build for production (uses webpack)
npm run validate-posts   # Check all posts have required SEO metadata, themes and quotes
npm test                 # Unit and component tests (Vitest)
npm run test:e2e         # After a build: every page at desktop and phone widths, plus axe-core (Playwright, e2e/)
npm run og-cards         # Render every share card (add -- <slug> for one)
```

## Blog Post Structure
Posts live in `app/posts/[slug]/page.mdx` with this format:

```mdx
export const metadata = {
  title: "Post Title",
  date: "YYYY-MM-DD",
  themes: ["ai", "people"],
  quote: "One pull line from the post, used on cards and the share card.",
  subtitle: "Optional subtitle",
  description: "A concise description for SEO and social sharing.",
  alternates: {
    canonical: 'https://www.benstewart.ai/posts/[slug]'
  },
  openGraph: {
    type: "article",
    siteName: "Ben Stewart",
    publishedTime: "YYYY-MM-DD",
    authors: ["https://www.benstewart.ai/bio"],
    title: "Post Title",
    description: "A concise description for SEO and social sharing.",
    url: "https://www.benstewart.ai/posts/[slug]",
    images: [{ url: "/images/posts/[slug]-og.png", width: 1200, height: 630 }],
  }
};

<PostHeader title="Post Title" slug="[slug]" />

<PostSchema
  title="Post Title"
  description="A concise description for SEO and social sharing."
  date="YYYY-MM-DD"
  slug="[slug]"
  image="https://www.benstewart.ai/images/posts/[slug]-og.png"
/>

Content goes here...

<PostNav slug="[slug]" related={["other-slug", "another-slug"]} />
```

**Note:** Every post ends with `<PostNav slug="[slug]" />`. It renders the end of the entry automatically: Mark as read, the entry's tool (if it has one), the next step (the reading order the reader came from, otherwise the next entry in its chapter), newer and older by date, and the author note. The `related` prop is optional; pass 2-3 slugs of hand-picked related posts and they show as Keep reading cards.

**Note:** `themes` is one to five of `people` (Leading people), `words` (Saying it well), `breaks` (When it breaks), `ai` (Working with AI) and `self` (Looking after yourself). The **first** theme is the post's chapter and decides its entry number. `quote` is a line lifted from the post itself.

**Note:** A post's `openGraph` replaces the root layout's rather than merging with it, so each post carries `type: "article"`, `siteName` and `publishedTime` (the same date as `date`) itself; the validator checks for them. Top-level pages use `pageMetadata()` from `lib/site.ts` for the same reason.

**Note:** The share image is the post's Field manual card, `/images/posts/[slug]-og.png`, made by `npm run og-cards -- [slug]`. Use the relative path in `openGraph.images` and the **absolute** URL in the `<PostSchema>` `image` prop (JSON-LD requires it).

**Important:** The `title`, `description`, and `date` in `<PostSchema>` must match the values in the `metadata` export. The validation script checks for drift between them.

## Custom MDX Components
Available components in `mdx-components.tsx`:

| Component | Usage | Description |
|-----------|-------|-------------|
| `<KeyPoint>` | `<KeyPoint>Important text</KeyPoint>` | Yellow panel labelled Key point, big bold ink text |
| `<Callout>` | `<Callout type="insight\|warning\|tip\|story" label="Optional">` | White panel with a 2px ink border (20px radius) and a mono label (Insight/Worth knowing/Try this/Story, or `label` to override); blue for insight, red for warning, green for tip, grey for story |
| `<Quadrant>` | `<Quadrant x={["Easy", "Hard"]} y={["Expensive", "Cheap"]} cells={[...4]} />` | 2x2 grid with axis labels; each cell has `level`, `title`, `example` and optional `off` (dashed, struck-through). Cells stack on mobile and name their own row and column |
| `<Stats>` | `<Stats items={[{ value: "24", label: "sessions" }]} />` | Row of big accent numerals with labels under a 2px ink rule; 4 across, 2 on mobile |
| `<PullQuote>` | `<PullQuote author="Name">Quote</PullQuote>` | Big bold ink line over a 2px ink rule, with a mono attribution |
| `<Scenario>` | `<Scenario speaker="Name">Dialog</Scenario>` | Chat bubbles; `speaker="Me"` sits on the right in blue, everyone else on the left in white |
| `<TLDR>` | `<TLDR>Summary</TLDR>` | Ink panel labelled "In short" (an h2, so it shows in the contents rail's heading order) |
| `<Timeline>` | Wrapper for Event components | Career/timeline container |
| `<Event>` | `<Event year="2024" title="Role">Description</Event>` | Timeline entry |
| `<PostNav>` | `<PostNav slug="[slug]" related={["slug-a"]} />` | The end of every entry: Mark as read, its tool, the next step, Keep reading, newer/older and the author note |
| `<PostHeader>` | `<PostHeader title="Post Title" slug="[slug]" />` | Opens the entry, full width: chapter breadcrumb, entry number badge, title, the `subtitle` under the highlighter, a mono meta line (minutes, filed date, words, Mark as read) and "Use this when" chips for the situations it's on. Everything but the title is resolved from `lib/posts.ts` and `lib/manual.ts` by slug. Also numbers the entry's sections and renders the contents rail. Replaces the old `# Title` H1 |
| `<Figure>` | `<Figure src="/images/posts/[slug]-0.png" alt="..." caption="..." credit="..." width="420px" />` | Image with optional caption and credit; `width` overrides the default max-width (capped at the column). Add `hero` for a full-width arched hero image (up to 960px, natural ratio, no visible caption, hidden if the image fails to load) |
| `<Lede>` | `<Lede>Opening paragraph...</Lede>` | Sets the opening paragraph larger, in ink, weight 500 |

## Adding a New Post
1. Create folder: `app/posts/[slug]/`
2. Create `page.mdx` with metadata export (including `themes`, `quote`, canonical, openGraph, images), a `<PostHeader title="..." slug="[slug]" />` opening the body, a `<PostSchema>` component, and `<PostNav slug="[slug]" />` at the end
3. Make the share card with `npm run og-cards -- [slug]` (needs Playwright's Chromium once: `npx playwright install chromium`). It renders `docs/og-card/template.html` with the entry number, chapter, title and `quote` into `public/images/posts/[slug]-og.png`. Open it to check; a long title shrinks to fit. Point `openGraph.images` and the `<PostSchema>` `image` prop at it
4. It joins its chapter on the homepage, `/posts` and the footer count automatically. To put it on a reading order or make it a tool, edit `SITUATIONS` or `TOOLS` in `lib/manual-data.mjs`
5. Run `npm run validate-posts` to confirm all required SEO fields, themes and quote are present, then `npm test` (the entry-number snapshot will show the new number; update it with `npx vitest run -u` if that's the only change)
6. Commit and push - Vercel auto-deploys

**IMPORTANT:** Posts are automatically included in the sitemap, the `/posts` listing page, and the RSS feed — all derived from the filesystem via `lib/posts.ts`. The listing shows each post's display title and the `subtitle` metadata as its blurb. If adding a new top-level page (not a post), add the route to the `routes` array in `app/sitemap.ts`.

## Key Files
- `app/layout.tsx` - Main layout, font, metadata
- `app/viewport.ts` - Viewport config (safe area support for iPhone)
- `app/page.tsx` - Homepage: situations, toolkit and chapters (server page with client islands in `app/components/home/`)
- `app/bio/page.tsx` - Bio (Appendix A): author card with the voxel head, the climb, chapters, short bio. The head is built by `scripts/voxel-head/build-head.py` into `app/bio/voxel-data.ts`
- `app/posts/page.tsx` - All entries by date (generated from the filesystem)
- `lib/posts.ts` - Shared post index (powers the listing, RSS feed, PostHeader, and PostNav)
- `lib/manual-data.mjs` - The manual's copy: themes (chapters), situations (reading orders) and tools. Plain ESM so the validator can read it
- `lib/manual.ts` - Chapters, entry numbers, next in chapter, reading-order position, typed on top of `manual-data.mjs`
- `app/components/manual/` - The manual's shared parts: PageHead, EntryCard, NextStep, Contents rail, ReadToggle and read state, ToolArt, EntriesList, OrganiserKit (the one short bio)
- `lib/mdx-parsing.mjs` - Shared escape-aware MDX parsing helpers (metadata block extraction, JSX prop extraction, fence stripping) used by both `lib/posts.ts` and `scripts/validate-posts.mjs`
- `app/speaking/page.tsx` - Speaking (Appendix B): talks, booking card, videos, podcasts, articles
- `mdx-components.tsx` - Custom MDX components
- `app/components/chrome/` - TopBar (with the client `TopNav` and its "you are here" link), SiteFooter and the glen SceneFooter
- `docs/og-card/template.html` and `scripts/og-cards.mts` - Share card template and renderer
- `app/globals.css` - Tokens, the `.page-grid` breakout grid, `.col-bleed`, `.label`, `.hl`, custom breakpoint variants and component CSS
- `app/sitemap.ts` - Auto-generated sitemap
- `docs/solutions/` - Documented solutions to past problems (bugs, workflow gotchas, best practices), organised by category with YAML frontmatter (`module`, `tags`, `problem_type`) - relevant when implementing or debugging in a documented area

## Gotchas
Hard-won knowledge from working in this repo. Read before touching posts or metadata.

- **Two titles per post, on purpose.** The display title used on `/posts`, the homepage, and PostNav links comes from `<PostHeader title="...">` (or a legacy `# ...` H1, still supported by the validator for posts that haven't migrated). The `metadata.title` export is the longer SEO title used in `<title>`, OG tags, and the RSS feed. Several posts differ deliberately (e.g. `sustainable` displays "Sustainable Pace Just Got Faster" but its SEO title is "Sustainable Pace With AI: Why You're Probably Doing It Twice"). Don't "fix" the mismatch; change the PostHeader title prop if you want a different listing title.
- **Metadata is parsed by regex, not by evaluating the MDX.** `lib/posts.ts`, `app/sitemap.ts`, and `scripts/validate-posts.mjs` all regex-scan the raw file and take the **first** match. Keep the `export const metadata` block at the top of every post, and avoid literal strings like `date: "YYYY-MM-DD"` or `title: "..."` in body prose or code blocks above it — they'd be picked up as the post's metadata.
- **Eleven posts share the date 2023-09-18.** That's the Substack import date, not their real publication dates. They sort as one cluster (alphabetical by title within the tie) on `/posts`, in newer/older navigation and inside their chapters, and their entries say "From the Substack archive". Ben decided on 9 Nov 2026 to leave them: backfilling real dates would **renumber** those entries.
- **Entry numbers are computed, not stored.** Chapter = first theme; position = date order within the chapter (title breaks ties, drafts last). Changing a post's first theme or date moves its number and can shift others in both chapters. The snapshot in `lib/__snapshots__/manual.test.ts.snap` makes that visible; don't update it blindly.
- **Hiding a post: `draft: true`.** Add `draft: true` and `robots: { index: false, follow: false }` to a post's metadata export to merge it without publishing it. The page still builds and loads at its URL (handy for checking it on production), but `lib/posts.ts`, both sitemaps and the RSS feed skip it, so it's off `/posts`, the homepage and prev/next. To publish, delete both lines and set the real `date`.
- **`npm run validate-posts` is the safety net.** It checks one to five known `themes` and a `quote` on every post, that every situation and tool points at a real, published post, SEO fields, PostSchema/metadata drift, OG images existing on disk, and that every post ends with a `<PostNav>` whose slug matches its directory and whose `related` slugs point at real posts. It also enforces that every post has **exactly one** of a `<PostHeader>` or a legacy `# ` H1 (both, or neither, fails the check), that a `<PostHeader>` has a non-empty `title` prop and a `slug` prop matching its directory, and that a `<PostSchema>` slug matches too. Fenced code blocks are stripped before the H1 check, so a `# ` inside a code sample isn't mistaken for a real heading. Run it after any post change.
- **The copy review page is `/copy-review`.** It lists every theme, situation, tool and pull quote with the entry it points at, for signing off copy. It's noindex and not linked or in the sitemap; keep it that way.
- **Browser tests run against a production build.** `npm run test:e2e` starts `next start` on port 3200 (or set `BASE_URL` to test a preview). Locally, `npx playwright install chromium` once. In dev, a post with an embedded tweet can crash the client if the tweet can't be fetched; that's a Next dev overlay bug, not the site, so check those pages on a build.
- **Tests follow a temp-dir pattern.** `lib/posts.test.ts` and `app/sitemap.test.ts` write throwaway posts into a `mkdtemp` directory rather than mocking `fs`. Follow that pattern for anything else that reads the posts directory.

## Style Notes
- **Light theme only.** No dark mode, no `prefers-color-scheme` rules, no theme toggle (reversed July's dark-mode support on 2 Oct 2026).
- **Plain numbers, never §.** Entries are `4.8`, sections `4.8.2`, page sections `A.1`.
- **Layout:** `<main>` is a breakout grid (`.page-grid`). Post blocks sit in a 640px `content` column by default; components opt out with `.col-wide` (about 960px), `.col-full` (the 1312px container) or `.col-bleed` (edge to edge, for ruled sections; put the content in a `max-w-[1180px]` box with `px-[var(--gutter)]`). A page that starts or ends with a `.col-bleed` drops the grid's top or bottom padding. Grid children use `margin-top` only; the one exception is `.post-head` and `.hero-fig`, which carry a bottom margin so the first block after them can drop its own.
- **Type:** prose body is 19px Schibsted Grotesk in `muted` grey; headings and `strong` are `ink`. Weights are 400, 500 or 700 only, never arbitrary `font-[...]` weights. There is no serif.
- **Labels:** small mono labels use the `.label` class (mono, 13px, tracked, uppercase by CSS). Write the text in sentence case so screen readers read words, not letters.
- **Highlighter:** `.hl` puts the yellow band behind a line. One per page, usually the standfirst.
- **Breakpoints:** use the inclusive custom variants `tab` (1080px), `cards` (960px), `mob` (760px) and `tight` (380px). Do not use `sm`/`md`/`lg` or `max-[...]`.
- **CSS layering:** custom CSS that targets elements which also carry utilities goes in `@layer components` or `@layer base`; unlayered CSS beats every Tailwind utility in v4.
- **Motion:** arrows nudge, cards lift, chapter bars grow, toolkit cards flip, tool drawings move on hover or focus only, and a post's hero rises through its arch once. The reading column never moves. The full list and the reduced-motion behaviour are in DESIGN.md 6. Any new animation needs a `prefers-reduced-motion` variant and must never hide content while waiting for script. Give any new arrow inside a link the `nudge` class (plus `nudge-back` when it points left).
- **Links:** `textLinkClass` in `app/components/TextLink.tsx`: ink text, 2px accent underline at 0.22em offset, highlighter background on hover.
- **Dark grounds:** put `surface-dark` on anything with an ink or blue background so its focus ring turns yellow.
- **Colour tokens:** `paper`, `card`, `raise`, `ink`, `muted`, `faint`, `hair`, `accent`, `accent-deep`, `hi` (highlighter yellow), `blond`, `blond-line`, `red`. Never put `faint` text on `blond`. The five theme colours in `lib/manual-data.mjs` are for bars and dots only, never text.
- **Code blocks:** fences with a language are syntax-highlighted; unlabelled fences render as plain ink. Every block gets a Copy button.
- Safe-area padding for the iPhone notch lives on the top bar, footer and `--gutter`.

## Git Workflow
Always commit changes with descriptive messages and push to trigger Vercel deployment.

## Images
Store post images in `public/images/posts/` with naming convention: `[slug]-[n].jpg`. Share cards are `[slug]-og.png`, made by `npm run og-cards`.

## Conversion Script
`scripts/convert-substack.mjs` - Converts Substack HTML exports to MDX (used for initial import)

## Speaking Page
The speaking page (`app/speaking/page.tsx`) displays videos, podcasts, and articles. To add content, edit the arrays at the top of the file:

```typescript
// Videos - YouTube embeds that play on site
const videos = [
  { videoId: 'ABC123', title: 'Talk Title', event: 'Conference', date: '2024' },
];

// Podcasts - external links
const podcasts = [
  { title: 'Episode', show: 'Podcast Name', url: 'https://...', date: '2024' },
];

// Articles - external links
const articles = [
  { title: 'Article', publication: 'Publication', url: 'https://...', date: '2024' },
];
```

---

## Tone of Voice Guide

When writing blog posts, follow Ben's distinctive voice:

### Core Principles

**Conversational but not casual** - Write like you're having a pint with a colleague who respects honesty over politeness. Direct sentences. Clear points. No fluff.

**Pragmatic over theoretical** - Lead with practical reality, not abstract concepts. Start with "here's what happened" not "here's what the research says."

**Opinionated but self-aware** - Take strong positions ("that's backwards", "this is wrong") but acknowledge your own failures and contradictions.

### Voice Patterns

**Opening hooks:**
- Drop the reader into a specific moment: "It's 9:58am and you've been preparing..."
- Start with the counterintuitive: "Here's the strange part: it works."
- Lead with the contrarian take: "That debate is over. Speed won."

**Sentence structure:**
- Mix short punchy sentences with longer explanatory ones
- Use fragments for emphasis. Like this.
- Front-load the main point, then explain: "Ralph didn't replace anyone on my team. Ralph made me better at defining what needs to be built."
- **NEVER start sentences with "And", "But", or "Because".** Restructure instead: use "though" mid-sentence, "yet" as a conjunction, or fold the clause into the previous sentence.

**Tone markers:**
- Swear strategically (1-2 times per post, when it adds punch)
- Use parenthetical asides to add personality: "(Which, honestly, I should have been better at anyway.)"
- Rhetorical questions that challenge assumptions: "So if nothing ever runs to plan, why do we find it so hard to admit it?"

**Section headers:**
- Short, declarative: "The wrong question", "What actual speed looks like"
- Sometimes just the key phrase: "W.A.I.S.T.", "The Point"

### Content Structure

**Always include:**
- **Opening scenario or hook** (1-3 paragraphs)
- **Clear thesis statement** (often after the hook)
- **2-4 main sections** with headers
- **Concrete examples** (real situations, not hypotheticals)
- **KeyPoint or Callout boxes** for emphasis (1-3 per post)
- **TLDR at the end** (3-5 sentences summarizing the core argument)

**Common patterns:**
- Lead with a story or concrete situation
- Introduce the contrarian/counterintuitive idea
- Explain why the conventional wisdom is wrong
- Show what actually works (with examples)
- End with the broader implication or lesson

### Language Choices

**Prefer:**
- "Here's the thing..." over "One might consider..."
- "That's backwards" over "That may not be optimal"
- "Shit happens" over "challenges occur"
- "You bottled it" over "you made a suboptimal decision"
- Active voice: "you failed" not "a failure occurred"

**Punctuation:**
- Use semi-colons instead of colons when joining clauses (e.g. "genuinely useful; a system" not "genuinely useful: a system"). Colons are only for introducing lists.
- Write in **UK English** throughout (analyse, behaviour, colour, organise, etc.)

**Avoid:**
- Corporate speak ("leverage synergies", "circle back")
- Hedging unnecessarily ("perhaps", "possibly", "it might be")
- Overlong explanations of obvious points
- Academic distancing ("one could argue")
- Starting sentences with "And", "But", or "Because"

### Specific Techniques

**Callbacks and self-awareness:**
- Reference your own failures: "I've been guilty of this"
- Admit ongoing struggles: "I have to improve in the follow habit a lot"
- Question your own advice: "self-reflecting, I'm wondering how often I'm failing my own advice"

**Metaphors and analogies:**
- Use concrete, visual comparisons: "watermelon effect - green on the outside but red when you delve into it"
- Tech culture references: Ralph Wiggum, The Simpsons
- Simple physical analogies: running a race, building a machine

**Emphasis devices:**
- Bold text for key phrases in explanations
- Italics for verbal emphasis or internal dialogue
- CAPS for occasional strong emphasis (sparingly)

### Audience Awareness

**Primary audience:** Engineering leaders and senior engineers who:
- Value practical experience over theory
- Appreciate directness
- Are tired of bullshit and corporate speak
- Want actionable insights, not motivational content

**Tone balance:**
- Confident without arrogance
- Honest without being preachy
- Challenging without being dismissive
- Human without oversharing

### Post Length

Most posts run 600-1200 words. Structure:
- 100-200 word opening
- 400-800 words of main content (2-4 sections)
- 100-200 word closing/TLDR
