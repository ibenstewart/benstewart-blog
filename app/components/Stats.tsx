type StatsProps = {
  items: { value: string; label: string }[];
};

/**
 * A row of big numbers with short labels, for the figures a post rests on.
 * Directory-board styling: a 2px ink rule on top, numerals in accent.
 */
export function Stats({ items }: StatsProps) {
  return (
    <dl className="stats grid grid-cols-4 gap-6 border-t-2 border-ink pt-5 mob:grid-cols-2 mob:gap-x-5 mob:gap-y-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse justify-end">
          <dt className="mt-1.5 text-[0.9375rem] leading-[1.35] font-medium text-balance text-muted">{item.label}</dt>
          <dd className="text-[2.75rem] leading-[1] font-bold tracking-[-0.04em] text-accent tabular-nums mob:text-[2.25rem]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
