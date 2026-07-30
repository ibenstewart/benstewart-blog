---
title: Comprehensive SEO infrastructure and content improvements for Next.js 15 MDX blog
date: 2026-02-27
category: seo
tags:
  - structured-data
  - schema-markup
  - internal-linking
  - metadata
  - nextjs
  - mdx
  - faq-schema
  - sitemap
  - redirects
symptoms:
  - Title tags mirrored H1s exactly — no keyword targeting
  - dateModified always equals datePublished in JSON-LD (no freshness signal)
  - No FAQPage structured data (no "People Also Ask" opportunity)
  - Zero internal links between posts (authority not flowing across site)
  - OG locale set to en_GB while HTML lang="en" (mismatch)
  - Bold pseudo-headings (**text**) used instead of real ## H2 markdown
  - Some posts had no H2 headings at all below H1
affected_components:
  - app/components/JsonLd.tsx
  - app/components/RelatedPosts.tsx (new)
  - mdx-components.tsx
  - app/sitemap.ts
  - app/layout.tsx
  - next.config.ts
  - post MDX files
problem_type: seo
resolution_time: ~3 hours
difficulty: medium
---

# Comprehensive SEO improvements for Next.js 15 MDX blog

## Problem

A Next.js 15 blog using MDX content had several structural SEO gaps found during an audit of six posts:

- `<title>` tags were identical to narrative H1s — keyword-bearing phrases were missing from the most important SEO signal
- `dateModified` in `ArticleJsonLd` was always hardcoded to `datePublished` — Google never saw a freshness signal on updated posts
- No `FAQPage` JSON-LD existed anywhere on the site — zero chance of "People Also Ask" placement
- No internal links between posts — authority wasn't distributed across the site
- `openGraph.locale: 'en_GB'` in the global layout while `<html lang="en">` — mismatch causing inconsistent social platform behaviour
- Several posts used `**bold text**` as section dividers instead of real `## H2` headings — semantically invisible to crawlers
- One post (`leaders-dont-lie`) had no H2 headings at all below the H1

---

## Root Cause

The blog was built for readability first with no systematic SEO conventions. The MDX component system (`mdx-components.tsx`) had no registration for structured data beyond `ArticleJsonLd`, making it impossible to add FAQ schema or internal links in MDX files. The `PostSchema` component had no `lastModified` prop. The sitemap only extracted `date`, not a separate modification date.

---

## Solution

Changes split into two parts: shared infrastructure first, then per-post MDX content.

### Part 1: Shared infrastructure

#### 1. Add `lastModified` to `ArticleJsonLd` (`app/components/JsonLd.tsx`)

```typescript
type ArticleJsonLdProps = {
  title: string;
  description: string;
  date: string;
  lastModified?: string;  // add this
  url: string;
  image?: string;
};

export function ArticleJsonLd({ title, description, date, lastModified, url, image }: ArticleJsonLdProps) {
  const jsonLd = {
    // ...
    datePublished: date,
    dateModified: lastModified ?? date,  // was: dateModified: date
    // ...
  };
}
```

#### 2. Add `FAQJsonLd` component (`app/components/JsonLd.tsx`)

```typescript
type FAQItem = { question: string; answer: string };
type FAQJsonLdProps = { faqs: FAQItem[] };

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
```

#### 3. Create `RelatedPosts` component (`app/components/RelatedPosts.tsx`)

```typescript
import Link from 'next/link';

type RelatedPost = { slug: string; title: string };
type RelatedPostsProps = { posts: RelatedPost[] };

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null;
  return (
    <section className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Related
      </p>
      <ul className="space-y-1">
        {posts.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              href={`/posts/${slug}`}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 underline decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

#### 4. Register new components in `mdx-components.tsx`

MDX files cannot import components directly when using `experimental.mdxRs` — they must be registered in `useMDXComponents()`:

```typescript
import { ArticleJsonLd, FAQJsonLd, PersonJsonLd } from './app/components/JsonLd';
import { RelatedPosts } from './app/components/RelatedPosts';

type PostSchemaProps = {
  title: string;
  description: string;
  date: string;
  lastModified?: string;  // add this
  slug: string;
  image?: string;
};

const components = {
  // ...existing...
  PostSchema: ({ title, description, date, lastModified, slug, image }: PostSchemaProps) => (
    <ArticleJsonLd
      title={title}
      description={description}
      date={date}
      lastModified={lastModified}
      url={`https://www.benstewart.ai/posts/${slug}`}
      image={image}
    />
  ),
  FAQJsonLd: (props: { faqs: { question: string; answer: string }[] }) => <FAQJsonLd {...props} />,
  RelatedPosts: (props: { posts: { slug: string; title: string }[] }) => <RelatedPosts {...props} />,
};
```

#### 5. Wire `lastModified` into sitemap (`app/sitemap.ts`)

```typescript
type PostInfo = {
  slug: string;
  date: string | null;
  lastModified: string | null;  // add this
};

// In getPostsWithDates:
const dateMatch = content.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/);
const lastModifiedMatch = content.match(/lastModified:\s*["'](\d{4}-\d{2}-\d{2})["']/);
return {
  slug: post.slug,
  date: dateMatch ? dateMatch[1] : null,
  lastModified: lastModifiedMatch ? lastModifiedMatch[1] : null
};

// catch block — must include lastModified or TypeScript errors on build:
} catch {
  return { slug: post.slug, date: null, lastModified: null };
}

// In sitemap():
const posts = postsWithDates.map((post) => {
  const freshness = post.lastModified ?? post.date;
  return {
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: freshness ? new Date(freshness).toISOString() : new Date().toISOString()
  };
});
```

#### 6. Fix OG locale mismatch (`app/layout.tsx`)

```typescript
openGraph: {
  type: 'website',
  // locale: 'en_GB',  ← remove this line
  siteName: 'Ben Stewart',
```

---

### Part 2: Per-post patterns

#### SEO title vs H1 pattern

Set `metadata.title` to a keyword-bearing phrase. Keep the markdown `# H1` as the human-facing narrative hook. Next.js uses `metadata.title` for the `<title>` tag; the MDX `#` heading renders independently as the page H1.

```mdx
export const metadata = {
  title: "AI Coding Tools and PRDs: Why the Spec Is the Real Work",  // ← keyword-bearing
  // ...
};

# Ralph Isn't the Point. The PRD Is.  // ← narrative H1, unchanged
```

Both `metadata.title` and `<PostSchema title="...">` must use the same keyword-bearing value — the validate-posts script checks for drift.

#### Convert bold pseudo-headings to real H2s

```mdx
// Before — semantically invisible to crawlers
**The PRD is the work**

// After — real heading
## The PRD is the real work
```

#### Add `FAQJsonLd` (for posts with answerable questions)

Place immediately after `<PostSchema>`, before the post body:

```mdx
<FAQJsonLd faqs={[
  {
    question: "What is the difference between reactive AI and proactive AI?",
    answer: "Reactive AI waits for you to ask a question and responds. Proactive AI monitors systems and surfaces problems before you ask..."
  },
  {
    question: "What would proactive AI look like for an engineering team?",
    answer: "An agent that understands your deployment pipelines and messages you when something looks wrong..."
  }
]} />
```

#### Add `RelatedPosts` (at the foot of every post)

```mdx
<RelatedPosts posts={[
  { slug: "multi-agent-ai-strategy", title: "How I Use Multiple AI Agents to Stress-Test Strategy" },
  { slug: "sustainable", title: "Sustainable Pace Just Got Faster" },
  { slug: "ralph-isnt-the-point", title: "Ralph Isn't the Point. The PRD Is." },
]} />
```

#### Rename a post folder with 301 redirect

When renaming a slug (e.g. `thinking-engine` → `multi-agent-ai-strategy`):

1. Rename the folder: `mv app/posts/thinking-engine app/posts/multi-agent-ai-strategy`
2. Update `alternates.canonical`, `openGraph.url`, and `<PostSchema slug="...">` in the MDX file
3. Update slug references in `app/posts/page.tsx` and `app/page.mdx`
4. Add a static redirect in `next.config.ts` as a fallback (works even without `POSTGRES_URL`):

```typescript
async redirects() {
  const staticRedirects = [
    {
      source: '/posts/thinking-engine',
      destination: '/posts/multi-agent-ai-strategy',
      permanent: true,
    },
  ];

  if (!process.env.POSTGRES_URL) {
    return staticRedirects;
  }

  let dbRedirects = await sql`SELECT source, destination, permanent FROM redirects;`;

  return [
    ...staticRedirects,
    ...dbRedirects.map(({ source, destination, permanent }) => ({
      source,
      destination,
      permanent: !!permanent
    })),
  ];
},
```

---

## Critical Gotchas

**1. TypeScript catch block in sitemap**
The catch block must return all fields defined in `PostInfo`. Returning `{ slug, date: null }` without `lastModified` causes a build-time type error:
```
Type 'undefined' is not assignable to type 'string | null'
```
Fix: `return { slug: post.slug, date: null, lastModified: null };`

**2. PostSchema title drift**
`validate-posts` checks that `<PostSchema title="...">` exactly matches `metadata.title`. When updating `metadata.title` to a keyword-bearing value, update the `PostSchema` prop too.

**3. MDX components must be registered, not imported**
With `experimental.mdxRs` enabled, MDX files cannot import components directly. All components usable in MDX must be registered in `useMDXComponents()` in `mdx-components.tsx`.

**4. JSON-LD `<` escaping**
Always escape `<` in JSON-LD script blocks:
```typescript
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
```

---

## Prevention: Checklist for new posts

Before publishing any new post:

- [ ] `metadata.title` is keyword-bearing (not just the narrative H1 repeated)
- [ ] `<PostSchema title="...">` matches `metadata.title` exactly
- [ ] Post has at least 2 real `## H2` headings (not `**bold pseudo-headings**`)
- [ ] `<FAQJsonLd>` added if post contains 3+ answerable questions
- [ ] `<RelatedPosts>` added linking to 2–3 thematically related posts
- [ ] `npm run validate-posts` passes

When updating an existing post significantly:
- [ ] Add `lastModified: "YYYY-MM-DD"` to `metadata` and `<PostSchema>` props

### Gaps the current `validate-posts` script does not catch

| Gap | Impact |
|-----|--------|
| Minimum H2 count | Posts with no real headings pass validation |
| Bold pseudo-heading detection | `**text**` as headings is invisible to crawlers |
| Internal link presence | Posts with zero outbound internal links pass |
| `lastModified` field | Stale freshness signals go undetected |
| OG image file existence | Missing images fail silently |

---

## References

- **Source spec:** `docs/seo-user-stories.md`
- **Implementation plan:** `docs/plans/2026-02-27-feat-seo-improvements-plan.md`
- `app/components/JsonLd.tsx` — `ArticleJsonLd`, `FAQJsonLd`
- `app/components/RelatedPosts.tsx` — `RelatedPosts`
- `mdx-components.tsx` — component registration
- `app/sitemap.ts` — `lastModified` extraction
- `app/layout.tsx` — OG locale
- `next.config.ts` — static redirects pattern
- `scripts/validate-posts.mjs` — validation logic
