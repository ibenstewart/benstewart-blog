import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * The in-copy link treatment: ink text with a 2px blue underline and the
 * highlighter on hover. Single source of truth for the MDX `a` mapping and any component
 * that needs the same prose-link styling.
 */
export const textLinkClass =
  'underline text-ink decoration-accent decoration-2 underline-offset-[0.22em] hover:bg-hi transition-colors';

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
