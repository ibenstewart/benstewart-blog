'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

/** Longest step of the arch sequence in globals.css, plus a little slack. */
const SEQUENCE_MS = 1400;

/**
 * The Start here `<section>` with its two bits of motion (DESIGN.md 3.6).
 *
 * The arch rises: if the section is still below the fold when the page loads,
 * it is armed (`data-rise="armed"` holds the CSS animations on their first
 * frame) and plays once as it scrolls into view. A section already on screen
 * is left alone, and without script nothing is ever held back.
 *
 * The arrow points: while a row is hovered or focused, the arch arrow turns
 * toward that row's numeral. Pointer devices above the mobile breakpoint only;
 * on phones the arrow points down, and reduced motion keeps it still.
 */
export function StartHereMotion({ children, ...props }: ComponentPropsWithoutRef<'section'>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || !('IntersectionObserver' in window)) return;
    if (section.getBoundingClientRect().top < window.innerHeight) return;

    section.dataset.rise = 'armed';
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        section.dataset.rise = 'play';
        timer = window.setTimeout(() => delete section.dataset.rise, SEQUENCE_MS);
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      delete section.dataset.rise;
    };
  }, []);

  useEffect(() => {
    const section = ref.current;
    const arrow = section?.querySelector<SVGElement>('.start-arrow');
    if (!section || !arrow) return;
    const canPoint = window.matchMedia(
      '(hover: hover) and (min-width: 761px) and (prefers-reduced-motion: no-preference)',
    );

    const point = (row: Element) => {
      const numeral = row.querySelector('.start-num');
      if (!canPoint.matches || !numeral) return;
      const a = arrow.getBoundingClientRect();
      const n = numeral.getBoundingClientRect();
      const dx = n.left - (a.left + a.width / 2);
      const dy = n.top + n.height / 2 - (a.top + a.height / 2);
      section.style.setProperty('--point', `${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)}deg`);
    };
    const reset = () => section.style.removeProperty('--point');

    const onOver = (e: Event) => {
      const row = (e.target as Element).closest?.('.start-row');
      if (row) point(row);
      else reset();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!section.contains(e.relatedTarget as Node | null)) reset();
    };

    section.addEventListener('mouseover', onOver);
    section.addEventListener('focusin', onOver);
    section.addEventListener('mouseleave', reset);
    section.addEventListener('focusout', onFocusOut);
    return () => {
      section.removeEventListener('mouseover', onOver);
      section.removeEventListener('focusin', onOver);
      section.removeEventListener('mouseleave', reset);
      section.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return (
    <section ref={ref} {...props}>
      {children}
    </section>
  );
}
