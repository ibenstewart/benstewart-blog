# Ben Stewart's Blog

## Project Overview
Personal blog for Ben Stewart - engineer turned leader at Skyscanner. Writing about software engineering and leadership.

**Site URL:** https://www.benstewart.ai

## Tech Stack
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4
- **Content:** MDX files in `app/posts/[slug]/page.mdx`
- **Font:** Outfit (Google Fonts)
- **Deployment:** Vercel (auto-deploys from GitHub)
- **Repo:** https://github.com/ibenstewart/benstewart-blog

## Quick Commands
```bash
npm run dev      # Start dev server (uses Turbopack)
npm run build    # Build for production (uses webpack)
```

## Blog Post Structure
Posts live in `app/posts/[slug]/page.mdx` with this format:

```mdx
export const metadata = {
  title: "Post Title",
  date: "YYYY-MM-DD",
  subtitle: "Optional subtitle"
};

# Post Title

Content goes here...
```

## Custom MDX Components
Available components in `mdx-components.tsx`:

| Component | Usage | Description |
|-----------|-------|-------------|
| `<KeyPoint>` | `<KeyPoint>Important text</KeyPoint>` | Highlighted box for key takeaways |
| `<Callout>` | `<Callout type="insight\|warning\|tip\|story">` | Colored callout boxes |
| `<PullQuote>` | `<PullQuote author="Name">Quote</PullQuote>` | Large styled quote with attribution |
| `<Scenario>` | `<Scenario speaker="Name">Dialog</Scenario>` | Conversation/dialog formatting |
| `<TLDR>` | `<TLDR>Summary</TLDR>` | Article summary box |
| `<Timeline>` | Wrapper for Event components | Career/timeline container |
| `<Event>` | `<Event year="2024" title="Role">Description</Event>` | Timeline entry |

## Adding a New Post
1. Create folder: `app/posts/[slug]/`
2. Create `page.mdx` with metadata export and content
3. Add to posts array in `app/posts/page.tsx`
4. Add to homepage list in `app/page.mdx` (if featuring)
5. Commit and push - Vercel auto-deploys

**IMPORTANT:** Posts are automatically included in the sitemap. If adding a new top-level page (not a post), add the route to the `routes` array in `app/sitemap.ts`.

## Key Files
- `app/layout.tsx` - Main layout, font, metadata
- `app/viewport.ts` - Viewport config (safe area support for iPhone)
- `app/page.mdx` - Homepage
- `app/bio/page.mdx` - Bio page with timeline
- `app/posts/page.tsx` - Posts listing page
- `app/speaking/page.tsx` - Speaking page (videos, podcasts, articles)
- `mdx-components.tsx` - Custom MDX components
- `app/globals.css` - Global styles (includes safe area CSS)
- `app/sitemap.ts` - Auto-generated sitemap

## Style Notes
- Page width: 75ch
- Base font size: text-lg (18px)
- Headings: text-2xl/3xl for h1, text-xl/2xl for h2
- Links: neutral underline decoration
- Dark mode supported
- Safe area padding for iPhone notch/dynamic island

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
