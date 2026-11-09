/**
 * The career drawn as a climb: the timeline's roles as points on a hatched
 * hillside, a trail that draws itself in once, and a flag at the top. The
 * points are the same list as the timeline under it (ROUTE), so the two
 * can't drift. The SVG is one image to a screen reader; the list is the text.
 */

export type Waypoint = { year: number; title: string; org: string; note: string; level: number };

const PAPER = 'var(--paper)';
const INK = 'var(--ink)';
const BLUE = 'var(--accent)';
const HI = 'var(--hi)';
const MONO = 'var(--font-mono)';

const VW = 1200;
const VH = 440;
const X = (year: number) => 70 + ((year - 2006) / 20) * 1060;
const Y = (level: number) => 392 - level * 44;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Catmull-Rom through the points, as cubic Béziers. */
function smooth(pts: [number, number][]) {
  let d = `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])},${r1(c1[1])} ${r1(c2[0])},${r1(c2[1])} ${r1(p2[0])},${r1(p2[1])}`;
  }
  return d;
}

const MILESTONES = [
  { year: 2006, label: 'STARTED WRITING SQL', dx: -10, dy: -66, anchor: 'start', lead: true },
  { year: 2012, label: 'FIRST TEAM TO LEAD', dx: 0, dy: -66, anchor: 'middle', lead: true },
  { year: 2019, label: 'JOINS SKYSCANNER', dx: 0, dy: -66, anchor: 'middle', lead: true },
  { year: 2026, label: 'VP OF ENGINEERING', dx: -22, dy: -40, anchor: 'end', lead: false },
] as const;

export function RouteChart({ route }: { route: Waypoint[] }) {
  const pts = route.map((s) => [X(s.year), Y(s.level)] as [number, number]);
  const trail = smooth(pts);
  const hill = `${smooth([[0, Y(0.7)], ...pts, [VW, Y(5.9)]])} L${VW},${VH} L0,${VH} Z`;
  const far = `${smooth([[0, Y(2.4)], [180, Y(3.3)], [420, Y(2.6)], [640, Y(4.6)], [880, Y(3.8)], [1040, Y(5.4)], [VW, Y(4.4)]])} L${VW},${VH} L0,${VH} Z`;
  const top = route[route.length - 1];
  const at = (year: number) => route.find((s) => s.year === year);
  const first = route[0];

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="block w-full"
      role="img"
      aria-label={`Career drawn as a climb, from ${first.title.toLowerCase()} in ${first.year} to ${top.title} in ${top.year}`}
    >
      <defs>
        <pattern id="route-hatch" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M1 0V7" stroke={BLUE} strokeWidth="1.4" opacity=".55" />
        </pattern>
        <pattern id="route-hatch-far" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M1 0V9" stroke={PAPER} strokeWidth="1.2" opacity=".32" />
        </pattern>
      </defs>
      <path d={far} fill="url(#route-hatch-far)" />
      <path d={hill} fill={PAPER} />
      <path d={hill} fill="url(#route-hatch)" />
      <path d={trail} fill="none" stroke={PAPER} strokeWidth="11" strokeLinecap="round" />
      <path d={trail} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" pathLength={1} className="route-trail" />
      {route.map((s) => (
        <circle key={s.year} cx={r1(X(s.year))} cy={r1(Y(s.level))} r="7.5" fill={PAPER} stroke={INK} strokeWidth="3.5" />
      ))}
      <g className="route-flag">
        <line x1={X(top.year)} y1={Y(top.level)} x2={X(top.year)} y2={Y(top.level) - 54} stroke={INK} strokeWidth="3" />
        <path d={`M${X(top.year)},${Y(top.level) - 54} l34,10 l-34,10 z`} fill={HI} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      {MILESTONES.map((m) => {
        const s = at(m.year);
        if (!s) return null;
        return (
          <g key={m.year}>
            {m.lead && (
              <line x1={r1(X(s.year))} y1={r1(Y(s.level) - 12)} x2={r1(X(s.year))} y2={r1(Y(s.level) + m.dy + 8)}
                stroke={PAPER} strokeWidth="1.5" strokeDasharray="3 4" opacity=".7" />
            )}
            <text x={r1(X(s.year) + m.dx)} y={r1(Y(s.level) + m.dy)} textAnchor={m.anchor}
              style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.08em', fill: PAPER }}>
              <tspan style={{ fill: HI }}>{m.year}</tspan> · {m.label}
            </text>
          </g>
        );
      })}
      {[2006, 2010, 2014, 2018, 2022, 2026].map((y) => (
        <text key={y} x={r1(X(y))} y={VH - 8} textAnchor="middle"
          style={{ fontFamily: MONO, fontSize: 14, fill: INK, letterSpacing: '0.08em', paintOrder: 'stroke', stroke: PAPER, strokeWidth: 6 }}>
          {y}
        </text>
      ))}
    </svg>
  );
}
