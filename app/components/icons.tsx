import type { SVGProps } from 'react';

/**
 * The Glasgow Civic right arrow (DESIGN.md 4.1), copied from the prototype.
 * Decorative only. Flip with `-scale-x-100` to point left, `rotate-90` to point down.
 */
export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M3 21h31.4L21.7 8.3l4.2-4.2L45.8 24 25.9 43.9l-4.2-4.2L34.4 27H3z"
        fill="currentColor"
      />
    </svg>
  );
}
