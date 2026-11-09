import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react';

/**
 * MDX components for a Field manual entry. Passed as the `components` prop to
 * a post's compiled MDX, they override the site's own mapping in
 * mdx-components.tsx; anything not listed here (Quadrant, Figure, Stats...)
 * falls back to the Glasgow Civic version. The entry page renders its own
 * header and ending, so PostHeader, PostNav and the JSON-LD helpers render
 * nothing here.
 */

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CALLOUT_LABELS = { insight: 'Insight', warning: 'Worth knowing', tip: 'Try this', story: 'Story' } as const;

type Kids = { children?: ReactNode };

export const fmComponents = {
  PostHeader: () => null,
  PostSchema: () => null,
  FAQJsonLd: () => null,
  PostNav: () => null,
  h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 id={slugify(textOf(children))} className="fm-h2" {...props}>{children}</h2>
  ),
  h3: (props: ComponentPropsWithoutRef<'h3'>) => <h3 className="fm-h3" {...props} />,
  p: (props: ComponentPropsWithoutRef<'p'>) => <p className="fm-p" {...props} />,
  ul: (props: ComponentPropsWithoutRef<'ul'>) => <ul className="fm-ul" {...props} />,
  ol: (props: ComponentPropsWithoutRef<'ol'>) => <ol className="fm-ol" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => <blockquote className="fm-bq" {...props} />,
  Lede: ({ children }: Kids) => <div className="fm-lede">{children}</div>,
  KeyPoint: ({ children }: Kids) => (
    <aside className="fm-keypoint"><span className="fm-label">Key point</span><div>{children}</div></aside>
  ),
  Callout: ({ children, type = 'insight', label }: Kids & { type?: keyof typeof CALLOUT_LABELS; label?: string }) => (
    <aside className="fm-callout" data-type={type}><span className="fm-label">{label ?? CALLOUT_LABELS[type]}</span><div>{children}</div></aside>
  ),
  TLDR: ({ children }: Kids) => (
    <aside className="fm-tldr"><span className="fm-label">In short</span><div>{children}</div></aside>
  ),
  PullQuote: ({ children, author }: Kids & { author?: string }) => (
    <figure className="fm-pull"><blockquote>{children}</blockquote>{author && <figcaption>{author}</figcaption>}</figure>
  ),
  Scenario: ({ speaker, children }: Kids & { speaker: string }) => (
    <div className="fm-scenario" data-me={speaker === 'Me'}><span className="fm-label">{speaker}</span><div className="fm-bubble">{children}</div></div>
  ),
  TweetEmbed: ({ url, label }: { url: string; label?: string }) => (
    <a href={url} target="_blank" rel="noopener noreferrer" className="fm-note">
      <span className="fm-label">Field note · from X</span>
      <span className="fm-note-title">{label ?? 'View the post on X'} →</span>
    </a>
  ),
};

/** Prose CSS for entries. Unlayered, so it beats any utility a fallback component carries. */
export const ENTRY_CSS = (c: { INK: string; BLUE: string; HI: string; GREY: string }) => `
  .fm-prose { counter-reset: fm-sec; color: #2B2E34; }
  .fm-prose > * + * { margin-top: 1.15em; }
  .fm-prose .fm-p, .fm-prose li { font-size: 19px; line-height: 1.65; color: #2B2E34; }
  .fm-prose strong { color: ${c.INK}; font-weight: 700; }
  .fm-prose a:not(.fm-note) { color: ${c.INK}; text-decoration: underline; text-decoration-color: ${c.BLUE}; text-decoration-thickness: 2px; text-underline-offset: .2em; }
  .fm-prose a:not(.fm-note):hover { background: ${c.HI}; }
  .fm-h2 { counter-increment: fm-sec; margin-top: 2.4em !important; scroll-margin-top: 24px; font-size: clamp(28px, 3vw, 38px); line-height: 1.05; font-weight: 700; letter-spacing: -0.03em; color: ${c.INK}; text-wrap: balance; }
  .fm-h2::before { content: "§" var(--fm-entry) "." counter(fm-sec); display: block; margin-bottom: 10px; font: 400 13px/1 var(--font-plex-mono), monospace; letter-spacing: .1em; color: ${c.BLUE}; }
  .fm-h3 { margin-top: 1.8em !important; font-size: 22px; font-weight: 700; letter-spacing: -0.015em; color: ${c.INK}; }
  .fm-ul { list-style: none; padding: 0; }
  .fm-ul > li { position: relative; padding-left: 30px; }
  .fm-ul > li + li, .fm-ol > li + li { margin-top: .5em; }
  .fm-ul > li::before { content: ""; position: absolute; left: 2px; top: .5em; width: 12px; height: 12px; background: ${c.HI}; border: 2px solid ${c.INK}; border-radius: 3px; }
  .fm-ol { list-style: none; padding: 0; counter-reset: fm-ol; }
  .fm-ol > li { position: relative; padding-left: 40px; counter-increment: fm-ol; }
  .fm-ol > li::before { content: counter(fm-ol); position: absolute; left: 0; top: .15em; width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; background: ${c.INK}; color: ${c.HI}; font: 700 14px/1 var(--font-plex-mono), monospace; }
  .fm-label { display: block; font: 400 12px/1 var(--font-plex-mono), monospace; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 12px; }
  .fm-keypoint { background: ${c.HI}; border-radius: 20px; padding: 24px 28px; color: ${c.INK}; }
  .fm-keypoint, .fm-keypoint .fm-p, .fm-keypoint li { font-size: clamp(22px, 2.4vw, 28px); line-height: 1.2; font-weight: 700; letter-spacing: -0.02em; color: ${c.INK}; }
  .fm-callout { border: 2px solid ${c.INK}; border-radius: 20px; padding: 22px 26px; background: #fff; }
  .fm-callout .fm-p, .fm-callout li { font-size: 17px; line-height: 1.6; }
  .fm-callout > div > * + * { margin-top: .8em; }
  .fm-callout .fm-label { color: ${c.BLUE}; }
  .fm-callout[data-type="warning"] .fm-label { color: #C8442B; }
  .fm-callout[data-type="tip"] .fm-label { color: #1F8A70; }
  .fm-callout[data-type="story"] .fm-label { color: ${c.GREY}; }
  .fm-tldr { background: ${c.INK}; border-radius: 20px; padding: 26px 28px; color: #fff; }
  .fm-tldr .fm-label { color: ${c.HI}; }
  .fm-tldr, .fm-tldr .fm-p, .fm-tldr li { font-size: 20px; line-height: 1.5; font-weight: 500; color: #fff; }
  .fm-tldr strong { color: ${c.HI}; }
  .fm-tldr > div > * + * { margin-top: .7em; }
  .fm-pull { margin-block: 1.6em !important; border-top: 2px solid ${c.INK}; padding-top: 20px; }
  .fm-pull blockquote, .fm-pull .fm-p { font-size: clamp(28px, 3.4vw, 40px); line-height: 1.08; font-weight: 700; letter-spacing: -0.03em; color: ${c.INK}; }
  .fm-pull figcaption { margin-top: 12px; font: 400 13px/1 var(--font-plex-mono), monospace; letter-spacing: .08em; text-transform: uppercase; color: ${c.GREY}; }
  .fm-bq { border-left: 4px solid ${c.BLUE}; padding-left: 20px; }
  .fm-bq .fm-p { font-size: 21px; color: ${c.INK}; }
  .fm-scenario { display: grid; justify-items: start; }
  .fm-scenario .fm-label { color: ${c.GREY}; margin-bottom: 6px; }
  .fm-bubble { max-width: 520px; border: 2px solid ${c.INK}; border-radius: 18px 18px 18px 4px; padding: 12px 16px; background: #fff; font-size: 18px; line-height: 1.5; color: ${c.INK}; }
  .fm-scenario[data-me="true"] { justify-items: end; }
  .fm-scenario[data-me="true"] .fm-bubble { border-radius: 18px 18px 4px 18px; background: ${c.BLUE}; border-color: ${c.BLUE}; color: #fff; }
  .fm-scenario + .fm-scenario { margin-top: .6em; }
  .fm-note { display: block; border: 2px dashed ${c.INK}; border-radius: 16px; padding: 18px 20px; color: ${c.INK}; text-decoration: none; }
  .fm-note .fm-label { color: ${c.BLUE}; }
  .fm-note-title { font-size: 19px; font-weight: 700; }
  .fm-note:hover { background: ${c.HI}; }
  .fm-lede, .fm-lede .fm-p { font-size: 23px; line-height: 1.5; font-weight: 500; color: ${c.INK}; letter-spacing: -0.01em; }
  .fm-hl { background: linear-gradient(${c.HI}, ${c.HI}) 0 88% / 100% 40% no-repeat; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
  @media (max-width: 760px) {
    .fm-prose .fm-p, .fm-prose li { font-size: 18px; }
    .fm-lede, .fm-lede .fm-p { font-size: 20px; }
  }
`;
