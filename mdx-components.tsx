import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import Link from 'next/link';
import { highlight } from 'sugar-high';
import { ArticleJsonLd, FAQJsonLd, PersonJsonLd } from './app/components/JsonLd';
import { RelatedPosts } from './app/components/RelatedPosts';
import { PostNav } from './app/components/PostNav';
import { PostHeader } from './app/components/PostHeader';
import { PostList } from './app/components/PostList';
import { textLinkClass } from './app/components/TextLink';

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

const calloutLabels: Record<Required<CalloutProps>['type'], string> = {
  insight: 'Insight',
  warning: 'Worth knowing',
  tip: 'Try this',
  story: 'Story',
};

const components = {
  h1: (props: HeadingProps) => (
    <h1 className="font-serif text-2xl md:text-3xl font-semibold text-ink" {...props} />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="font-serif text-[1.625rem] font-semibold leading-[1.25] tracking-[-0.008em] mt-12 mb-4 text-ink"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3 className="font-serif text-[1.3rem] font-semibold mt-10 mb-3 text-ink" {...props} />
  ),
  h4: (props: HeadingProps) => (
    <h4 className="font-serif text-lg font-semibold text-ink" {...props} />
  ),
  p: (props: ParagraphProps) => (
    <p className="font-serif text-[1.1875rem] leading-[1.7] text-ink" {...props} />
  ),
  ol: (props: ListProps) => (
    <ol
      className="font-serif text-[1.1875rem] leading-[1.7] text-ink list-decimal pl-5 space-y-2"
      {...props}
    />
  ),
  ul: (props: ListProps) => (
    <ul
      className="font-serif text-[1.1875rem] leading-[1.7] text-ink list-disc pl-5 space-y-2"
      {...props}
    />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => <em className="italic" {...props} />,
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-[620]" {...props} />
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
  img: ({ alt, ...props }: ImgProps) => (
    <span className="block my-10 text-center">
      <img
        className="mx-auto border border-hair max-w-[min(100%,640px)] h-auto"
        alt={alt}
        {...props}
      />
      {alt && (
        <span className="block mt-3 font-serif italic text-[0.9375rem] text-muted">{alt}</span>
      )}
    </span>
  ),
  code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const codeHTML = highlight(children as string);
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
  },
  Table: ({
    data,
    caption,
  }: {
    data: { headers: string[]; rows: string[][] };
    caption?: string;
  }) => (
    <table className="font-sans text-[15px] text-ink border border-hair">
      {caption && <caption className="text-muted">{caption}</caption>}
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              className="border border-hair px-3 py-2 text-left font-semibold"
            >
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
      className="pl-6 italic font-serif text-[1.1875rem] leading-[1.7] text-muted [&>p]:italic [&>p]:font-serif [&>p]:text-[1.1875rem] [&>p]:leading-[1.7] [&>p]:text-muted"
      {...props}
    />
  ),
  hr: () => (
    <div
      aria-hidden="true"
      className="my-12 text-center font-sans text-faint text-[1.2rem] tracking-[0.45em] indent-[0.45em]"
    >
      * * *
    </div>
  ),
  // Custom components
  Callout: ({ children, type = 'insight' }: CalloutProps) => (
    <div className="my-8 rounded-sm border border-hair bg-raise p-5">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.09em] text-faint mb-2">
        {calloutLabels[type]}
      </p>
      {children}
    </div>
  ),
  PullQuote: ({ children, author }: PullQuoteProps) => (
    <figure className="my-12 mx-auto max-w-[34rem] text-center">
      <div className="w-11 h-px bg-hair mx-auto" />
      <blockquote className="italic font-serif text-[clamp(1.45rem,3vw,1.8rem)] leading-[1.35] my-6 text-ink">
        {children}
      </blockquote>
      <div className="w-11 h-px bg-hair mx-auto" />
      {author && (
        <figcaption className="font-sans text-[13px] text-faint mt-2">{author}</figcaption>
      )}
    </figure>
  ),
  Divider: ({ style = 'dots' }: DividerProps) => {
    if (style === 'space') return <div className="my-12" />;
    if (style === 'line') return <hr className="my-10 border-hair" />;
    if (style === 'wave')
      return (
        <div className="my-10 flex items-center justify-center text-faint text-2xl tracking-widest">
          ~ ~ ~
        </div>
      );
    return (
      <div className="my-10 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-hair" />
        <span className="h-1.5 w-1.5 rounded-full bg-hair" />
        <span className="h-1.5 w-1.5 rounded-full bg-hair" />
      </div>
    );
  },
  KeyPoint: ({ children }: KeyPointProps) => (
    <div className="my-8 border-t border-hair pt-5">
      <div className="font-serif text-[1.0625rem] font-[560] text-ink">{children}</div>
    </div>
  ),
  Scenario: ({ speaker, children }: ScenarioProps) => (
    <div className="my-6 pl-6">
      <span className="block mb-1 font-sans text-[13px] font-semibold uppercase tracking-wide text-faint">
        {speaker}
      </span>
      <span className="italic font-serif text-muted">{children}</span>
    </div>
  ),
  TLDR: ({ children }: TLDRProps) => (
    <div className="border-t border-hair pt-6 mt-12 mb-8">
      <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.09em] text-accent mb-3">
        TL;DR
      </div>
      <div className="font-serif text-[1.0625rem] leading-[1.62] text-muted">{children}</div>
    </div>
  ),
  Collapsible: ({ title, children }: CollapsibleProps) => (
    <details className="my-6 group">
      <summary className="cursor-pointer select-none font-serif font-[560] text-ink hover:text-accent transition-colors list-none flex items-center gap-2">
        <span className="text-faint transition-transform group-open:rotate-90">&#9654;</span>
        {title}
      </summary>
      <div className="mt-3">{children}</div>
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
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <span className="font-sans text-[13px] text-faint tabular-nums">{year}</span>
        <span className="font-serif font-[560] text-ink">{title}</span>
      </div>
      {children && (
        <div className="mt-1 font-serif text-muted text-base">{children}</div>
      )}
    </div>
  ),
  Figure: ({ src, alt, caption, credit, width }: FigureProps) => (
    <figure className="my-10 text-center">
      <img
        src={src}
        alt={alt}
        className={`mx-auto border border-hair h-auto${width ? '' : ' max-w-[min(100%,640px)]'}`}
        style={width ? { maxWidth: width } : undefined}
      />
      {caption && (
        <figcaption className="mt-3 font-serif italic text-[0.9375rem] text-muted">
          {caption}
          {credit && (
            <span className="not-italic font-sans text-[12px] text-faint"> · {credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  ),
  Lede: ({ children }: LedeProps) => <div className="lede">{children}</div>,
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
  PostNav: (props: { slug: string; related?: string[] }) => <PostNav {...props} />,
  PostHeader: (props: { title: string; slug: string }) => <PostHeader {...props} />,
  PostList: (props: { slugs?: string[] }) => <PostList {...props} />,
  PersonSchema: () => <PersonJsonLd />,
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
