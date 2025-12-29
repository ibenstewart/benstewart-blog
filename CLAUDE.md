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
