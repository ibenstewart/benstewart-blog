import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import Link from 'next/link';
import { highlight } from 'sugar-high';

type HeadingProps = ComponentPropsWithoutRef<'h1'>;
type ParagraphProps = ComponentPropsWithoutRef<'p'>;
type ListProps = ComponentPropsWithoutRef<'ul'>;
type ListItemProps = ComponentPropsWithoutRef<'li'>;
type AnchorProps = ComponentPropsWithoutRef<'a'>;
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;

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

const components = {
  h1: (props: HeadingProps) => (
    <h1 className="text-2xl md:text-3xl font-medium mb-1" {...props} />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 font-medium mt-8 mb-3"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3
      className="text-lg md:text-xl text-gray-900 dark:text-gray-100 font-medium mt-8 mb-3"
      {...props}
    />
  ),
  h4: (props: HeadingProps) => <h4 className="text-base md:text-lg font-medium" {...props} />,
  p: (props: ParagraphProps) => (
    <p className="text-gray-900 dark:text-gray-100 leading-snug" {...props} />
  ),
  ol: (props: ListProps) => (
    <ol
      className="text-gray-900 dark:text-gray-100 list-decimal pl-5 space-y-2"
      {...props}
    />
  ),
  ul: (props: ListProps) => (
    <ul
      className="text-gray-900 dark:text-gray-100 list-disc pl-5 space-y-1"
      {...props}
    />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => (
    <em className="font-medium" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-medium" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className =
      'underline decoration-neutral-500 underline-offset-[2.5px] hover:decoration-neutral-400 dark:decoration-neutral-500 dark:hover:decoration-neutral-600 transition-colors';
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
  code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const codeHTML = highlight(children as string);
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
  },
  Table: ({ data }: { data: { headers: string[]; rows: string[][] } }) => (
    <table>
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="ml-[0.075em] border-l-3 border-gray-300 pl-4 text-gray-700 dark:border-gray-600 dark:text-gray-300"
      {...props}
    />
  ),
  hr: () => (
    <div className="my-10 flex items-center justify-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
      <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
    </div>
  ),
  // Custom components
  Callout: ({ children, type = 'insight' }: CalloutProps) => {
    const styles = {
      insight: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
      warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
      tip: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
      story: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    };
    return (
      <div className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}>
        {children}
      </div>
    );
  },
  PullQuote: ({ children, author }: PullQuoteProps) => (
    <figure className="my-8 px-4">
      <blockquote className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 italic border-l-4 border-gray-800 dark:border-gray-200 pl-4">
        {children}
      </blockquote>
      {author && (
        <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400 pl-4">
          — {author}
        </figcaption>
      )}
    </figure>
  ),
  Divider: ({ style = 'dots' }: DividerProps) => {
    if (style === 'space') return <div className="my-12" />;
    if (style === 'line') return <hr className="my-10 border-gray-200 dark:border-gray-700" />;
    if (style === 'wave') return (
      <div className="my-10 flex items-center justify-center text-gray-300 dark:text-gray-600 text-2xl tracking-widest">
        ~ ~ ~
      </div>
    );
    return (
      <div className="my-10 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
    );
  },
  KeyPoint: ({ children }: KeyPointProps) => (
    <div className="my-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{children}</p>
    </div>
  ),
  Scenario: ({ speaker, children }: ScenarioProps) => (
    <div className="my-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
      <span className="font-medium text-gray-700 dark:text-gray-300">{speaker}:</span>{' '}
      <span className="text-gray-600 dark:text-gray-400 italic">{children}</span>
    </div>
  ),
  TLDR: ({ children }: TLDRProps) => (
    <div className="my-8 p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">TL;DR</div>
      <div className="text-gray-800 dark:text-gray-200 font-medium">{children}</div>
    </div>
  ),
  Collapsible: ({ title, children }: CollapsibleProps) => (
    <details className="my-6 group">
      <summary className="cursor-pointer select-none font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors list-none flex items-center gap-2">
        <span className="text-gray-400 dark:text-gray-500 transition-transform group-open:rotate-90">&#9654;</span>
        {title}
      </summary>
      <div className="mt-3">
        {children}
      </div>
    </details>
  ),
  Timeline: ({ children }: TimelineProps) => (
    <div className="my-8 relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-6">
        {children}
      </div>
    </div>
  ),
  Event: ({ year, title, children }: EventProps) => (
    <div className="relative pl-8">
      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-gray-400 dark:border-gray-500 bg-white dark:bg-black" />
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tabular-nums">{year}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
      </div>
      {children && (
        <p className="mt-1 text-gray-600 dark:text-gray-400 text-base">{children}</p>
      )}
    </div>
  ),
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
