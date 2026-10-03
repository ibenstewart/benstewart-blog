# Ben Stewart's Blog

## Project Overview
Personal blog for Ben Stewart - engineer turned leader at Skyscanner. Writing about software engineering and leadership.

**Site URL:** https://www.benstewart.ai

## Tech Stack
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Content:** MDX files in `app/posts/[slug]/page.mdx`
- **Fonts:** Schibsted Grotesk (everything), Source Serif 4 italic only (asides), IBM Plex Mono (code), all via next/font Google Fonts
- **Design system:** Glasgow Civic, spec in `docs/design/glasgow-civic/DESIGN.md` (wins on any value it states)
- **Deployment:** Vercel (auto-deploys from GitHub)
- **Repo:** https://github.com/ibenstewart/benstewart-blog

## Quick Commands
```bash
npm run dev              # Start dev server (uses Turbopack)
npm run build            # Build for production (uses webpack)
npm run validate-posts   # Check all posts have required SEO metadata
```

## Blog Post Structure
Posts live in `app/posts/[slug]/page.mdx` with this format:

```mdx
export const metadata = {
  title: "Post Title",
  date: "YYYY-MM-DD",
  subtitle: "Optional subtitle",
  description: "A concise description for SEO and social sharing.",
  alternates: {
    canonical: 'https://www.benstewart.ai/posts/[slug]'
  },
  openGraph: {
    title: "Post Title",
    description: "A concise description for SEO and social sharing.",
    url: "https://www.benstewart.ai/posts/[slug]",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
  }
};

<PostHeader title="Post Title" slug="[slug]" />

<PostSchema
  title="Post Title"
  description="A concise description for SEO and social sharing."
  date="YYYY-MM-DD"
  slug="[slug]"
/>

Content goes here...

<PostNav slug="[slug]" related={["other-slug", "another-slug"]} />
```

**Note:** Every post ends with `<PostNav slug="[slug]" />`. It renders previous/next links automatically (derived from post dates via `lib/posts.ts`). The `related` prop is optional; pass 2-3 slugs of hand-picked related posts and their display titles are resolved automatically.

**Note:** If the post has a custom OG image, use a relative path for the `images` URL (e.g. `"/images/posts/[slug]-0.png"`) and add the `image` prop to `<PostSchema>` with the **absolute** URL (JSON-LD requires it).

**Important:** The `title`, `description`, and `date` in `<PostSchema>` must match the values in the `metadata` export. The validation script checks for drift between them.

## Custom MDX Components
Available components in `mdx-components.tsx`:

| Component | Usage | Description |
|-----------|-------|-------------|
| `<KeyPoint>` | `<KeyPoint>Important text</KeyPoint>` | Highlighted box for key takeaways |
| `<Callout>` | `<Callout type="insight\|warning\|tip\|story" label="Optional">` | Quiet outlined panel (1px hair border, 20px radius) with a small uppercase label (Insight/Worth knowing/Try this/Story, or `label` to override); blue label for insight and tip, red for warning, grey for story |
| `<Quadrant>` | `<Quadrant x={["Easy", "Hard"]} y={["Expensive", "Cheap"]} cells={[...4]} />` | 2x2 grid with axis labels; each cell has `level`, `title`, `example` and optional `off` (dashed, struck-through). Cells stack on mobile and name their own row and column |
| `<Stats>` | `<Stats items={[{ value: "24", label: "sessions" }]} />` | Row of big accent numerals with labels under a 2px ink rule; 4 across, 2 on mobile |
| `<PullQuote>` | `<PullQuote author="Name">Quote</PullQuote>` | Large styled quote with attribution |
| `<Scenario>` | `<Scenario speaker="Name">Dialog</Scenario>` | Conversation/dialog formatting |
| `<TLDR>` | `<TLDR>Summary</TLDR>` | Article summary box |
| `<Timeline>` | Wrapper for Event components | Career/timeline container |
| `<Event>` | `<Event year="2024" title="Role">Description</Event>` | Timeline entry |
| `<PostNav>` | `<PostNav slug="[slug]" related={["slug-a"]} />` | Prev/next + related links at the end of every post |
| `<PostHeader>` | `<PostHeader title="Post Title" slug="[slug]" />` | Opens the post body, centred: breadcrumb pill to /posts, title, serif-italic standfirst (the `subtitle`), and a sentence-case meta line (date + reading time), all resolved from `lib/posts.ts` by slug - replaces the old `# Title` H1 |
| `<PostList>` | `<PostList slugs={["slug-a", "slug-b"]} />` | Editorial rows (title, subtitle, date, reading time) for a set of posts; omit `slugs` to list every post, newest first |
| `<Figure>` | `<Figure src="/images/posts/[slug]-0.png" alt="..." caption="..." credit="..." width="420px" />` | Image with optional caption and credit; `width` overrides the default max-width (capped at the column). Add `hero` for a full-width arched hero image (up to 960px, natural ratio, no visible caption, hidden if the image fails to load) |
| `<Lede>` | `<Lede>Opening paragraph...</Lede>` | Wraps the opening paragraph with a grotesk 700 drop-cap first letter |

## Adding a New Post
1. Create folder: `app/posts/[slug]/`
2. Create `page.mdx` with metadata export (including canonical, openGraph, images), a `<PostHeader title="..." slug="[slug]" />` opening the body, a `<PostSchema>` component, and `<PostNav slug="[slug]" />` at the end
3. To feature it on the homepage, add its slug to the `startHere` or `favourites` export in `app/page.mdx`. Every other post appears in the homepage Archive automatically
4. Run `npm run validate-posts` to confirm all required SEO fields are present
5. Commit and push - Vercel auto-deploys

**IMPORTANT:** Posts are automatically included in the sitemap, the `/posts` listing page, and the RSS feed — all derived from the filesystem via `lib/posts.ts`. The listing shows each post's H1 as its title and the `subtitle` metadata as its blurb. If adding a new top-level page (not a post), add the route to the `routes` array in `app/sitemap.ts`.

## Key Files
- `app/layout.tsx` - Main layout, font, metadata
- `app/viewport.ts` - Viewport config (safe area support for iPhone)
- `app/page.mdx` - Homepage
- `app/bio/page.mdx` - Bio page with timeline
- `app/posts/page.tsx` - Posts listing page (generated from the filesystem)
- `lib/posts.ts` - Shared post index (powers the listing, RSS feed, PostHeader, and PostNav)
- `lib/mdx-parsing.mjs` - Shared escape-aware MDX parsing helpers (metadata block extraction, JSX prop extraction, fence stripping) used by both `lib/posts.ts` and `scripts/validate-posts.mjs`
- `app/speaking/page.tsx` - Speaking page (videos, podcasts, articles)
- `mdx-components.tsx` - Custom MDX components
- `app/globals.css` - Tokens, fonts, the `.page-grid` breakout grid, custom breakpoint variants and component CSS
- `app/sitemap.ts` - Auto-generated sitemap
- `docs/solutions/` - Documented solutions to past problems (bugs, workflow gotchas, best practices), organised by category with YAML frontmatter (`module`, `tags`, `problem_type`) - relevant when implementing or debugging in a documented area

## Gotchas
Hard-won knowledge from working in this repo. Read before touching posts or metadata.

- **Two titles per post, on purpose.** The display title used on `/posts`, the homepage, and PostNav links comes from `<PostHeader title="...">` (or a legacy `# ...` H1, still supported by the validator for posts that haven't migrated). The `metadata.title` export is the longer SEO title used in `<title>`, OG tags, and the RSS feed. Several posts differ deliberately (e.g. `sustainable` displays "Sustainable Pace Just Got Faster" but its SEO title is "Sustainable Pace With AI: Why You're Probably Doing It Twice"). Don't "fix" the mismatch; change the PostHeader title prop if you want a different listing title.
- **Metadata is parsed by regex, not by evaluating the MDX.** `lib/posts.ts`, `app/sitemap.ts`, and `scripts/validate-posts.mjs` all regex-scan the raw file and take the **first** match. Keep the `export const metadata` block at the top of every post, and avoid literal strings like `date: "YYYY-MM-DD"` or `title: "..."` in body prose or code blocks above it — they'd be picked up as the post's metadata.
- **Eleven posts share the date 2023-09-18.** That's the Substack import date, not their real publication dates. They sort as one cluster (alphabetical by title within the tie) on `/posts` and in prev/next navigation. Backfilling real dates in each post's `metadata.date` will automatically fix the listing order, prev/next links, RSS feed, and sitemap — no other changes needed.
- **Hiding a post: `draft: true`.** Add `draft: true` and `robots: { index: false, follow: false }` to a post's metadata export to merge it without publishing it. The page still builds and loads at its URL (handy for checking it on production), but `lib/posts.ts`, both sitemaps and the RSS feed skip it, so it's off `/posts`, the homepage and prev/next. To publish, delete both lines and set the real `date`.
- **`npm run validate-posts` is the safety net.** It checks SEO fields, PostSchema/metadata drift, OG images existing on disk, and that every post ends with a `<PostNav>` whose slug matches its directory and whose `related` slugs point at real posts. It also enforces that every post has **exactly one** of a `<PostHeader>` or a legacy `# ` H1 (both, or neither, fails the check), that a `<PostHeader>` has a non-empty `title` prop and a `slug` prop matching its directory, and that a `<PostSchema>` slug matches too. Fenced code blocks are stripped before the H1 check, so a `# ` inside a code sample isn't mistaken for a real heading. Run it after any post change.
- **Tests follow a temp-dir pattern.** `lib/posts.test.ts` and `app/sitemap.test.ts` write throwaway posts into a `mkdtemp` directory rather than mocking `fs`. Follow that pattern for anything else that reads the posts directory.

## Style Notes
- **Light theme only.** No dark mode, no `prefers-color-scheme` rules, no theme toggle (reversed July's dark-mode support on 2 Oct 2026).
- **Layout:** `<main>` is a breakout grid (`.page-grid`). Post blocks sit in a 640px `content` column by default; components opt out with `.col-wide` (about 960px) or `.col-full` (the 1312px container). Grid children use `margin-top` only; the one exception is `.post-head` and `.hero-fig`, which carry a bottom margin so the first block after them can drop its own (KTD4).
- **Type:** prose body is 19px Schibsted Grotesk in `muted` grey; headings and `strong` are `ink`. Weights are 400, 500 or 700 only, never arbitrary `font-[...]` weights.
- **Serif means italic.** Source Serif 4 is loaded italic only, so anything `font-serif` must also be `italic` (standfirsts, excerpts, captions, Scenario dialogue, markdown blockquote). Everything else is `font-sans`.
- **Breakpoints:** use the inclusive custom variants `tab` (1080px), `cards` (960px), `mob` (760px) and `tight` (380px). Do not use `sm`/`md`/`lg` or `max-[...]`.
- **CSS layering:** custom CSS that targets elements which also carry utilities goes in `@layer components` or `@layer base`; unlayered CSS beats every Tailwind utility in v4.
- **Links:** `textLinkClass` in `app/components/TextLink.tsx`: ink text, 2px accent underline at 0.22em offset, accent text on hover.
- **Colour tokens:** `paper`, `raise`, `ink`, `muted`, `faint`, `hair`, `accent`, `accent-deep`, `blond`, `blond-line`, `red`. Never put `faint` text on `blond`.
- **Code blocks:** fences with a language are syntax-highlighted; unlabelled fences render as plain ink. Every block gets a Copy button.
- Safe-area padding for the iPhone notch lives on the masthead, footer and `--gutter`.

## Git Workflow
Always commit changes with descriptive messages and push to trigger Vercel deployment.

## Images
Store post images in `public/images/posts/` with naming convention: `[slug]-[n].jpg`

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
