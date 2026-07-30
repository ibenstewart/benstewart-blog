import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * The editorial in-copy link treatment (underline, accent decoration on
 * hover). Single source of truth for the MDX `a` mapping and any component
 * that needs the same prose-link styling.
 */
export const textLinkClass =
  'underline text-ink underline-offset-[3px] decoration-1 decoration-accent/55 hover:text-accent hover:decoration-accent transition-colors';

type TextLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  className?: string;
};

export function TextLink({ href, children, className, ...props }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={className ? `${textLinkClass} ${className}` : textLinkClass}
      {...props}
    >
      {children}
    </Link>
  );
}
