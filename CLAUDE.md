# Ben Stewart's Blog

## Project Overview
Personal blog for Ben Stewart - engineer turned leader at Skyscanner. Writing about software engineering and leadership.

## Tech Stack
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **Content:** MDX files in `app/posts/[slug]/page.mdx`
- **Font:** Outfit (Google Fonts)
- **Deployment:** Vercel (auto-deploys from GitHub)
- **Repo:** https://github.com/ibenstewart/benstewart-blog

## Quick Commands
```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Build for production
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

## Adding a New Post
1. Create folder: `app/posts/[slug]/`
2. Create `page.mdx` with metadata export and content
3. Add to posts array in `app/posts/page.tsx`
4. Add to homepage list in `app/page.mdx` (if featuring)
5. Commit and push - Vercel auto-deploys

## Key Files
- `app/layout.tsx` - Main layout, font, metadata
- `app/page.mdx` - Homepage
- `app/posts/page.tsx` - Posts listing page
- `mdx-components.tsx` - MDX component styling
- `app/globals.css` - Global styles
- `app/sitemap.ts` - Auto-generated sitemap

## Style Notes
- Page width: 75ch
- Base font size: text-lg (18px)
- Headings: text-2xl/3xl for h1, text-xl/2xl for h2
- Links: neutral underline decoration
- Dark mode supported

## Git Workflow
Always commit changes with descriptive messages and push to trigger Vercel deployment.
