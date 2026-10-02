---
title: Posts opening with a heading or figure get a double gap under the header
date: 2026-10-02
category: ui-bugs
module: page-grid
problem_type: ui_bug
component: rails_view
symptoms:
  - "Posts whose first block is an h2 or a Figure open with roughly twice the gap under the post header that other posts have"
  - "Build, tests, validate-posts and axe all pass; only a measured or eyeballed gap shows it"
root_cause: logic_error
resolution_type: code_fix
severity: low
tags: [css, grid, margins, specificity, tailwind-v4, page-grid, post-header]
---

# Posts opening with a heading or figure get a double gap under the header

## Problem

Since the Glasgow Civic redesign (PR #19), `<main>` is a CSS grid (`.page-grid` in `app/globals.css`) and post blocks are its direct children. The post header carries the gap below it as `margin-bottom`, and the first block after it is meant to add no top margin. Posts that opened with an `h2` (`the-basic-boss-formula`) or a non-hero `<Figure>` (`ralph-isnt-the-point`) added their own top margin on top, so the gap nearly doubled.

## Symptoms

- At 1440px the gap under the header was about 104px on most posts and roughly 190px on those two.
- Nothing failed: build, tests, `validate-posts`, axe-core and the overflow sweep were all green. A code review caught it by reading the cascade.

## What Didn't Work

- **A zero-specificity "skip the first block" rule.** The rhythm rule `.page-grid > :where(:not(script, .post-head, .hero-fig) + *)` gives every block 1.1em of top margin except the first after the header. Wrapping the condition in `:where()` keeps it overridable, which is the point. It also means it can't *remove* margin that a more specific rule adds. `.page-grid > .prose-h2 { margin-top: 2.7em }` and `.page-grid > :is(..., .prose-figure, ...) { margin-top: 1.6em }` are (0,2,0) and win, so the first block got its normal top margin anyway.
- **Expecting margins to collapse.** Grid items' margins never collapse (flex is the same), so the header's `margin-bottom` and the block's `margin-top` add together. In normal flow the larger one would have won and nobody would have noticed.

## Solution

Add an explicit reset that outranks every block rule. It goes after the block-rhythm rules in `@layer components` in `app/globals.css`:

```css
/* The first block after the header, a hero or a script never adds its own top
   margin: the header and hero already carry the gap (DESIGN.md 4.3). A hero
   keeps its own top margin. Higher specificity than the block rules above. */
.page-grid > :is(script, .post-head, .hero-fig) + :not(.hero-fig, script) {
  margin-top: 0;
}
```

Specificity is (0,3,0): `.page-grid`, plus the highest class inside `:is()`, plus the class inside `:not()`. That beats every (0,2,0) block rule regardless of order. `.hero-fig` is excluded so a hero that follows the header keeps its own top margin. `script` is excluded because `PostSchema` and `FAQJsonLd` render `<script>` siblings at the top of every post.

The same review found that a hero image which fails to load (hidden via `.hero-fig:has(.is-empty) { display: none }`) took the spacing with it, because the block after it is "first after a hero". Two more rules restore it. `:has()` can't be nested inside another `:has()`, so these key off the hidden hero itself:

```css
.page-grid > .hero-fig:has(.is-empty) + * { margin-top: 1.1em; }
.page-grid > :is(.post-head, .post-head + script, .post-head + script + script) + .hero-fig:has(.is-empty) + * {
  margin-top: clamp(64px, 7vw, 104px);
}
```

After the fix, every post measured 101px from the header to its first block at 1440px, whatever that block is. A blocked hero image leaves the normal 1.1em paragraph gap.

## Why This Works

The gap under the header has exactly one owner: the header's (or hero's) bottom margin. The first block must contribute nothing. Because grid margins add rather than collapse, "nothing" has to be enforced, and enforcing it means winning the cascade against every component's own top margin. A low-specificity "default" rule can set margins; it can't be relied on to cancel them.

## Prevention

- When adding a component with its own `margin-top` rule under `.page-grid`, keep that rule at (0,2,0) or below, or the first-block reset stops covering it. If it must be stronger, extend the reset.
- Never put a `<script>` or other invisible element mid-post as a grid child without checking the rhythm rules; they treat `script` as "nothing came before".
- Check the gap on a post that opens with something other than a paragraph. Measure it rather than trusting the screenshot:

  ```js
  // Playwright: header-to-first-block gap
  const h = document.querySelector('.post-head');
  let n = h.nextElementSibling;
  while (n && n.tagName === 'SCRIPT') n = n.nextElementSibling;
  n.getBoundingClientRect().top - h.getBoundingClientRect().bottom; // ~101 at 1440px
  ```

## Related Issues

- `docs/solutions/ui-bugs/mdx-component-p-wrapper-invalid-nesting.md`: the other MDX rendering trap from the editorial redesign. Both pass every automated gate and show only in the rendered page.
- Plan KTD4 (the breakout grid) in `docs/plans/2026-10-02-001-feat-glasgow-civic-redesign-plan.md`.
