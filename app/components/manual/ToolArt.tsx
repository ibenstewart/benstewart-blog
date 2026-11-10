/**
 * The small drawing for each tool in the toolkit (lib/manual-data.mjs TOOLS).
 * Decorative: the tool's name already says what it is, so every drawing is
 * aria-hidden. Motion lives in globals.css (.tool-*) and only plays on hover
 * or focus, never on its own.
 */
const INK = 'var(--ink)';
const BLUE = 'var(--accent)';
const HI = 'var(--hi)';
const GREY = 'var(--faint)';

export function ToolArt({ id }: { id: string }) {
  switch (id) {
    case 'waist':
      return (
        <div aria-hidden className="flex h-full flex-col justify-center gap-0.5 text-[1.875rem] leading-[0.95] font-bold tracking-[-0.02em] text-ink">
          {['Why', 'Am', 'I', 'Still', 'Talking'].map((w) => (
            <span key={w}>
              <span className="bg-hi">{w[0]}</span>
              {w.slice(1)}
            </span>
          ))}
        </div>
      );
    case 'boss': {
      const r = 70;
      const C = 2 * Math.PI * r;
      const parts: [number, number, string][] = [[0, 25, INK], [25, 75, BLUE], [75, 100, HI]];
      return (
        <svg aria-hidden viewBox="0 0 200 200" className="mx-auto h-full">
          {parts.map(([a, b, c], i) => (
            <circle key={i} className="tool-donut" cx="100" cy="100" r={r} fill="none" stroke={c} strokeWidth="34"
              strokeDasharray={`${((b - a) / 100) * C - 3} ${C}`} strokeDashoffset={-(a / 100) * C} transform="rotate(-90 100 100)" />
          ))}
          <text x="100" y="108" textAnchor="middle" fontSize="22" fontWeight="700" fill={INK}>you</text>
        </svg>
      );
    }
    case 'two-questions':
      return (
        <div aria-hidden className="grid h-full grid-cols-2 grid-rows-2 gap-1.5 font-mono text-[0.8125rem] font-bold">
          <div className="rounded-lg bg-hi p-3 text-ink">Cheap if wrong<br />Easy to check</div>
          <div className="rounded-lg border-2 border-ink p-3 text-ink">Costly if wrong<br />Easy to check</div>
          <div className="rounded-lg border-2 border-ink p-3 text-ink">Cheap if wrong<br />Hard to check</div>
          <div className="rounded-lg bg-ink p-3 text-white">Costly if wrong<br />Hard to check</div>
        </div>
      );
    case 'deep-wide':
      return (
        <svg aria-hidden viewBox="0 0 200 200" className="mx-auto h-full">
          <rect x="20" y="40" width="160" height="26" fill={BLUE} />
          <rect x="87" y="66" width="26" height="114" fill={INK} />
          <text x="100" y="32" textAnchor="middle" fontSize="14" fill={GREY} fontFamily="var(--font-mono)">wide</text>
          <text x="124" y="150" fontSize="14" fill={GREY} fontFamily="var(--font-mono)">deep</text>
        </svg>
      );
    case 'watermelon':
      return (
        <svg aria-hidden viewBox="0 0 200 200" className="mx-auto h-full">
          <path d="M100 22 C100 12 106 8 114 8" fill="none" stroke="#1F6B3C" strokeWidth="5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="80" fill="#2E9E5B" />
          {[0, 26, 52, 71].map((rx) => (
            <ellipse key={rx} cx="100" cy="100" rx={rx || 0.01} ry="77" fill="none" stroke="#1F6B3C" strokeWidth="7" />
          ))}
          <g className="tool-reveal">
            <circle cx="100" cy="100" r="66" fill="#E8484F" />
            {[[80, 80], [120, 90], [95, 120], [70, 110], [125, 125]].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="4" ry="7" fill={INK} />
            ))}
          </g>
        </svg>
      );
    case 'channels':
      return (
        <div aria-hidden className="flex h-full items-center justify-center gap-2 text-[2.25rem] font-bold text-ink mob:gap-1.5">
          {['↑', '↑', '↓', '↓', '←', '→'].map((a, i) => (
            <span key={i} className="tool-key grid h-14 w-12 place-items-center rounded-lg border-2 border-b-[5px] border-ink" style={{ ['--i' as string]: i }}>
              {a}
            </span>
          ))}
        </div>
      );
    default:
      return null;
  }
}
