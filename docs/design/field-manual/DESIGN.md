---
title: Field manual design system
status: picked by Ben, 9 November 2026 (concept in PR #32); replaces Glasgow Civic
scope: every page. Light theme only.
plan: https://claude.ai/artifact/H2UesJnYbma1pTWR2tFPtP (rollout plan)
---

# Field manual design system

benstewart.ai is a field manual for leading engineering teams through AI. Every post is a numbered **entry** filed in a **chapter**; readers come in by the problem in front of them (a **situation**) rather than by date, and leave with a **tool**. The look is a well-used manual: paper, ink, one strong blue, a highlighter for the line to read first, mono labels like a spec sheet.

Where this spec and the code disagree on a value, the code wins; fix this file. The code is `app/globals.css` (tokens and component CSS), `app/components/manual/` and `app/components/home/` (the manual's parts) and `mdx-components.tsx` (post blocks).

---

## 1. Principles

1. **The problem first, the date second.** The home page opens on situations, not on the newest post. Dates live on `/posts` for people who want them.
2. **Numbers are wayfinding.** Entry numbers (`4.8`), section numbers (`4.8.2`), chapter numbers and talk numbers tell you where you are. They are computed, never typed.
3. **Ink does the work, blue means go, yellow means read this.** Ink for text and rules, blue for links, buttons and anything that takes you somewhere, the highlighter for one line per page (the standfirst) and Key points.
4. **Labels are small, mono and quiet.** Uppercase by CSS, sentence case in the markup.
5. **The reading column never moves.** Motion is for controls and drawings, never for prose.

## 2. Hard rules

- **Light theme only.** No dark mode, no `prefers-color-scheme` rules, no theme toggle. `color-scheme: light`.
- **Plain numbers, never §.**
- **No one else's artwork.** The footer glen is drawn in code (`scripts/footer-art/draw-glen.py`); the voxel head is built from Ben's own photo (`scripts/voxel-head/build-head.py`).
- **UK English, sentence case, no em dashes in UI strings.**
- **WCAG 2.2 AA everywhere** (section 7).

---

## 3. Tokens

### 3.1 Colour (`:root` in `app/globals.css`, exposed to Tailwind via `@theme`)

| Token | Value | Use |
|---|---|---|
| `paper` | `#F6F5F0` | Page background |
| `card` | `#FFFFFF` | Cards, Callout, the author card |
| `raise` | `#EEECE5` | Code grounds, quiet fills |
| `ink` | `#0E0F12` | Headings, rules, dark panels (TL;DR, badges) |
| `muted` | `#2B2E34` | Prose body |
| `faint` | `#5C5F66` | Secondary text and labels (5.9:1 on paper) |
| `hair` | `#DAD9D3` | 1px separators |
| `accent` | `#003593` | Links' underline, buttons, the reading-order panel, the footer sky |
| `accent-deep` | `#00266B` | Pressed blue |
| `hi` | `#FFD84A` | Highlighter, Key point, text on ink badges |
| `blond`, `blond-line` | `#FFF1BF`, `#E9E1C4` | Legacy warm surface; never put `faint` on it |
| `red` | `#A63A22` | Warning callouts |

**Theme colours** (`lib/manual-data.mjs` THEMES) are for bars and dots only, never text. Each is at least 3:1 on paper: people `#2F5BD3`, words `#C8442B`, breaks `#A86A00`, ai `#1C7A62`, self `#7E45B5`.

### 3.2 Type

- **Schibsted Grotesk** for everything people read: 400, 500 and 700 only.
- **IBM Plex Mono** (400, 500, 700, preloaded) for labels, numbers and badges.
- No serif. Source Serif was dropped with Glasgow Civic.
- Display titles are 700 with tight tracking (`-0.045em`) and `leading-[0.92]`; page h1s run `clamp(2.75rem, 6.6vw, 6rem)`, section h2s `clamp(2.25rem, 4.4vw, 4rem)`.
- Prose body is 19px `muted`, headings and `strong` are `ink`.
- `.label`: mono, 13px, `letter-spacing: 0.1em`, `text-transform: uppercase`. Write the text in sentence case.
- `.hl`: the highlighter, a yellow band behind the lower 40% of the line that clones across line breaks.

### 3.3 Layout and breakpoints

- `<main>` is the `.page-grid` breakout grid: post blocks sit in the 640px `content` column, `.col-wide` (about 960px) and `.col-full` opt out.
- **`.col-bleed`** runs a section edge to edge (the entry header, the end of an entry, every home and page section). Inside it, content sits in a `max-w-[1180px]` box with `px-[var(--gutter)]`.
- A page that starts with a `.col-bleed` gets no top padding; one that ends with a `.col-bleed` gets no bottom padding (the footer brings its own rule).
- Breakpoints are the inclusive custom variants: `tab` (1080px), `cards` (960px), `mob` (760px), `tight` (380px). Never `sm`/`md`/`lg` or `max-[...]`.

### 3.4 Shape and rules

- Rules: 2px `ink` between sections and around cards; 1px `hair` between rows.
- Radii: cards 24px (`rounded-3xl`), buttons 12px (`rounded-xl`), chips full, entry badge 16px.
- Focus: 3px `accent` outline; on `.surface-dark` (ink or blue grounds) it turns `hi`.

---

## 4. The manual's structure

All copy lives in `lib/manual-data.mjs`; `lib/manual.ts` types it and works things out.

- **Themes and chapters.** Each post's metadata carries `themes: [...]` (one to five of `people`, `words`, `breaks`, `ai`, `self`) and a `quote`. The first theme is its chapter.
- **Entry numbers** are `chapter.position`, with position by date inside the chapter (title breaks ties; drafts sort last). New posts land at the end, so numbers don't move. `lib/__snapshots__/manual.test.ts.snap` prints every number, so a renumbering shows up in review.
- **Section numbers** come from CSS: `PostHeader` sets `--entry` on `#main` and `.prose-h2::before` prints `var(--entry).counter`.
- **Situations** are reading orders: a label, then three `[slug, why]` steps. The first, "I'm new here", is the default on the home page and the 404.
- **Tools** are six named ideas, each from one post, with a drawing in `ToolArt`.
- `npm run validate-posts` fails a post with missing or unknown themes, and any situation or tool that points at a missing or draft post.

---

## 5. Components

### 5.1 Chrome (every page, `app/layout.tsx`)

- **TopBar** (`app/components/chrome/`): "Ben Stewart" with the ink FIELD MANUAL pill, and mono links: situations and toolkit (hidden on mobile), chapters, all entries, speaking, bio. The current link gets `aria-current="page"` and a blue underline.
- **SiteFooter**: the glen (`SceneFooter`, `public/images/footer/glen.jpg`) under a blue sky, the name, "Glasgow · N entries filed", and outlined link chips.

### 5.2 Home (`app/page.tsx`)

1. **Situations** (`home/Situations.tsx`): the h1 "What are you dealing with today?", the intro, a list of situation buttons (`aria-pressed`), and the blue reading-order panel; a polite live region announces a change; a minutes slider picks entries that fit. `?situation=<id>` preselects one.
2. **Toolkit** (`home/Toolkit.tsx`): six flip cards. The hidden face is `inert`, the flip button has `aria-expanded`, focus moves to the newly shown face.
3. **Chapters** (`home/Chapters.tsx`): five chapter cards with a progress bar each, a tick per entry (24px, 44px hit area on touch), and a "read N of M" bar.

### 5.3 Entry (`/posts/[slug]`)

- **PostHeader**: chapter breadcrumb with its theme dot, ink number badge in `hi`, title, standfirst under `.hl`, a label meta row (draft, minutes, filed date or "From the Substack archive", words, Mark as read), and "Use this when" chips linking to `/?situation=<id>`.
- **Contents rail** (`manual/Contents.tsx`): fixed in the left margin above 1240px, after the header scrolls away; hides at the entry's end and when a wide block is on screen; `aria-current="location"` on the active section.
- **Post blocks** (`mdx-components.tsx`): Callout (2px ink, white, coloured label), Key point (yellow panel), PullQuote (big ink line over a 2px rule), Scenario (chat bubbles, "Me" in blue on the right), TL;DR (ink panel labelled "In short"), lists (ink numeral tiles, yellow-square bullets), blockquote (blue bar).
- **PostNav**: Finished? with Mark as read, the tool card for the entry, **NextStep** (the reading order the reader came from via `?via=<id>`, otherwise next in chapter), Keep reading cards, newer and older by date, and the author note.

### 5.4 Other pages

- `PageHead` and `PageSection` (`manual/PageHead.tsx`) give every page the same opening: label, big title, optional highlighted standfirst; then numbered sections (`A.1`, `B.2`).
- **All entries** (`/posts`): every published entry by year, newest or oldest first, with number, chapter dot, minutes and read ticks (`manual/EntriesList.tsx`).
- **Bio** (`/bio`, Appendix A): the author card with the voxel head (`app/bio/VoxelHead.tsx`), stats, the climb (`RouteChart`) over the timeline, chapter cards, and the organiser kit.
- **Speaking** (`/speaking`, Appendix B): talk cards with format chips and a 0 to 60 minute length scale, the booking card that writes an email, video, and the organiser kit. The short bio lives once, in `manual/OrganiserKit.tsx`.
- **404**: "This page isn't in the manual", buttons to chapters and all entries, and the "I'm new here" reading order.
- **Share cards**: `docs/og-card/template.html`, rendered by `npm run og-cards` (entry number, chapter, title, pull line).

---

## 6. Motion

Tokens: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--t-fast: 150ms`, `--t-state: 320ms`. Animate `translate`, `rotate`, `scale`, `transform`, `opacity`, `clip-path` and stroke offsets only (the chapter bars' `width` is the exception).

| What | Where | Reduced motion |
|---|---|---|
| Arrows nudge 4px toward where they lead (`nudge`, `nudge-back`) | Every arrow inside a link or button | Still |
| Cards lift 4px on hover | Entry cards, chapter cards, bio cards | Still |
| Reading-order steps slide in (`step-in`) | Home situations | Appear |
| Chapter and progress bars grow (`grow-bar`) | Home chapters | Jump |
| Flip cards turn over | Home toolkit | Swap faces without turning |
| Tool drawings move on hover or focus only (`tool-*`) | Toolkit, entry tool card | Still |
| The climb draws itself once, then the flag plants | Bio | Finished drawing |
| The voxel head extrudes, sways and follows the pointer | Bio | Extruded at once, held at three-quarters |
| A post's hero rises through its arch once (`HeroImage`) | Posts with a hero image | Fades in |

Nothing waits for script to appear, and nothing moves on its own forever.

---

## 7. Accessibility

- One `h1` per page, headings in order, `header`/`nav`/`main`/`footer` landmarks, the skip link, `lang="en-GB"`.
- Contrast: body and labels pass 4.5:1; theme colours are never text.
- Visible focus on every control, yellow on dark grounds.
- Toggles say their state (`aria-pressed`, `aria-expanded`); status changes use polite live regions (situations, Copy short bio).
- Drawings are `aria-hidden` when their name is already on the page; the climb is one `role="img"` with the timeline as text beside it.
- Targets are at least 24px, 44px on touch.
- Read state lives in `localStorage` behind `try`/`catch`; pages render unread first.
- `npm run test:e2e` visits every page at desktop and phone widths and runs axe-core (serious and critical issues fail).
