---
title: "feat: Implement SEO improvements across benstewart.ai"
type: feat
status: active
date: 2026-02-27
---

# feat: Implement SEO improvements across benstewart.ai

## Overview

Implement all 11 SEO user stories from `docs/seo-user-stories.md`. The work is split into shared infrastructure changes (Part 1) that must land first, followed by per-post MDX content changes (Part 2). The single highest-risk item is the `thinking-engine` folder rename — this requires a database redirect row and should be deployed last.

## Problem Statement

The six audited posts have a cluster of addressable SEO gaps:

- `<title>` tags mirror narrative H1s rather than keyword-bearing phrases
- `dateModified` in JSON-LD is always equal to `datePublished` — no freshness signal
- No `FAQPage` structured data, so zero chance of "People Also Ask" placement
- Zero internal links between posts — authority doesn't flow across the site
- OG locale mismatch (`en_GB` vs `lang="en"`) causes inconsistent social behaviour
- Several posts have no `<h2>` headings at all (Google sees only an H1)

## Proposed Solution

### Part 1 — Shared infrastructure (do first, in order)

**Story 2: `lastModified` field in MDX + sitemap + JSON-LD**

- `app/components/JsonLd.tsx:1–7` — add optional `lastModified?: string` to `ArticleJsonLdProps`
- `app/components/JsonLd.tsx:16` — change `dateModified: date` → `dateModified: lastModified ?? date`
- `mdx-components.tsx:56–62` — add optional `lastModified?: string` to `PostSchemaProps`; pass through to `ArticleJsonLd`
- `app/sitemap.ts:35` — add second regex to extract `lastModified` field; use it for `lastModified` in sitemap entry when present, fall back to `date`
- All existing posts: add `lastModified: "YYYY-MM-DD"` to metadata matching their current `date` (pre-populating with no visible change)

**Story 3: `FAQJsonLd` component**

- `app/components/JsonLd.tsx` — add exported `FAQJsonLd` component (see user story for exact implementation)
- `mdx-components.tsx` — import and re-export `FAQJsonLd` in the `components` map so MDX files can use `<FAQJsonLd faqs={[...]} />`

**Story 4: `RelatedPosts` component**

- Create `app/components/RelatedPosts.tsx` (see user story for exact implementation)
- `mdx-components.tsx` — import and add `RelatedPosts` to the `components` map

**Story 5: OG locale fix (one-liner)**

- `app/layout.tsx:27` — remove `locale: 'en_GB'` from the `openGraph` block (or change to `'en_US'`)

**Story 1: SEO title pattern (no code change — establishes convention)**

- `metadata.title` can now differ from the markdown `# H1` heading
- Next.js already uses `metadata.title` for `<title>` and MDX `#` heading renders independently as H1
- No shared code change needed; per-post stories below apply the values

---

### Part 2 — Per-post MDX changes (Stories 6–11, after Part 1)

**Story 6: `thinking-engine` — ⚠️ rename required**

- Update `metadata.title` to `"How I Use Multiple AI Agents to Stress-Test Strategy"`
- Update `metadata.description` and `openGraph.description` (see user story for text)
- **Rename folder** `app/posts/thinking-engine/` → `app/posts/multi-agent-ai-strategy/`
- Update `alternates.canonical`, `openGraph.url`, `<PostSchema slug=...>` to `multi-agent-ai-strategy`
- **Add redirect row** to Postgres `redirects` table: `source=/posts/thinking-engine`, `destination=/posts/multi-agent-ai-strategy`, `permanent=true`
- Rewrite all 8 H2 headings to keyword-bearing versions (see user story for exact copy)
- Add `<FAQJsonLd>` block (4 Q&As, see user story)
- Add inline internal link in the `## How the multi-agent AI system works` section
- Add `<RelatedPosts>` at foot (3 posts)
- Update `app/posts/page.tsx` and `app/page.mdx` slug references from `thinking-engine` → `multi-agent-ai-strategy`

**Story 7: `ralph-isnt-the-point`**

- Update `metadata.title` to `"AI Coding Tools and PRDs: Why the Spec Is the Real Work"`
- Convert 3 bold pseudo-headings (`**...**`) to real `## H2` headings (see user story for exact wording)
- Add `<RelatedPosts>` at foot (3 posts)

**Story 8: `the-three-pound-question`**

- Update `metadata.title` to `"Reactive AI vs Proactive AI: What a £3 Clawdbot Experiment Revealed"`
- Update `metadata.description` / `openGraph.description`
- Rewrite 4 H2 headings to keyword-bearing versions
- Add `<FAQJsonLd>` block (3 Q&As)
- Add `<RelatedPosts>` at foot (3 posts)

**Story 9: `leaders-dont-lie`**

- Update `metadata.title` to `"Leaders Don't Lie: How to Report Project Status Honestly"`
- Insert 3 new `## H2` headings at the correct positions in the body (post currently has no H2s)
- Add `<FAQJsonLd>` block (3 Q&As)
- Add `<RelatedPosts>` at foot (3 posts: `the-ideal-senior-engineer`, `shared-documents-are-not-shared-understanding`, `practical-postmortems` — all confirmed to exist)

**Story 10: `sustainable`**

- Update `metadata.title` to `"Sustainable Pace With AI: Why You're Probably Doing It Twice"`
- Skip OG image change (no post-specific image file exists yet — use default)
- Rewrite 4 H2 headings to keyword-bearing versions
- Add `<FAQJsonLd>` block (3 Q&As)
- Add `<RelatedPosts>` at foot (3 posts)

**Story 11: `the-ideal-senior-engineer`**

- Update `metadata.title` to `"What a Great Senior Engineer Actually Looks Like"`
- Remove `## Introduction` and `## Closing` H2 headings
- Rename `## The IC Path` → `## The career path to senior engineer`
- Rename `## The Role of a Senior` → `## What a high-performing senior engineer actually looks like`
- Add `<FAQJsonLd>` block (3 Q&As)
- Add `<RelatedPosts>` at foot (3 posts: `leaders-dont-lie`, `ralph-isnt-the-point`, `am-i-technically-dangerous` — all confirmed to exist)

---

## Technical Considerations

- **Redirect mechanism:** `next.config.ts` loads redirects from Postgres at build time. The `thinking-engine` → `multi-agent-ai-strategy` redirect must be inserted into the database before or simultaneously with deployment — it will not work from a local `.env` during dev unless `POSTGRES_URL` is set. For safety, also add a static fallback in `next.config.ts` so it works in preview deployments.
- **PostSchema `lastModified` prop:** The prop flows through `PostSchema` → `ArticleJsonLd`. The MDX validate script checks for drift between `<PostSchema>` props and `metadata` — confirm `lastModified` is exempted or add it to the validation rules.
- **`FAQJsonLd` in MDX:** Because `experimental.mdxRs` (Rust compiler) is enabled, the component must be registered in `useMDXComponents()` — it cannot be imported directly in the MDX file. This is already the pattern for `PostSchema`; follow the same approach.
- **Folder rename for `thinking-engine`:** After renaming, check `app/posts/page.tsx` and `app/page.mdx` for any hardcoded slug references and update them. Run `grep -r "thinking-engine" app/` before and after.

## Acceptance Criteria

- [ ] `npm run validate-posts` passes on all posts after all metadata changes
- [ ] `npm run build` succeeds without errors
- [ ] `/sitemap.xml` shows `lastmod` using `lastModified` field when present
- [ ] Every modified post: browser `<title>` shows new SEO title, H1 is unchanged
- [ ] Every modified post: page source contains `FAQPage` JSON-LD block (stories 6, 8, 9, 10, 11)
- [ ] Every modified post: `<RelatedPosts>` section renders at foot with correct links
- [ ] `ralph-isnt-the-point`: view source shows `<h2>` tags for the three converted headings
- [ ] `leaders-dont-lie`: view source shows three new `<h2>` tags
- [ ] `the-ideal-senior-engineer`: `Introduction` and `Closing` H2s absent; two new H2s present
- [ ] `/posts/thinking-engine` returns a 301 redirect to `/posts/multi-agent-ai-strategy`
- [ ] `og:locale` is absent or `en_US` on all pages (not `en_GB`)

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| `thinking-engine` redirect not in DB at deploy time | Add static fallback in `next.config.ts` redirects array |
| `validate-posts` fails after adding `lastModified` | Check if script needs updating to handle the new field |
| Slug references to `thinking-engine` missed in listing/homepage | `grep -r "thinking-engine" app/` sweep before closing the story |
| `FAQJsonLd` not available in MDX (missing from components map) | Confirm registration in `useMDXComponents()` before adding to any post |

## Suggested Execution Order

Per the user stories doc:

1. Story 2 — `lastModified` (touches shared components)
2. Story 3 — `FAQJsonLd` component
3. Story 4 — `RelatedPosts` component
4. Story 5 — OG locale fix (one-liner)
5. Story 1 — SEO title pattern (convention only, no code)
6. Stories 7–11 — per-post changes (any order)
7. Story 6 — `thinking-engine` rename + redirect (last, test redirect carefully before deploying)

## Sources & References

- **User stories doc:** `docs/seo-user-stories.md`
- `app/components/JsonLd.tsx` — `ArticleJsonLdProps`, `ArticleJsonLd`
- `mdx-components.tsx:56` — `PostSchemaProps`, `PostSchema` component
- `app/sitemap.ts:35` — date regex, `lastModified` field
- `app/layout.tsx:27` — `openGraph.locale: 'en_GB'`
- `next.config.ts:11` — Postgres redirect loading
