type QuadrantCell = {
  /** The level(s) this box earned, e.g. "5" or "4 / 7". */
  level: string;
  /** What to do with work in this box. */
  title: string;
  /** What actually lived here. */
  example: string;
  /** Face down: a box deliberately left empty. */
  off?: boolean;
};

type QuadrantProps = {
  /** Column labels, left then right. */
  x: [string, string];
  /** Row labels, top then bottom. */
  y: [string, string];
  /** Four cells in reading order: top left, top right, bottom left, bottom right. */
  cells: [QuadrantCell, QuadrantCell, QuadrantCell, QuadrantCell];
};

/**
 * A two-by-two grid for posts that talk in quadrants ("top right", "bottom
 * left"). Desktop shows column labels above and row labels down the side; on
 * mobile the cells stack and each one names its own row and column instead.
 */
export function Quadrant({ x, y, cells }: QuadrantProps) {
  return (
    <div className="quadrant col-wide mx-auto w-full max-w-[816px]">
      <div
        aria-hidden="true"
        className="ml-12 grid grid-cols-2 gap-3 pb-3 text-[0.8125rem] font-bold tracking-[0.08em] text-faint uppercase mob:hidden"
      >
        <span>{x[0]}</span>
        <span>{x[1]}</span>
      </div>
      <div className="grid grid-cols-[36px_1fr_1fr] gap-3 mob:grid-cols-1">
        {cells.map((cell, i) => {
          const row = i < 2 ? 0 : 1;
          const col = i % 2;
          return (
            <div key={i} className="contents">
              {col === 0 && (
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center text-[0.8125rem] font-bold tracking-[0.08em] whitespace-nowrap text-faint uppercase [writing-mode:vertical-rl] rotate-180 mob:hidden"
                >
                  {y[row]}
                </span>
              )}
              <div
                className={`flex min-h-[208px] flex-col rounded-[20px] px-7 pt-6 pb-7 mob:min-h-0 mob:px-[22px] mob:pt-5 mob:pb-6 ${
                  cell.off ? 'border border-dashed border-faint bg-paper' : 'bg-raise'
                }`}
              >
                <p className="sr-only text-[0.8125rem] font-bold tracking-[0.08em] text-faint uppercase mob:not-sr-only mob:mb-3">
                  {y[row]} · {x[col]}
                </p>
                <p className="flex items-baseline gap-2.5">
                  <span className="text-[0.9375rem] font-medium text-faint">Level</span>
                  <span
                    className={`text-[2.75rem] leading-[0.9] font-bold tracking-[-0.04em] tabular-nums ${
                      cell.off ? 'text-faint line-through decoration-2' : 'text-accent'
                    }`}
                  >
                    {cell.level}
                  </span>
                </p>
                <p className="mt-auto pt-6 text-[1.1875rem] leading-[1.3] font-bold tracking-[-0.012em] text-ink mob:pt-4">
                  {cell.title}
                </p>
                <p className="mt-1.5 text-[1rem] leading-[1.45] text-muted">{cell.example}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
