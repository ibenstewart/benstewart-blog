---
title: Glasgow Civic design system
status: approved by Ben, 2 October 2026
scope: homepage, post page, site chrome (masthead and footer). Light theme only.
plan: docs/plans/2026-10-02-001-feat-glasgow-civic-redesign-plan.md
---

# Glasgow Civic design system

The visual system for benstewart.ai. It takes the restraint of the 2026 america.gov redesign (a white page, very little on it, one accent colour, huge whitespace, pill-shaped controls) and roots it in Glasgow: sandstone and Saltire blue, wayfinding-style numerals and labels, a sturdy grotesk. Think of the signage and print of a well-made modern Scottish museum or library.

**This folder**

| File | What it is |
|---|---|
| `DESIGN.md` | This spec. Tokens, type, layout and every component, with the values to use. |
| `reference/home.html` | Approved homepage prototype. Open it in a browser. Its `<style>` block is the source of truth for any value this spec doesn't state. |
| `reference/post.html` | Approved post page prototype, built from the real `multi-agent-ai-strategy` post. Loads the hero image from `public/images/posts/` when opened from inside the repo. |
| `reference/screens/*.jpg` | Screenshots of both prototypes at 1440px and 390px, for agents that can view images. |

Where this spec and the prototype CSS disagree, this spec wins (it includes fixes made after review). Where the spec is silent, copy the prototype.

---

## 1. Principles

1. **Restraint first.** Every element earns its place. When in doubt, remove it or make it quieter.
2. **One accent, one job.** Saltire blue means "go": links, buttons, numerals, arrows. Red sandstone means place and time and is used for the word "Glasgow" only. Blond sandstone is a surface, used for at most one large shape per page plus the TL;DR and code grounds.
3. **The grotesk carries the voice. The serif is the aside.** Schibsted Grotesk sets everything: headings, body, UI. Source Serif 4 appears **only in italic**, for standfirsts, excerpts, captions and dialogue. Never set the serif upright.
4. **Wayfinding, not decoration.** Numbers, arrows, labels and rules help people find their way. There are no ornaments, gradients, shadows or icons for their own sake.
5. **Whitespace is the luxury.** Big gaps between sections (`--section`, 112px to 192px) and a calm 640px reading column.

## 2. Hard rules

- **Light theme only.** No dark mode, no `prefers-color-scheme` rules, no `data-theme` switch, no image dimming. Set `color-scheme: light`.
- **No pure black or pure white text on paper.** Use the tokens. White is only for text on the blue pill.
- **No new copy.** Use existing text from the MDX and post metadata. The full allow-list:
  - Visible labels: "Start here", "Archive", "Keep reading", "Newer", "Older", "Copy", "Copied", "TL;DR" and "posts" (breadcrumb).
  - Generated strings: "Undated", "N more posts, YYYY to YYYY" ("1 more post"; "YYYY" alone if there's only one year), "N min read" and "N min".
  - Accessible names: "Code sample", "Primary", "Footer" and "Post navigation".

  Sentence case. **No em dashes anywhere in UI strings.** UK English.
- **No Skyscanner colours, no US government cues** (flags, stars, eagles, "official website" banners), **no Scottish kitsch** (tartan, thistles, Mackintosh pastiche). The sandstone arch is the only Scottish cue on a page.
- **Accessibility is not optional:** WCAG 2.2 AA contrast, visible focus on everything interactive, semantic landmarks, one `h1` per page.

---

## 3. Tokens

### 3.1 Colour

Keep the existing token names in `app/globals.css` where a role already exists, so Tailwind utilities like `text-ink`, `bg-paper` and `border-hair` keep working. Add the new ones.

| Token (CSS var / Tailwind colour) | Hex | Role | Contrast on paper |
|---|---|---|---|
| `--paper` / `paper` | `#FDFCFA` | Page background. Bright near-white. | |
| `--raise` / `raise` | `#F6F1E7` | Pale blond. Code block and inline code ground, quiet panels. (Prototype name: `--blond-pale`.) | |
| `--ink` / `ink` | `#1C2731` | Slate ink. Headings, titles, strong text, wordmark. | 14.8:1 |
| `--muted` / `muted` | `#4E5964` | Slate grey. **Body copy** (prose paragraphs and intro text are grey, not ink). (Prototype: `--body`.) | 6.97:1 |
| `--faint` / `faint` | `#5E6873` | Metadata: dates, reading times, small labels. (Prototype: `--meta`.) | 5.53:1 |
| `--hair` / `hair` | `#DDD7CC` | Warm hairline for rules and outlined pills. (Prototype: `--rule`.) | |
| `--accent` / `accent` | `#004A93` | Saltire blue, deepened. The one strong accent. (Prototype: `--saltire`.) | 8.53:1 |
| `--accent-deep` / `accent-deep` | `#003A75` | Hover and pressed state for blue fills. | 11.0:1 |
| `--blond` / `blond` | `#EDE3D1` | Blond sandstone. The arch, the TL;DR panel. | |
| `--blond-line` / `blond-line` | `#E4D8C2` | Border on pale blond surfaces (code). | |
| `--red` / `red` | `#9C4A33` | Red sandstone. The word "Glasgow" and its dot. Nothing else. | 5.95:1 |

Contrast notes (all measured):

- On `blond`: ink 11.9, muted 5.6, accent 6.9, red 4.8. **`faint` on `blond` is 4.46:1 and fails AA**, so never put metadata grey on the blond arch or TL;DR panel. Use `ink` or `muted` there.
- On `raise` (code ground): ink 13.5, muted 6.4, faint 5.0, accent 7.8.
- White on `accent`: 8.75:1.

**Syntax highlighting** (sugar-high `--sh-*` variables, light only). Each value is at least 5:1 on `raise`:

| Variable | Value | Contrast on raise |
|---|---|---|
| `--sh-identifier` | `var(--ink)` | 13.5 |
| `--sh-keyword` | `#004A93` | 7.8 |
| `--sh-string` | `#2E6B39` | 5.7 |
| `--sh-class` | `#8A3F2B` | 6.6 |
| `--sh-jsxliterals` | `#8A3F2B` | 6.6 |
| `--sh-property` | `#1D5E6E` | 6.5 |
| `--sh-entity` | `#7A5200` | 6.2 |
| `--sh-sign` | `var(--faint)` | 5.0 |
| `--sh-comment` | `var(--faint)` | 5.0 |

### 3.2 Typefaces

All three are on Google Fonts and load through `next/font/google` (confirmed present in the repo's Next.js font data).

| Role | Family | Load | Tailwind |
|---|---|---|---|
| Everything (headings, body, UI) | Schibsted Grotesk | `weight: 'variable'`, `style: ['normal', 'italic']` | `font-sans` |
| Asides, italic only | Source Serif 4 | `weight: '400'`, `style: ['italic']` | `font-serif` |
| Code | IBM Plex Mono | `weight: '400'`, `style: ['normal']` | `font-mono` |

Fallback stacks: grotesk `"Helvetica Neue", Arial, system-ui, sans-serif`; serif `Georgia, "Times New Roman", serif`; mono `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.

Weights in use: **400** (body), **500** (titles in lists and cards, UI, meta), **700** (display and section headings, wordmark, numerals). Snap any existing arbitrary weights (`font-[430]`, `font-[560]`, `font-[620]`) to 400, 500 or 700.

Because Source Serif is loaded italic only, **any element that keeps `font-serif` must also be `italic`**. Otherwise the browser picks the italic face anyway and the result looks accidental. Elements that are serif today and are not in the "aside" list below become `font-sans`.

Serif italic is allowed for: post standfirst (subtitle), excerpts in lists and cards, figure captions, `Scenario` dialogue, markdown `blockquote`. Everything else is grotesk.

### 3.3 Type scale

Desktop value, then mobile (at 760px and below) where it differs. `clamp()` values are fluid between the two.

| Use | Size / leading / tracking / weight | Colour |
|---|---|---|
| Homepage name (h1) | `clamp(5.25rem, 9.5vw, 8.5rem)` / 0.92 / -0.04em / 700. Mobile `clamp(3.75rem, 22vw, 6.25rem)`, "Ben" and "Stewart" stacked on two lines. | ink |
| Homepage section heading (h2) | `clamp(2.5rem, 4.2vw, 3.75rem)` / 0.98 / -0.04em / 700 | ink |
| Post title (h1) | `clamp(2.375rem, 5.3vw, 4.75rem)` / 1.02 / -0.035em / 700, `max-width: 15em`, centred, `text-wrap: balance` | ink |
| Post standfirst | serif italic `clamp(1.25rem, 1.85vw, 1.625rem)` / 1.4 / 400, `max-width: 31em`, centred | muted |
| Homepage intro paragraphs | `clamp(1.1875rem, 1.75vw, 1.5rem)` / 1.5 / -0.005em / 400 | muted |
| Prose paragraph | `1.1875rem` (19px) / 1.62 / -0.003em / 400. Mobile `1.125rem` / 1.6 | muted |
| Prose h2 | `clamp(1.625rem, 2.2vw, 2rem)` / 1.15 / -0.025em / 700. Mobile `1.5rem`. `margin-top: 2.7em` (mobile 2.4em), next sibling `0.8em` | ink |
| Prose h3 | `1.25rem` / 1.3 / -0.012em / 700, `margin-top: 2em` | ink |
| Pull quote | `clamp(1.375rem, 2vw, 1.625rem)` / 1.38 / -0.015em / 500. Mobile `1.3125rem` | ink |
| List and card title | `clamp(1.375rem, 2vw, 1.75rem)` / 1.15 / -0.02em / 500 | ink, accent on hover |
| Excerpt | serif italic `1.1875rem` / 1.4. Mobile `1.0625rem` | muted |
| Meta (dates, reading time) | `0.9375rem` / 500 / +0.005em, `tabular-nums`. Sentence case, **not** uppercase | faint |
| Wordmark | `1.375rem` / 1 / -0.03em / 700. Mobile `1.1875rem`, at 380px and below `1.125rem` | ink |
| Base body (non-prose UI) | `1.0625rem` / 1.5. Mobile `1rem` | ink |

Numerals in dates, reading times, step numbers and years always use `font-variant-numeric: tabular-nums`.

### 3.4 Space, layout and breakpoints

```css
--gutter:  clamp(20px, 4.45vw, 64px);   /* page side padding */
--section: clamp(112px, 13vw, 192px);   /* gap between major sections */
--measure: 640px;                        /* reading column, about 70 characters at 19px */
--hang:    24px;                         /* gap between hanging marks and the text column */
/* container: max-width calc(1312px + 2 * var(--gutter)), centred, padding-inline var(--gutter) */
```

- **Homepage grid:** 12 columns, 24px column gap, inside the container.
- **Post page columns** (see the plan's breakout grid): `content` is 640px; `wide` is about 960px (hero image, TL;DR panel); `full` is the container (title block, Keep reading, pager).
- **Breakpoints:** 1080px (tablet layout changes), 960px (cards stack, hanging marks move inside the column), 760px (mobile), 380px (tightest header).
  - They are **inclusive** (`max-width: 960px` includes 960). Tailwind v4's `max-[960px]:` is exclusive, so the plan defines custom variants `tab`, `cards`, `mob` and `tight` instead (plan KTD14).
- **Minimum width:** keep `html { min-width: 360px }`. Zero horizontal page scroll at 360px.

### 3.5 Shape, rules, focus, motion

- **Pills** are fully rounded (`border-radius: 999px`).
- **Radii:** code block 18px (14px mobile); TL;DR panel 28px (22px mobile); Callout 20px; inline code 6px; default figure 16px.
- **The arch:**
  - Homepage arch: `border-radius: 999px 999px 0 0` (a full semicircle top).
  - Post hero image frame: `border-radius: clamp(32px, 9vw, 128px) clamp(32px, 9vw, 128px) 0 0` (a gentler arch, so the illustration's corners aren't cut away).
- **Rules:**
  - 1px `hair` for separators.
  - 2px `ink` for the top of cards and the bottom of archive year headings. This is the "directory board" rule.
- **Focus:**
  - Default: `outline: 3px solid var(--accent); outline-offset: 3px; border-radius: 4px`.
  - Inside the blue nav pill: `outline: 2px solid #fff; outline-offset: -6px`.
  - Whole-card links: put the ring on a `::after` overlay with `outline-offset: 4px; border-radius: 6px`.
- **Selection:** `background: var(--accent); color: #fff`.
- **Motion:** none beyond colour transitions. Respect `prefers-reduced-motion`.

---

## 4. Components

Selectors in brackets point at the prototype CSS for exact values.

### 4.1 Site chrome (every page)

**Masthead** (`home.html .site-head, .wordmark, .nav-pill`)

- **Wordmark:** "Ben Stewart" on the left, linking to `/`.
- **Nav:** on the right, one **blue nav pill** holding `posts`, `bio`, `speaking` in that order, lowercase.
  - Container: 6px padding, `accent` background, radius 999px, 2px gap between links.
  - Links: 44px tall, `0 20px` padding, white, weight 500, `1.0625rem`.
  - Hover: `accent-deep` fill plus an underline.
  - Mobile: 4px container padding, 38px links, `0 12px` padding.
  - 380px and below: `0 10px` padding, `0.9375rem` text.
  - It must stay on one row at 360px.
- **Spacing and rules:** `padding-top: 32px` (mobile 20px). No bottom border.

**Footer** (`.site-foot, .foot-inner, .foot-id`)

- **Layout:** `margin-top: var(--section)`, a 1px `hair` top rule, then 40px of padding.
- **Left side:**
  - The wordmark.
  - Under it, a meta line "Glasgow" in `red`.
- **Right side:** outlined pills for `posts`, `rss`, `github`, `x`, `linkedin`, `contact`, lowercase, with external links opening in a new tab as they do today.
  - Pills: 44px tall, `0 20px` padding, 1px `hair` border, ink text, weight 500, `1rem`.
  - Hover: `accent` border and text.
  - Mobile: the pills wrap below the wordmark, 40px tall.

**Skip link:** an ink pill with white text. It is off-screen until focused, then it appears at the top left.

**Buttons**

- **Primary pill** ("View all posts"): 56px tall (mobile 44px), `0 28px` padding, `accent` fill, white weight 500 `1.125rem` text, a 20px right-arrow icon, `accent-deep` on hover.
- **Outlined pill** (breadcrumb, footer links, Copy): 1px `hair` border, ink text, `accent` border and text on hover.

**Arrow icon:** a simple 2px-stroke right arrow drawn as inline SVG (copy it from the prototype). To point left, flip it with `scaleX(-1)`. To point down on mobile, rotate it 90deg.

### 4.2 Homepage (`reference/home.html`)

The sections run top to bottom: hero, Start here, Some of my favourite writing, Archive.

**Hero** (`.hero, .intro, .caption, .intro-body`)

- `padding-top: clamp(88px, 14vw, 208px)`.
- **h1 "Ben Stewart":** at the homepage name scale, left-aligned, `margin-left: -0.045em` so the B stem aligns optically.
  - **Kerning fix (required):** wrap the "r" of "Stewart" as `Stewa<span class="k">r</span>t` with `letter-spacing: 0` on `.k`. Otherwise the r and t collide at -0.04em.
  - Mobile: wrap the words as `<span>Ben</span> <span>Stewa…</span>` and set `display: block` on the direct-child spans only (`h1 > span`), so they stack.
- **Intro row:** a 12-column grid, `margin-top: clamp(48px, 5.6vw, 80px)`.
  - Columns 1 to 3 (1 to 4 at tablet): the **caption**. "Engineer turned leader of humans and robots." in 500 `1.25rem` ink, then "Glasgow" in `red` with a 9px red dot before it.
  - **Portrait** (added after the prototype): a 4:5 head-and-shoulders photo above the caption, 184px wide, 20px radius, 28px below it. Mobile: 104px wide, 14px radius, beside the caption with their bottoms aligned and an 18px gap.
  - Columns 5 to 11 (5 to 12 at tablet), max 40rem: the three existing intro paragraphs at intro scale in `muted`. Their links are ink with a **2px `accent` underline**, `text-underline-offset: 0.22em`, and turn `accent` on hover.
  - Mobile: the caption (with the portrait) stacks above the paragraphs.

**Start here** (`.start, .arch, .start-list, .num`)

- `margin-top: var(--section)`. A 12-column grid.
- **Arch:** columns 1 to 4 (1 to 5 at tablet).
  - `blond` fill, semicircle top, `min-height: 540px`, 40px padding, content pinned to the bottom.
  - Content: a 44px blue arrow, the h2 "Start here", and the existing line "Three posts that introduce what this blog is about." in ink.
  - Mobile: `aspect-ratio: 1 / 1.04`, 28px padding, and the arrow rotates to point down.
- **Numbered list:** columns 6 to 12, aligned to the bottom of the arch.
  - Each row is a 96px numeral column (64px at tablet, 52px on mobile) plus content, with a 1px `hair` top rule and a bottom rule on the last row.
  - Numeral: 700 `4rem` `accent`, tabular (mobile `2.75rem`).
  - Content: title (list title scale), excerpt (the post's `subtitle`), and meta ("29 December 2024 · 3 min read").
  - The whole row is one link (`::after` overlay). The title turns `accent` on hover.

**Some of my favourite writing** (`.faves, .cards`)

- An h2, then three cards in a row with a 24px gap. They stack to one column at 960px and below.
- Each card:
  - A **2px ink top rule** and 24px top padding.
  - Title, excerpt, and meta.
  - Use `grid-template-rows: subgrid` so titles, excerpts and meta line up across the row. Graceful degradation is fine.
  - There are no arrows on cards; the whole card is the link.
- Under the cards, the primary pill **"View all posts"** linking to `/posts`.

**Archive** (`.archive, .directory, .year`)

- A header row: the h2 "Archive" on the left, and a meta line on the right, "**N more posts, YYYY to YYYY**".
  - The line is computed from the posts actually listed: their count, then the earliest and latest year.
- **Directory board:** every post **not already featured** in Start here or the favourites, grouped by year, newest year first.
  - Year heading: 700 `1.75rem` ink, with a **2px ink bottom rule** and 14px padding below it.
  - Each entry: the title (500 `1.0625rem`) and the reading time on the right ("7 min"), separated by 1px `hair` rules. The whole row is a link.
  - **Desktop:** a 3-column grid with a 48px column gap and a 72px row gap. A year with **more than 6 posts** spans 2 grid columns and flows its entries into 2 CSS columns (`columns: 2`).
  - **Tablet (1080px and below):** one year per row, with each year's entries in 2 CSS columns.
  - **Mobile:** a single column.
  - Posts with no date go in a final group headed "Undated". This shouldn't happen today.
- Note that 11 posts share the Substack import date 2023-09-18. They will all appear under 2023. That is expected.

### 4.3 Post page (`reference/post.html`)

**Post header** (`.post-head, .crumb, .standfirst`)

- Centred, `padding-top: clamp(64px, 7.5vw, 108px)` (mobile 64px).
- **Breadcrumb:** an outlined pill, 40px tall, with a left-pointing blue arrow and the label "posts", linking to `/posts`.
- **h1:** the display title (the `PostHeader` `title` prop), 36px below the breadcrumb (mobile 28px).
- **Standfirst:** the post's `subtitle`, 28px below the title (mobile 20px).
- **Meta line:** "20 February 2026 · 9 min read", 24px below, at `1rem` 500 in `faint`. It replaces today's uppercase, tracked kicker.

**Hero figure** (`.hero-fig, .frame`)

- Used when a post's `Figure` has the new `hero` prop.
- Width up to 960px (the `wide` column), `margin-top: clamp(48px, 4.5vw, 64px)`.
- The image shows at its **natural aspect ratio, never cropped** (`width: 100%; height: auto`), inside the gentle arched frame (`overflow: hidden`).
- No border and no visible caption. The alt text is still required.
- If the image fails to load, hide the whole figure rather than showing an empty frame.
- The pilot image (`thinking-engine-0.png`) is 1536 × 1024 (3:2).

**Reading column** (`.prose`)

- 640px measure. Starts `clamp(64px, 7vw, 104px)` below the header or hero.
- Paragraphs at prose scale in `muted`. Blocks are spaced `1.1em` apart. Use `text-wrap: pretty` on paragraphs and list items.
- `strong`: ink, 700.
- `em`: grotesk italic. **Not** the serif.
- **Links:** ink text, `text-decoration: underline 2px var(--accent)`, `text-underline-offset: 0.22em`, `accent` text on hover, focus `outline-offset: 1px`. This replaces `textLinkClass`.

**Lists** (`.prose ol, .prose ul`)

- **Numbered lists:** the numerals **hang in the left margin**. They are blue, 700 and tabular, positioned `right: calc(100% + var(--hang))`, with 0.85em between items. At 960px and below the numerals move inside the column (32px left padding).
- **Bulleted lists:** 7px `faint` dots, 28px text indent, 0.35em between items. Nested bullet lists inside a numbered item start 0.6em below the item's first line.
- Add `role="list"` to `ol` and `ul`, because `list-style: none` removes list semantics in Safari.

**PullQuote** (`.prose blockquote` in the prototype; the post's two quotes are `PullQuote`s in the MDX)

- Pull quote scale in ink, left-aligned in the column.
- A **4px `accent` bar with rounded ends** hangs in the margin, `right: calc(100% + var(--hang) - 2px)`, inset 0.3em top and bottom.
- At 960px and below the bar moves inside the column (24px left padding).
- `margin-top: 1.7em`, and the next block starts 1.5em below.
- If `author` is set, show it underneath as a meta line.
- No quote-mark glyphs. No centring. No rules above or below.

**Markdown `blockquote`:** a quieter cousin. Serif italic `1.25rem` / 1.55 in `muted`, with a 3px `hair` bar in the same hanging position.

**KeyPoint:** the "ruled row".

- A 2px ink top rule, 20px top padding, then grotesk 500 `1.3125rem` / 1.4 in ink. No box, no fill.
- It must wrap its children in a `div`, never a `p` (see `docs/solutions/ui-bugs/mdx-component-p-wrapper-invalid-nesting.md`).

**Callout:** a quiet outlined panel.

- 1px `hair` border, 20px radius, `28px 32px` padding (mobile `24px 22px`), paper background.
- A small label first: grotesk 700 `0.8125rem`, uppercase, `letter-spacing: 0.08em`.
- Label colour by type: `insight` and `tip` in `accent`, `warning` ("Worth knowing") in `red`, `story` in `faint`.
- The body inherits prose styles. Keep the four existing labels.

**TLDR** (`.tldr`)

- A `blond` panel, 28px radius (mobile 22px), `40px 48px 44px` padding (mobile `32px 26px 34px`), max-width `calc(640px + 96px)`, centred, 72px above it (mobile 56px).
- Heading "TL;DR": 700 `1.375rem` ink.
- Body: ink `1.125rem` / 1.6, links styled as prose links.
- Never use `faint` text inside it.

**Scenario:** the speaker as a meta-style label (500 `0.9375rem` `faint`). Below it, the dialogue in serif italic `1.25rem` `muted`, with 24px left padding.

**Collapsible:** the summary in grotesk 500 ink, with a small blue chevron that rotates 90deg when open. The content inherits prose styles.

**`hr` and `Divider`:** a 1px `hair` rule across the content column, with `margin: 2.6em 0`. The `space` variant stays as empty space. The `dots`, `line` and `wave` variants all render as the `hr` rule.

**Table:** grotesk `0.9375rem` in ink, 1px `hair` cell borders, 700 headers, and horizontal scroll inside its own box on narrow screens.

**Lede** (opt-in drop cap): the first letter in grotesk 700 at about `4.3rem` in ink, floated left, matching the existing `.lede > p::first-letter` rule. Keep the `div` wrapper.

**Figure (default) and markdown `img`:**

- No border, 16px radius, max-width 640px unless `width` is set.
- Caption: serif italic `0.9375rem` in `muted`, centred, 12px below. A credit, if any, follows in grotesk meta style after a " · ".

**Italic-only paragraphs** (a whole paragraph wrapped in `*…*`) stay grotesk italic in `muted`. The prototype's serif `.coda` treatment for the pilot's closing line is **not** part of the system.

**Bold lead-in paragraphs** render as normal paragraphs with a bold start. The prototype's ruled `.leadins` rows were a one-off for the pilot and are **not** part of the system.

**Inline code:** IBM Plex Mono `0.84em`, `raise` background, 1px `blond-line` border, 6px radius, `0.08em 0.36em` padding, ink. Never syntax-highlighted.

**Code block** (`.code, .copy`)

- `raise` background, 1px `blond-line` border, 18px radius.
- Text: Plex Mono `0.875rem` / 1.62 (mobile `0.8125rem`), `32px 36px 36px` padding (mobile `24px 22px 26px`).
- **Highlighting:** fences with a language (` ```ts `) are syntax-highlighted with the palette in 3.1. Fences without a language (prompts, prose, plain text) render in plain ink, as in the prototype.
- At desktop it **bleeds 40px past the column on each side** (`margin-inline: -40px`). At 960px and below there's no bleed and the side padding is 30px.
- Long lines **scroll inside the block** (`overflow-x: auto`). The page itself never scrolls sideways. The scrollbar stays visible; the current CSS hides it, so remove that.
- **Copy button:** an outlined pill (34px tall, paper fill), 14px from the top right.
  - It is a client component and hidden until JavaScript runs, so the page works without JS.
  - It copies the exact text of the block, then shows "Copied" for 2 seconds.
  - A visually hidden `role="status"` element announces "Copied" to screen readers.
  - At 960px and below the block gets `padding-top: 60px`, so the button never covers code.
- The `pre` gets `role="region"` and an `aria-label`, for example "Code sample", and is keyboard focusable (`tabIndex={0}`) so it can be scrolled with the keyboard.

**Keep reading** (`.keep, .cards`)

- Rendered by `PostNav` when `related` slugs exist. It sits in the `full` column, `margin-top: var(--section)`.
- The h2 "Keep reading": 700 `clamp(2rem, 3vw, 2.75rem)`.
- Then the related posts as **homepage favourite cards**, with title, excerpt (`subtitle`) and meta.

**Pager** (`.pager`)

- Two halves, 96px below the cards (mobile 72px).
- The **left half is "Newer"**, with a left arrow. The **right half is "Older"**, right-aligned, with a right arrow.
- Each half has a 1px `hair` rule above and below it.
- Direction label: 500 `0.9375rem` `accent`. Title: 500 `1.375rem` ink, turning `accent` on hover.
- Mobile: the halves stack and both align left.

### 4.4 Not designed here: inherit only

The `/posts` listing (`PostList`), `/bio` (`Timeline`, `Event`), `/speaking`, the 404 page and the `ai-made-writing-free` client components get **no bespoke layout in this pass**. They take on the new tokens and fonts automatically. The plan's U5 does a mechanical sweep, so nothing on them looks broken: serif to sans, weights snapped, widths sane.

---

## 5. Accessibility checklist

- One `h1` per page. Headings in order. The `header`, `nav`, `main` and `footer` landmarks are present.
  - There's no `article` wrapper in this pass: post blocks sit directly in `<main>` (plan KTD4). Revisit this with the posts-layout follow-up.
- Contrast as listed in 3.1. There is no `faint` text on `blond`.
- Every link and button has a visible focus state. Whole-card links show the ring around the card.
- The skip link works.
- Lists keep their semantics (`role="list"`).
- Decorative SVG arrows are `aria-hidden="true"`.
- The Copy button announces through a live region.
- axe-core reports 0 violations at 1440px and 390px on `/` and `/posts/multi-agent-ai-strategy`.
