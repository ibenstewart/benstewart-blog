import Link from 'next/link';
import { VoxelHead } from './VoxelHead';
import { VOXEL } from './voxel-data';
import { getConceptPosts, THEMES } from '../../_lib/data';
import { BG, BLUE, GREY, HI, INK, MANUAL_CSS, chapters, entryHref, mono } from '../content';
import { ManualFooter, ManualTopBar } from '../chrome';
import { CopyBio } from './CopyBio';

export const metadata = { title: 'About the author · Field manual' };

const SHORT_BIO =
  "Ben Stewart is VP of Engineering at Skyscanner, based in Glasgow. He writes field reports at benstewart.ai about leading engineering teams through AI: what's working, what's breaking and what the data says, in plain English. He started his career writing SQL in 2006.";

/** The timeline from /bio. `level` is only for drawing the climb. */
const ROUTE = [
  { year: 2006, title: 'Software Developer', org: 'Arnold Clark', note: 'Began career writing code. SQL, .NET, and a lot of learning.', level: 1 },
  { year: 2008, title: 'Engineer', org: 'Glasgow Science Centre', note: 'SCIENCE!', level: 1.05 },
  { year: 2010, title: 'Engineer', org: 'City Technologies', note: 'Built software and ran systems for large telephone and energy companies.', level: 1.35 },
  { year: 2012, title: 'Team Lead', org: 'CityFM', note: 'Took on people responsibilities for the very first time.', level: 2.2 },
  { year: 2014, title: 'Engineering Manager', org: 'CityFM', note: 'Took on more teams and made them faster.', level: 3 },
  { year: 2016, title: 'Head of Software Engineering', org: 'CityFM', note: 'Ran teams in the UK, US and Malaysia for blue-chip clients including Asda, Marks & Spencer and Walmart.', level: 3.9 },
  { year: 2019, title: 'Senior Engineering Manager', org: 'Skyscanner', note: 'Joined to build manager culture and teams across several countries.', level: 4.3 },
  { year: 2020, title: 'Director of Engineering', org: 'Skyscanner', note: 'Scaled the organisation and how it delivered.', level: 4.9 },
  { year: 2024, title: 'Senior Director', org: 'Skyscanner', note: 'Leading engineering across several product areas.', level: 6 },
  { year: 2026, title: 'VP of Engineering', org: 'Skyscanner', note: 'Running a 250-engineer org through the AI transition.', level: 7 },
];

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

const PTS = ROUTE.map((s) => [X(s.year), Y(s.level)] as [number, number]);
const TRAIL = smooth(PTS);
const HILL = `${smooth([[0, Y(0.7)], ...PTS, [VW, Y(5.9)]])} L${VW},${VH} L0,${VH} Z`;
const FAR = smooth([[0, Y(2.4)], [180, Y(3.3)], [420, Y(2.6)], [640, Y(4.6)], [880, Y(3.8)], [1040, Y(5.4)], [VW, Y(4.4)]]) + ` L${VW},${VH} L0,${VH} Z`;

const MILESTONES = [
  { year: 2006, label: 'STARTED WRITING SQL', dx: -10, dy: -66, anchor: 'start', lead: true },
  { year: 2012, label: 'FIRST TEAM TO LEAD', dx: 0, dy: -66, anchor: 'middle', lead: true },
  { year: 2019, label: 'JOINS SKYSCANNER', dx: 0, dy: -66, anchor: 'middle', lead: true },
  { year: 2026, label: 'VP OF ENGINEERING', dx: -22, dy: -40, anchor: 'end', lead: false },
] as const;

function RouteChart() {
  const at = (year: number) => ROUTE.find((s) => s.year === year)!;
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="block w-full" role="img"
      aria-label="Career drawn as a climb, from software developer in 2006 to VP of Engineering in 2026">
      <defs>
        <pattern id="fm-hatch" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M1 0V7" stroke={BLUE} strokeWidth="1.4" opacity=".55" />
        </pattern>
        <pattern id="fm-hatch-far" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M1 0V9" stroke={BG} strokeWidth="1.2" opacity=".32" />
        </pattern>
      </defs>
      <path d={FAR} fill="url(#fm-hatch-far)" />
      <path d={HILL} fill={BG} />
      <path d={HILL} fill="url(#fm-hatch)" />
      <path d={TRAIL} fill="none" stroke={BG} strokeWidth="11" strokeLinecap="round" />
      <path d={TRAIL} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" pathLength={1} className="fm-trail" />
      {ROUTE.map((s) => (
        <circle key={s.year} cx={r1(X(s.year))} cy={r1(Y(s.level))} r="7.5" fill={BG} stroke={INK} strokeWidth="3.5" />
      ))}
      {/* the summit flag */}
      <g className="fm-flag">
        <line x1={X(2026)} y1={Y(7)} x2={X(2026)} y2={Y(7) - 54} stroke={INK} strokeWidth="3" />
        <path d={`M${X(2026)},${Y(7) - 54} l34,10 l-34,10 z`} fill={HI} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      {MILESTONES.map((m) => {
        const s = at(m.year);
        return (
          <g key={m.year}>
          {m.lead && (
            <line x1={r1(X(s.year))} y1={r1(Y(s.level) - 12)} x2={r1(X(s.year))} y2={r1(Y(s.level) + m.dy + 8)}
              stroke={BG} strokeWidth="1.5" strokeDasharray="3 4" opacity=".7" />
          )}
          <text x={r1(X(s.year) + m.dx)} y={r1(Y(s.level) + m.dy)} textAnchor={m.anchor}
            style={{ ...mono, fontSize: 15, letterSpacing: '0.08em', fill: BG }}>
            <tspan style={{ fill: HI }}>{m.year}</tspan> · {m.label}
          </text>
          </g>
        );
      })}
      {[2006, 2010, 2014, 2018, 2022, 2026].map((y) => (
        <text key={y} x={r1(X(y))} y={VH - 8} textAnchor="middle" style={{ ...mono, fontSize: 14, fill: INK, letterSpacing: '0.08em', paintOrder: 'stroke', stroke: BG, strokeWidth: 6 }}>{y}</text>
      ))}
    </svg>
  );
}

export default async function BioPage() {
  const all = await getConceptPosts({ includeDrafts: true });
  const published = all.filter((p) => !p.draft);
  const chs = chapters(published, [...THEMES]);
  const label = 'text-[13px] tracking-[0.1em]';
  const h2 = 'mt-4 text-[clamp(36px,4.4vw,64px)] font-bold leading-[0.95] tracking-[-0.04em]';

  return (
    <div className="rd-root" style={{ background: BG, color: INK }}>
      <style>{MANUAL_CSS + `
        .fm-vox { background-image: linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px); background-size: 100% calc(100% / ${VOXEL.h} * 4), calc(100% / ${VOXEL.w} * 4) 100%; }
        .fm-trail { stroke-dasharray: 1; stroke-dashoffset: 1; animation: fm-draw 2.2s cubic-bezier(.45,0,.2,1) .2s forwards; }
        @keyframes fm-draw { to { stroke-dashoffset: 0; } }
        .fm-flag { transform-box: fill-box; transform-origin: 0 100%; animation: fm-plant .5s cubic-bezier(.16,1,.3,1) 2.2s both; }
        @keyframes fm-plant { from { transform: scaleY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .fm-trail { animation: none; stroke-dashoffset: 0; }
          .fm-flag { animation: none; }
        }
      `}</style>
      <ManualTopBar current="bio" />

      {/* Header: the author card and the author in his own words */}
      <header className="border-b-2 px-10 pb-14 pt-12 mob:px-6 mob:pb-10 mob:pt-8" style={{ borderColor: INK }}>
        <div className="mx-auto grid max-w-[1180px] grid-cols-[300px_minmax(0,1fr)] items-start gap-14 tab:grid-cols-[240px_minmax(0,1fr)] tab:gap-10 mob:grid-cols-1">
          <aside className="overflow-hidden rounded-3xl border-2 mob:grid mob:grid-cols-[144px_minmax(0,1fr)]" style={{ borderColor: INK, background: '#fff' }}>
            <div className="fm-vox mob:flex mob:items-end" style={{ background: BLUE }}>
              <VoxelHead className="w-full" />
            </div>
            <dl className="grid gap-3 p-5 text-[13px] tracking-[0.06em] mob:gap-2 mob:p-3.5 mob:text-[12px]" style={mono}>
              {[
                ['NAME', 'Ben Stewart'],
                ['ROLE', 'VP of Engineering, Skyscanner'],
                ['BASE', 'Glasgow'],
                ['IN THE FIELD SINCE', '2006'],
                ['ENTRIES FILED', String(published.length)],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_auto] gap-3 border-b pb-2.5 last:border-0 last:pb-0 mob:grid-cols-1 mob:gap-0 mob:pb-1.5" style={{ borderColor: 'rgba(14,15,18,.14)' }}>
                  <dt style={{ color: GREY }}>{k}</dt>
                  <dd className="text-right font-medium mob:text-left" style={{ color: INK }}>{v}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <div className="min-w-0">
            <p className={label} style={{ ...mono, color: GREY }}>APPENDIX A · ABOUT THE AUTHOR</p>
            <h1 className="mt-5 text-[clamp(44px,6.6vw,96px)] font-bold leading-[0.92] tracking-[-0.045em]">Engineer turned leader.</h1>
            <p className="mt-6 max-w-[30ch] text-[clamp(21px,2.1vw,28px)] font-medium leading-[1.3] tracking-[-0.01em]">
              <span className="fm-hl">I run engineering teams that are working out AI in real time, and I write about it here while it&apos;s still messy.</span>
            </p>
            <div className="mt-7 grid max-w-[62ch] gap-4 text-[19px] leading-[1.6]" style={{ color: GREY }}>
              <p>At home I have a wife, a daughter and a dog that I met in that exact order. I build things and help teams build better.</p>
              <p>Currently at Skyscanner, working on how technology, product, and people come together to make travel simpler.</p>
            </div>
            <ul className="mt-9 grid grid-cols-4 gap-3 cards:grid-cols-2">
              {[
                ['20', 'years in'],
                ['250', 'engineers'],
                [String(published.length), 'entries filed'],
                ['1', 'dog'],
              ].map(([n, l]) => (
                <li key={l} className="rounded-2xl border-2 px-4 py-4" style={{ borderColor: INK }}>
                  <span className="block text-[clamp(30px,3vw,42px)] font-bold leading-none tracking-[-0.03em]" style={mono}>{n}</span>
                  <span className="mt-2 block text-[13px] tracking-[0.08em]" style={{ ...mono, color: GREY }}>{l.toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* The route so far */}
      <section id="route" className="border-b-2 px-10 py-20 mob:px-6 mob:py-14" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className={label} style={{ ...mono, color: BLUE }}>A.1 · THE ROUTE SO FAR</p>
          <h2 className={h2}>Twenty years, one long climb.</h2>
          <p className="mt-5 max-w-[56ch] text-[19px] leading-[1.6]" style={{ color: GREY }}>
            From writing SQL at Arnold Clark in 2006 to running a 250-engineer org at Skyscanner. The flat bit at the start is three engineering jobs; the climb starts with the first team.
          </p>
          <div className="mt-10 overflow-hidden rounded-3xl border-2 tab:hidden" style={{ background: BLUE, borderColor: INK }}>
            <RouteChart />
          </div>
          <ol className="mt-12 grid grid-cols-2 gap-x-10 gap-y-2 mob:grid-cols-1">
            {[...ROUTE].reverse().map((s, i) => (
              <li key={s.year} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t-2 py-5" style={{ borderColor: i < 2 ? INK : 'rgba(14,15,18,.14)' }}>
                <span className="pt-1 text-[15px] font-medium" style={{ ...mono, color: BLUE }}>{s.year}</span>
                <span>
                  <span className="block text-[21px] font-bold leading-[1.15] tracking-[-0.015em]">{s.title}</span>
                  <span className="mt-1 block text-[13px] tracking-[0.08em]" style={{ ...mono, color: GREY }}>{s.org.toUpperCase()}</span>
                  <span className="mt-2 block text-[17px] leading-[1.5]" style={{ color: GREY }}>{s.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What the manual covers */}
      <section id="covers" className="border-b-2 px-10 py-20 mob:px-6 mob:py-14" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className={label} style={{ ...mono, color: BLUE }}>A.2 · WHAT THIS MANUAL COVERS</p>
          <h2 className={h2}>Field reports from the AI transition.</h2>
          <p className="mt-5 max-w-[62ch] text-[19px] leading-[1.6]" style={{ color: GREY }}>
            Mostly what happens when you run engineering teams through AI. Which tasks I hand over and which I keep, what it cost when I got that wrong, and the old processes teams keep running underneath the new tools. The view behind most of it is that AI adoption is a leadership problem before it&apos;s a tooling one. The older posts are about leadership from before AI turned up, and plenty of it still applies.
          </p>
          <ul className="mt-10 grid grid-cols-5 gap-4 tab:grid-cols-3 cards:grid-cols-2 mob:grid-cols-1">
            {chs.map(({ theme, number, entries }) => (
              <li key={theme.id}>
                <Link href={entries[0] ? entryHref(entries[0].post.slug) : '/demo/redesigns/manual#chapters'}
                  className="group flex h-full flex-col rounded-3xl border-2 p-5 no-underline transition-transform hover:-translate-y-1" style={{ borderColor: INK, color: INK, background: '#fff' }}>
                  <span className="h-1.5 w-10 rounded-full" style={{ background: theme.colour }} aria-hidden />
                  <span className="mt-4 text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>CHAPTER {number}</span>
                  <span className="mt-1 text-[22px] font-bold leading-[1.05] tracking-[-0.02em]">{theme.name}</span>
                  <span className="mt-auto pt-6 text-[14px] font-medium" style={mono}>
                    {entries.length} {entries.length === 1 ? 'entry' : 'entries'} <span className="nudge inline-block" aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[17px]">
            <Link href="/demo/redesigns/manual/entries" className="font-bold underline decoration-2 underline-offset-4" style={{ color: INK, textDecorationColor: BLUE }}>
              Or read them in order: every entry, newest first
            </Link>
          </p>
        </div>
      </section>

      {/* For organisers */}
      <section id="short-bio" className="px-10 py-20 mob:px-6 mob:py-14">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 tab:grid-cols-1">
          <div>
            <p className={label} style={{ ...mono, color: BLUE }}>A.3 · FOR ORGANISERS AND HOSTS</p>
            <h2 className={h2}>Short bio, copy as is.</h2>
            <blockquote className="mt-8 rounded-3xl border-2 p-7 text-[20px] leading-[1.55]" style={{ borderColor: INK, background: '#fff' }}>
              {SHORT_BIO}
            </blockquote>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <CopyBio text={SHORT_BIO} />
              <a href="/images/ben-stewart.jpg" download className="inline-flex h-11 items-center rounded-xl border-2 px-4 text-[16px] font-bold no-underline" style={{ borderColor: INK, color: INK }}>
                Download photo
              </a>
            </div>
          </div>
          <div className="grid content-end gap-4">
            <Link href="/demo/redesigns/manual/speaking" className="group block rounded-3xl p-7 no-underline transition-transform hover:-translate-y-1" style={{ background: BLUE, color: '#fff' }}>
              <span className="block text-[13px] tracking-[0.1em] opacity-80" style={mono}>HOST A PODCAST OR RUN AN EVENT?</span>
              <span className="mt-3 block text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">Here&apos;s what I talk about <span className="nudge inline-block" style={{ color: HI }} aria-hidden>→</span></span>
            </Link>
            <a href="mailto:ben@benstewart.ai" className="group block rounded-3xl p-7 no-underline transition-transform hover:-translate-y-1" style={{ background: INK, color: BG }}>
              <span className="block text-[13px] tracking-[0.1em] opacity-80" style={mono}>ANYTHING ELSE</span>
              <span className="mt-3 block text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">ben@benstewart.ai <span className="nudge inline-block" style={{ color: HI }} aria-hidden>→</span></span>
            </a>
          </div>
        </div>
      </section>

      <ManualFooter status="GLASGOW · APPENDIX A · ABOUT THE AUTHOR" />
    </div>
  );
}
