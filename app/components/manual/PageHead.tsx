import type { ReactNode } from 'react';

type PageHeadProps = {
  /** Small mono label above the title, in sentence case (".label" capitalises it). */
  label: string;
  title: ReactNode;
  /** One line under the highlighter. */
  standfirst?: ReactNode;
  /** Anything else in the header: intro paragraphs, chips. */
  children?: ReactNode;
  /** Replaces the single column, for a header with a side card (bio). */
  aside?: ReactNode;
};

/**
 * The header every non-entry page opens with: a label, a big title, an
 * optional highlighted standfirst, full bleed under a 2px ink rule.
 */
export function PageHead({ label, title, standfirst, children, aside }: PageHeadProps) {
  const body = (
    <div className="min-w-0">
      <p className="label text-faint">{label}</p>
      <h1 className="mt-5 text-[clamp(2.75rem,6.6vw,6rem)] leading-[0.92] font-bold tracking-[-0.045em] text-ink">{title}</h1>
      {standfirst && (
        <p className="mt-6 max-w-[34ch] text-[clamp(1.3125rem,2.1vw,1.75rem)] leading-[1.3] font-medium tracking-[-0.01em] text-ink">
          <span className="hl">{standfirst}</span>
        </p>
      )}
      {children}
    </div>
  );
  return (
    <header className="col-bleed border-b-2 border-ink">
      <div className="mx-auto max-w-[1180px] px-[var(--gutter)] pt-12 pb-12 mob:pt-8 mob:pb-9">
        {aside ? (
          <div className="grid grid-cols-[300px_minmax(0,1fr)] items-start gap-14 tab:grid-cols-[240px_minmax(0,1fr)] tab:gap-10 mob:grid-cols-1">
            {aside}
            {body}
          </div>
        ) : (
          body
        )}
      </div>
    </header>
  );
}

/** A full-bleed page section with the manual's label + heading pattern. */
export function PageSection({
  id,
  label,
  title,
  children,
  last = false,
}: {
  id: string;
  label: string;
  title: ReactNode;
  children?: ReactNode;
  /** The last section drops its rule: the footer brings its own. */
  last?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`col-bleed scroll-mt-4 ${last ? '' : 'border-b-2 border-ink'}`}>
      <div className="mx-auto max-w-[1180px] px-[var(--gutter)] py-20 mob:py-14">
        <p className="label text-accent">{label}</p>
        <h2 id={`${id}-title`} className="mt-4 text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] text-ink">{title}</h2>
        {children}
      </div>
    </section>
  );
}
