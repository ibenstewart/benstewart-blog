import type { ReactNode } from 'react';

type HomeHeroProps = {
  /** First caption line, e.g. "Engineer turned leader." */
  tagline: string;
  /** Second caption line, shown in red with a dot, e.g. "Glasgow". */
  place: string;
  /** The intro paragraphs, written as MDX in app/page.mdx. */
  children: ReactNode;
};

/**
 * Homepage hero (DESIGN.md 4.2): the name at display scale, then a 12-column
 * row with the caption on the left and the intro paragraphs on the right.
 *
 * The "r" of "Stewart" sits in its own span with no tracking, so the r and t
 * don't collide at -0.04em. The two word spans stack on mobile; the explicit
 * space keeps the accessible name "Ben Stewart".
 */
export function HomeHero({ tagline, place, children }: HomeHeroProps) {
  return (
    <section
      className="home-hero col-full pt-[clamp(88px,14vw,208px)]"
      aria-labelledby="name"
    >
      <h1
        id="name"
        className="-ml-[0.045em] text-[clamp(5.25rem,9.5vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.04em] text-ink mob:text-[clamp(3.75rem,22vw,6.25rem)]"
      >
        <span className="mob:block">Ben</span>{' '}
        <span className="mob:block">
          Stewa<span className="tracking-normal">r</span>t
        </span>
      </h1>
      <div className="mt-[clamp(48px,5.6vw,80px)] grid grid-cols-12 gap-x-6 mob:mt-9 mob:block">
        <div className="col-span-3 col-start-1 pt-1.5 tab:col-span-4 mob:pt-0">
          <p className="text-[1.25rem] leading-[1.3] font-medium tracking-[-0.01em] text-ink">
            {tagline}
          </p>
          <p className="mt-2 flex items-center gap-2.5 text-[1.0625rem] font-medium text-red before:size-[9px] before:flex-none before:rounded-full before:bg-red before:content-['']">
            {place}
          </p>
        </div>
        <div className="col-span-7 col-start-5 max-w-[40rem] tab:col-span-8 mob:mt-8 [&_p]:text-[clamp(1.1875rem,1.75vw,1.5rem)] [&_p]:leading-[1.5] [&_p]:tracking-[-0.005em] [&_p]:text-muted [&>p+p]:mt-[0.75em]">
          {children}
        </div>
      </div>
    </section>
  );
}
