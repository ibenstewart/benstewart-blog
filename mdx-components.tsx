import React, { ComponentPropsWithoutRef, isValidElement, ReactNode } from 'react';
import Link from 'next/link';
import { highlight } from 'sugar-high';
import { ArticleJsonLd, FAQJsonLd, PersonJsonLd } from './app/components/JsonLd';
import { getAllPosts } from './lib/posts';
import { THEMES } from './lib/manual';
import { PostNav } from './app/components/PostNav';
import { PostHeader } from './app/components/PostHeader';
import { textLinkClass } from './app/components/TextLink';
import { CodeBlock } from './app/components/CodeBlock';
import { HeroImage } from './app/components/HeroImage';
import { Quadrant } from './app/components/Quadrant';
import { Stats } from './app/components/Stats';
import { TweetEmbed } from './app/components/TweetEmbed';

type HeadingProps = ComponentPropsWithoutRef<'h1'>;
type ParagraphProps = ComponentPropsWithoutRef<'p'>;
type ListProps = ComponentPropsWithoutRef<'ul'>;
type ListItemProps = ComponentPropsWithoutRef<'li'>;
type AnchorProps = ComponentPropsWithoutRef<'a'>;
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;
type ImgProps = ComponentPropsWithoutRef<'img'>;

// Custom component types
type CalloutProps = {
  children: ReactNode;
  type?: 'insight' | 'warning' | 'tip' | 'story';
  /** Overrides the type's default label, e.g. "Try it on Monday". */
  label?: string;
};

type PullQuoteProps = {
  children: ReactNode;
  author?: string;
};

type DividerProps = {
  style?: 'dots' | 'line' | 'space' | 'wave';
};

type KeyPointProps = {
  children: ReactNode;
};

type ScenarioProps = {
  speaker: string;
  children: ReactNode;
};

type TLDRProps = {
  children: ReactNode;
};

type CollapsibleProps = {
  title: string;
  children: ReactNode;
};

type TimelineProps = {
  children: ReactNode;
};

type EventProps = {
  year: string;
  title: string;
  children?: ReactNode;
};

type FigureProps = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  width?: string;
  hero?: boolean;
  /** A screenshot: sits in the wide column with a 2px ink frame. */
  screenshot?: boolean;
};

type LedeProps = {
  children: ReactNode;
};

type PostSchemaProps = {
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  slug: string;
  image?: string;
};

/**
 * A post's BlogPosting JSON-LD. The chapter and themes come from the post's
 * own metadata by slug, so `articleSection` always matches the entry header.
 */
async function PostSchema({ title, description, date, lastModified, slug, image }: PostSchemaProps) {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const themes = (posts.find((p) => p.slug === slug)?.themes ?? [])
    .map((id) => THEMES.find((t) => t.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  return (
    <ArticleJsonLd
      title={title}
      description={description}
      date={date}
      lastModified={lastModified}
      url={`https://www.benstewart.ai/posts/${slug}`}
      image={image}
      section={themes[0]}
      keywords={themes}
    />
  );
}

const calloutLabels: Record<Required<CalloutProps>['type'], string> = {
  insight: 'Insight',
  warning: 'Worth knowing',
  tip: 'Try this',
  story: 'Story',
};

// Prose type scale (DESIGN.md 3.3). Containers that set their own body type
// re-style descendant paragraphs, because the p mapping's classes win over
// anything inherited (plan KTD13).
const proseText =
  'text-[1.1875rem] leading-[1.62] tracking-[-0.003em] text-muted mob:text-[1.125rem] mob:leading-[1.6]';

const calloutLabelColour: Record<Required<CalloutProps>['type'], string> = {
  insight: 'text-accent',
  warning: 'text-red',
  tip: 'text-[#1C7A62]',
  story: 'text-faint',
};

type FenceProps = { className?: string; children?: ReactNode };

/** Plain text of a heading's children, for its id. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

/** "The wrong question" -> "the-wrong-question", for section links and the contents rail. */
export const headingId = (children: ReactNode) =>
  textOf(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const components = {
  h1: (props: HeadingProps) => (
    <h1
      className="text-[clamp(2.375rem,5.3vw,4.75rem)] leading-[1.02] font-bold tracking-[-0.035em] text-ink"
      {...props}
    />
  ),
  // Sections are numbered from the entry number by CSS (.prose-h2::before).
  h2: ({ children, ...props }: HeadingProps) => (
    <h2
      id={headingId(children)}
      className="prose-h2 scroll-mt-8 text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.05] font-bold tracking-[-0.03em] text-ink mob:text-[1.625rem]"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: (props: HeadingProps) => (
    <h3
      className="prose-h3 scroll-mt-8 text-[1.375rem] leading-[1.25] font-bold tracking-[-0.015em] text-ink"
      {...props}
    />
  ),
  h4: (props: HeadingProps) => (
    <h4 className="text-[1.0625rem] leading-[1.4] font-bold text-ink" {...props} />
  ),
  p: (props: ParagraphProps) => <p className={`${proseText} text-pretty`} {...props} />,
  ol: (props: ListProps) => (
    <ol role="list" className={`prose-ol ${proseText}`} {...props} />
  ),
  ul: (props: ListProps) => (
    <ul role="list" className={`prose-ul ${proseText}`} {...props} />
  ),
  li: (props: ListItemProps) => <li className="text-pretty" {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => <em className="italic" {...props} />,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-bold text-ink" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className = textLinkClass;
    if (href?.startsWith('/')) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith('#')) {
      return (
        <a href={href} className={className} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  },
  // Markdown images arrive inside a <p>, so this is a span-based pseudo-figure.
  img: ({ alt, ...props }: ImgProps) => (
    <span className="block text-center">
      <img className="mx-auto h-auto max-w-[min(100%,640px)] rounded-2xl" alt={alt} {...props} />
      {alt && (
        <span className="mt-3 block text-[0.9375rem] leading-[1.45] text-faint">
          {alt}
        </span>
      )}
    </span>
  ),
  // Fenced code: highlight only fences that name a language (plan KTD9).
  pre: ({ children }: ComponentPropsWithoutRef<'pre'>) => {
    const fence = React.isValidElement<FenceProps>(children) ? children.props : {};
    const src = typeof fence.children === 'string' ? fence.children : null;
    const className = fence.className;
    let code: ReactNode;
    if (src !== null && className?.startsWith('language-')) {
      code = <code className={className} dangerouslySetInnerHTML={{ __html: highlight(src) }} />;
    } else if (src !== null) {
      code = <code className={className}>{src}</code>;
    } else {
      code = children;
    }
    return <CodeBlock>{code}</CodeBlock>;
  },
  // Inline code only; styled in globals.css, never highlighted.
  code: (props: ComponentPropsWithoutRef<'code'>) => <code {...props} />,
  Table: ({
    data,
    caption,
  }: {
    data: { headers: string[]; rows: string[][] };
    caption?: string;
  }) => (
    <table className="text-[0.9375rem] text-ink">
      {caption && <caption className="pb-2 text-left text-muted">{caption}</caption>}
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th key={index} scope="col" className="border border-hair px-3 py-2 text-left font-bold">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="border border-hair px-3 py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="prose-quote text-[1.3125rem] leading-[1.55] text-ink [&_p]:text-[1.3125rem] [&_p]:leading-[1.55] [&_p]:text-ink"
      {...props}
    />
  ),
  hr: () => <hr className="prose-hr" />,
  // Custom components. None may wrap children in a <p> (docs/solutions/ui-bugs/
  // mdx-component-p-wrapper-invalid-nesting.md).
  Callout: ({ children, type = 'insight', label }: CalloutProps) => (
    <aside className="callout rounded-[20px] border-2 border-ink bg-card px-7 py-6 mob:px-[22px] mob:py-5">
      <p className={`label ${calloutLabelColour[type]}`}>{label ?? calloutLabels[type]}</p>
      <div className="mt-3 text-[1.0625rem] leading-[1.6] text-muted [&_p]:text-[1.0625rem] [&_p]:leading-[1.6] [&_li]:text-[1.0625rem] [&>*+*]:mt-[0.8em]">{children}</div>
    </aside>
  ),
  PullQuote: ({ children, author }: PullQuoteProps) => (
    <figure className="pull-quote border-t-2 border-ink pt-5">
      <blockquote className="text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.08] font-bold tracking-[-0.03em] text-pretty text-ink [&_p]:text-[clamp(1.75rem,3.4vw,2.5rem)] [&_p]:leading-[1.08] [&_p]:font-bold [&_p]:tracking-[-0.03em] [&_p]:text-ink [&>*+*]:mt-[0.6em]">
        {children}
      </blockquote>
      {author && <figcaption className="label mt-3 text-faint">{author}</figcaption>}
    </figure>
  ),
  Divider: ({ style = 'dots' }: DividerProps) => {
    if (style === 'space') return <div aria-hidden="true" className="h-12" />;
    return <hr className="prose-hr" />;
  },
  KeyPoint: ({ children }: KeyPointProps) => (
    <aside className="key-point rounded-[20px] bg-hi px-7 py-6 text-ink mob:px-[22px]">
      <p className="label text-ink">Key point</p>
      <div className="mt-3 text-[clamp(1.375rem,2.4vw,1.75rem)] leading-[1.2] font-bold tracking-[-0.02em] [&_p]:text-[clamp(1.375rem,2.4vw,1.75rem)] [&_p]:leading-[1.2] [&_p]:font-bold [&_p]:tracking-[-0.02em] [&_p]:text-ink [&>*+*]:mt-[0.6em]">
        {children}
      </div>
    </aside>
  ),
  Scenario: ({ speaker, children }: ScenarioProps) => (
    <div className={`scenario grid ${speaker === 'Me' ? 'justify-items-end' : 'justify-items-start'}`}>
      <span className="label mb-1.5 text-faint">{speaker}</span>
      <div
        className={`max-w-[520px] rounded-[18px] border-2 px-4 py-3 text-[1.125rem] leading-[1.5] [&>*+*]:mt-[0.6em] [&_p]:text-[1.125rem] [&_p]:leading-[1.5] ${
          speaker === 'Me'
            ? 'rounded-br-[4px] border-accent bg-accent text-white [&_p]:text-white [&_strong]:text-white'
            : 'rounded-bl-[4px] border-ink bg-card text-ink [&_p]:text-ink'
        }`}
      >
        {children}
      </div>
    </div>
  ),
  TLDR: ({ children }: TLDRProps) => (
    <section aria-label="In short" className="tldr surface-dark col-wide mx-auto w-full max-w-[736px] rounded-[24px] bg-ink px-10 pt-8 pb-9 text-white mob:rounded-[20px] mob:px-[24px] mob:pt-7 mob:pb-8">
      <h2 className="label text-hi">In short</h2>
      <div className="mt-3.5 text-[1.25rem] leading-[1.5] font-medium text-white mob:text-[1.125rem] [&_li]:text-white [&_p]:text-[1.25rem] [&_p]:leading-[1.5] [&_p]:font-medium [&_p]:text-white mob:[&_p]:text-[1.125rem] [&_strong]:text-hi [&_a]:text-white [&>*+*]:mt-[0.8em]">
        {children}
      </div>
    </section>
  ),
  Collapsible: ({ title, children }: CollapsibleProps) => (
    <details className="collapsible group">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 text-[1.0625rem] font-medium text-ink transition-colors select-none hover:text-accent [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
          className="h-3.5 w-3.5 shrink-0 text-accent transition-transform group-open:rotate-90"
        >
          <path d="M5.5 2.5 11 8l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        {title}
      </summary>
      <div className="mt-[1.1em] [&>*+*]:mt-[1.1em]">{children}</div>
    </details>
  ),
  Timeline: ({ children }: TimelineProps) => (
    <div className="my-8 relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-hair" />
      <div className="space-y-6">{children}</div>
    </div>
  ),
  Event: ({ year, title, children }: EventProps) => (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-faint bg-paper" />
      <div className="flex flex-row items-baseline gap-3 mob:flex-col mob:items-start mob:gap-1">
        <span className="font-sans text-[13px] text-faint tabular-nums">{year}</span>
        <span className="font-sans font-medium text-ink">{title}</span>
      </div>
      {children && (
        <div className="mt-1 font-sans text-muted text-base">{children}</div>
      )}
    </div>
  ),
  Figure: ({ src, alt, caption, credit, width, hero, screenshot }: FigureProps) => {
    if (hero) {
      return (
        <figure className="hero-fig col-wide">
          <HeroImage src={src} alt={alt} />
        </figure>
      );
    }
    return (
      <figure className={`prose-figure text-center ${screenshot ? 'col-wide' : ''}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`mx-auto h-auto rounded-2xl ${screenshot ? 'border-2 border-ink' : ''}`}
          style={{ maxWidth: width ? `min(100%, ${width})` : screenshot ? '100%' : 'min(100%, 640px)' }}
        />
        {caption && (
          <figcaption className="mt-3 text-[0.9375rem] leading-[1.45] text-faint">
            {caption}
            {credit && (
              <span className="font-mono text-[0.8125rem] tracking-[0.04em] text-faint">
                {' · '}
                {credit}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    );
  },
  Lede: ({ children }: LedeProps) => <div className="lede">{children}</div>,
  PostSchema: (props: PostSchemaProps) => <PostSchema {...props} />,
  FAQJsonLd: (props: { faqs: { question: string; answer: string }[] }) => <FAQJsonLd {...props} />,
  PostNav: (props: { slug: string; related?: string[] }) => <PostNav {...props} />,
  PostHeader: (props: { title: string; slug: string }) => <PostHeader {...props} />,
  Quadrant,
  Stats,
  TweetEmbed,
  PersonSchema: () => <PersonJsonLd />,
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
