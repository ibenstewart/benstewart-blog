---
title: MDX components must not wrap block children in a p element
date: 2026-07-30
category: ui-bugs
module: mdx-components
problem_type: ui_bug
component: rails_view
symptoms:
  - "Drop cap (.lede::first-letter) never renders despite correct-looking CSS"
  - "React 19 hydration error on the affected post page"
  - "Built HTML contains nested paragraphs; the browser auto-closes the outer p, leaving it empty"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [mdx, nesting, hydration, drop-cap, mdx-components]
---

# MDX components must not wrap block children in a p element

## Problem

Custom MDX components registered in `mdx-components.tsx` that wrapped their `children` in a `<p>` produced invalid HTML nesting, because MDX block-parses multi-line component children into paragraphs via the registered `p` mapping. The result: `<p><p>...</p></p>` in the server-rendered HTML.

## Symptoms

- The `Lede` drop cap silently never rendered: the browser auto-closed the outer `<p>` before the inner one, so `.lede::first-letter` targeted an empty element.
- React 19 raised a hydration error on `/posts/ralph-isnt-the-point` (server HTML disagreed with the client tree after browser correction).
- Grepping the built output confirmed it: `grep -E '<p[^>]*>\s*<p' .next/server/app/**/*.html` matched on multiple pages (`Lede`, `KeyPoint` in posts, `Event` on `/bio`).

## What Didn't Work

No failed attempts: the defect shipped silently and was caught by code review (correctness reviewer verified it against a fresh build), not by tests or visual inspection. `npm run build` compiles invalid nesting without complaint, and the pages "looked fine" apart from the missing drop cap.

## Solution

Change the wrapper element from `p` to `div` and let the MDX `p` mapping supply the paragraph (fixed in PR #17):

```tsx
// Before — guarantees p-in-p when children are block content
Lede: ({ children }: LedeProps) => (
  <p className="lede font-serif ...">{children}</p>
),

// After — the inner paragraph comes from the p mapping
Lede: ({ children }: LedeProps) => (
  <div className="lede">{children}</div>
),
```

CSS that targeted the wrapper's first letter moves to the real paragraph:

```css
.lede > p::first-letter { /* was .lede::first-letter */ }
```

The same one-word fix applied to `KeyPoint` and `Event` in `mdx-components.tsx`.

## Why This Works

MDX treats a component's multi-line children as block content and routes each paragraph through the registered `p` mapping. Any component that itself renders `<p>` around `children` therefore nests paragraphs, which HTML forbids; browsers recover by closing the outer `<p>` early, and React 19 flags the mismatch at hydration. A `<div>` wrapper is valid around block content, and typography classes belong on the inner paragraph (already styled by the `p` mapping).

## Prevention

- Rule of thumb for `mdx-components.tsx`: a component that receives markdown `children` wraps them in `div` (or `section`/`figure`), never `p`. Only leaf components that render their own text may use `p`.
- Cheap regression check after build: `grep -rE '<p[^>]*><p' .next/server/app` should return nothing.
- The same class of bug applies to `span`-vs-block: the default `img` mapping uses a span-based pseudo-figure because markdown images arrive inside a `<p>`, where a real `<figure>` would be invalid.

## Related Issues

- Fixed in PR #17 (editorial redesign), findings #3 and the pre-existing `KeyPoint`/`Event` cleanup.
