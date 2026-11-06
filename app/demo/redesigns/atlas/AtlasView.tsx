'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ConceptPost, ThemeId } from '../_lib/data';

type Theme = { id: ThemeId; name: string; colour: string };

const INK = '#121417';
const MUTED = '#5B6068';
const PAPER = '#F3F1EA';
const mono = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' } as const;

function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setSeen(true), io.disconnect()), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function CountUp({ value, run }: { value: number; run: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setN(value);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);
  return <>{n.toLocaleString('en-GB')}</>;
}

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'Undated';

// ---------------------------------------------------------------- River
const RW = 1200;
const LANE = 128;
const TOP = 70;
const LEFT = 150;
const X0 = Date.UTC(2015, 0, 1);
const X1 = Date.UTC(2027, 0, 1);
const xOf = (d: string) => LEFT + ((Date.parse(`${d}T00:00:00Z`) - X0) / (X1 - X0)) * (RW - LEFT - 30);
const r1 = (n: number) => Math.round(n * 10) / 10;
const rOf = (w: number) => 5 + Math.sqrt(w / 2000) * 13;

function layoutRiver(posts: ConceptPost[], themes: Theme[]) {
  const laneOf = (id: ThemeId) => themes.findIndex((t) => t.id === id);
  const placed: { x: number; y: number; r: number; lane: number }[] = [];
  const nodes = [...posts]
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .map((p) => {
      const lane = laneOf(p.themes[0]);
      const x = xOf(p.date ?? '2015-01-01');
      const r = rOf(p.words);
      const mid = TOP + lane * LANE + LANE / 2;
      let y = mid;
      for (let k = 0; k < 20; k++) {
        const off = k === 0 ? 0 : Math.ceil(k / 2) * 15 * (k % 2 ? -1 : 1);
        y = mid + off;
        if (!placed.some((q) => q.lane === lane && Math.hypot(q.x - x, q.y - y) < q.r + r + 2)) break;
      }
      placed.push({ x, y, r, lane });
      const extra = p.themes.slice(1).map((t) => ({ theme: t, y: TOP + laneOf(t) * LANE + LANE / 2 }));
      return { post: p, x, y, r, lane, extra };
    });
  return nodes;
}

// ---------------------------------------------------------------- Map
const MW = 1200;
const MH = 700;
function layoutMap(posts: ConceptPost[], themes: Theme[]) {
  const cx = MW / 2;
  const cy = MH / 2 + 20;
  const hubs = themes.map((t, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / themes.length;
    return { ...t, x: r1(cx + Math.cos(a) * 250), y: r1(cy + Math.sin(a) * 225), a };
  });
  const hubOf = (id: ThemeId) => hubs.find((h) => h.id === id)!;
  const singles = new Map<ThemeId, ConceptPost[]>();
  const pairs = new Map<string, ConceptPost[]>();
  posts.forEach((p) => {
    if (p.themes.length === 1) singles.set(p.themes[0], [...(singles.get(p.themes[0]) ?? []), p]);
    else pairs.set(p.themes.join('|'), [...(pairs.get(p.themes.join('|')) ?? []), p]);
  });
  const nodes: { post: ConceptPost; x: number; y: number }[] = [];
  singles.forEach((list, id) => {
    const h = hubOf(id);
    list.forEach((post, i) => {
      const spread = Math.PI * 1.1;
      const a = h.a - spread / 2 + (spread * (i + 0.5)) / list.length;
      nodes.push({ post, x: r1(h.x + Math.cos(a) * 92), y: r1(h.y + Math.sin(a) * 82) });
    });
  });
  pairs.forEach((list) => {
    const [a, b] = list[0].themes.map(hubOf);
    const mx = (a.x + b.x) / 2 * 0.86 + cx * 0.14;
    const my = (a.y + b.y) / 2 * 0.86 + cy * 0.14;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    list.forEach((post, i) => {
      const off = (i - (list.length - 1) / 2) * 34;
      nodes.push({ post, x: r1(mx + nx * off), y: r1(my + ny * off) });
    });
  });
  return { hubs, nodes };
}

export function AtlasView({ posts, themes }: { posts: ConceptPost[]; themes: Theme[] }) {
  const [focus, setFocus] = useState<ThemeId | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [statsRef, statsSeen] = useInView<HTMLDivElement>(0.3);
  const [riverRef, riverSeen] = useInView<HTMLDivElement>(0.15);
  const [mapRef, mapSeen] = useInView<HTMLDivElement>(0.15);
  const [barsRef, barsSeen] = useInView<HTMLDivElement>(0.1);
  // On a narrow screen the river scrolls sideways; start at the recent end, where most posts are.
  useEffect(() => {
    const el = riverRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [riverRef]);

  const colour = (id: ThemeId) => themes.find((t) => t.id === id)!.colour;
  const river = useMemo(() => layoutRiver(posts, themes), [posts, themes]);
  const map = useMemo(() => layoutMap(posts, themes), [posts, themes]);
  const byLength = useMemo(() => [...posts].sort((a, b) => b.words - a.words), [posts]);
  const totalWords = posts.reduce((s, p) => s + p.words, 0);
  const totalMinutes = posts.reduce((s, p) => s + p.readingMinutes, 0);
  const years = new Set(posts.map((p) => p.date?.slice(0, 4))).size;
  const firstYear = posts.at(-1)?.date?.slice(0, 4);
  const lit = (p: ConceptPost) => (!focus || p.themes.includes(focus)) && (!hover || hover === p.slug);
  const hovered = posts.find((p) => p.slug === hover);
  const hoveredNode = river.find((n) => n.post.slug === hover);
  const cluster = river.filter((n) => n.post.importDate);
  const clusterX = cluster[0]?.x ?? 0;

  return (
    <div
      className="rd-root atlas min-h-screen"
      style={{
        background: PAPER,
        color: INK,
        backgroundImage:
          'linear-gradient(rgba(18,20,23,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(18,20,23,.045) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <style>{`
        .atlas .dot { transform-box: fill-box; transform-origin: center; transition: opacity .25s, transform .7s cubic-bezier(.16,1,.3,1); }
        .atlas [data-on="false"] .dot { transform: scale(0); }
        .atlas .thread { stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke-dashoffset 1s cubic-bezier(.16,1,.3,1), opacity .25s; }
        .atlas [data-on="false"] .thread { stroke-dashoffset: 1; }
        .atlas .float { animation: atlas-float 6s ease-in-out infinite alternate; transform-box: fill-box; }
        @keyframes atlas-float { from { transform: translateY(-3px); } to { transform: translateY(3px); } }
        .atlas .bar { transition: width 1.1s cubic-bezier(.16,1,.3,1); }
        @media (prefers-reduced-motion: reduce) {
          .atlas .dot, .atlas .thread, .atlas .bar { transition: none; }
          .atlas [data-on="false"] .dot { transform: none; }
          .atlas [data-on="false"] .thread { stroke-dashoffset: 0; }
          .atlas .float { animation: none; }
        }
      `}</style>

      {/* Header */}
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-6 pt-8 text-[13px] uppercase tracking-[0.12em]" style={mono}>
        <Link href="/demo/redesigns" className="no-underline" style={{ color: INK }}>
          Ben Stewart <span style={{ color: MUTED }}>/ atlas</span>
        </Link>
        <nav className="flex gap-6 mob:hidden" style={{ color: MUTED }}>
          <span>posts</span><span>map</span><span>bio</span><span>speaking</span>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1240px] px-6 pt-20 mob:pt-12">
        <p className="text-[13px] uppercase tracking-[0.14em]" style={{ ...mono, color: MUTED }}>
          Field reports from an engineer turned leader, {firstYear} to now
        </p>
        <h1 className="mt-5 max-w-[17ch] text-[clamp(44px,7vw,96px)] font-bold leading-[0.95] tracking-[-0.04em]">
          {posts.length} posts. {years} years. Five things I keep coming back to.
        </h1>
        <div ref={statsRef} className="mt-14 grid grid-cols-4 border-t-2 mob:grid-cols-2" style={{ borderColor: INK }}>
          {[
            { v: totalWords, l: 'words written' },
            { v: totalMinutes, l: 'minutes of reading' },
            { v: posts.length, l: 'posts' },
            { v: Math.max(...posts.map((p) => p.words)), l: 'words in the longest' },
          ].map((s) => (
            <div key={s.l} className="border-r py-5 pr-4 last:border-r-0 mob:[&:nth-child(2)]:border-r-0" style={{ borderColor: 'rgba(18,20,23,.15)' }}>
              <div className="text-[clamp(32px,4.4vw,56px)] font-bold leading-none tracking-[-0.03em]" style={mono}>
                <CountUp value={s.v} run={statsSeen} />
              </div>
              <div className="mt-2 text-[13px] uppercase tracking-[0.1em]" style={{ ...mono, color: MUTED }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Theme chips */}
      <div className="sticky top-0 z-20 mt-16 border-y backdrop-blur" style={{ borderColor: 'rgba(18,20,23,.12)', background: 'rgba(243,241,234,.85)' }}>
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-6 py-3">
          <span className="mr-2 text-[12px] uppercase tracking-[0.12em]" style={{ ...mono, color: MUTED }}>Filter</span>
          {themes.map((t) => {
            const on = focus === t.id;
            const count = posts.filter((p) => p.themes.includes(t.id)).length;
            return (
              <button
                key={t.id}
                onClick={() => setFocus(on ? null : t.id)}
                className="inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors"
                style={{ borderColor: on ? t.colour : 'rgba(18,20,23,.2)', background: on ? t.colour : 'transparent', color: on ? '#fff' : INK }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: on ? '#fff' : t.colour }} />
                {t.name} <span style={{ ...mono, opacity: 0.7 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* River */}
      <section className="mx-auto max-w-[1240px] px-6 pt-16">
        <SectionLabel n="01" title="The river" note="Every post on a timeline. Size is length; a thread means it belongs to two themes." />
        <div ref={riverRef} className="relative mt-8 overflow-x-auto">
          <svg viewBox={`0 0 ${RW} ${TOP + LANE * themes.length + 40}`} className="block w-full min-w-[860px]" data-on={riverSeen} onMouseLeave={() => setHover(null)}>
            {themes.map((t, i) => (
              <g key={t.id} opacity={!focus || focus === t.id ? 1 : 0.3} style={{ transition: 'opacity .25s' }}>
                <line x1={LEFT} x2={RW - 20} y1={TOP + i * LANE + LANE / 2} y2={TOP + i * LANE + LANE / 2} stroke={t.colour} strokeOpacity={0.25} strokeDasharray="2 5" />
                <text x={0} y={TOP + i * LANE + LANE / 2 + 5} fontSize={14} fontWeight={700} fill={t.colour}>{t.name}</text>
              </g>
            ))}
            {Array.from({ length: 12 }, (_, i) => 2015 + i).map((y) => (
              <g key={y}>
                <line x1={xOf(`${y}-01-01`)} x2={xOf(`${y}-01-01`)} y1={TOP - 14} y2={TOP + LANE * themes.length} stroke={INK} strokeOpacity={0.08} />
                <text x={xOf(`${y}-01-01`) + 4} y={TOP - 20} fontSize={12} fill={MUTED} style={mono}>{y}</text>
              </g>
            ))}
            {cluster.length > 1 && (
              <g>
                <path d={`M${clusterX - 26} ${TOP + LANE * themes.length + 8} v8 h52 v-8`} fill="none" stroke={INK} strokeOpacity={0.5} />
                <text x={clusterX - 34} y={TOP + LANE * themes.length + 22} textAnchor="end" fontSize={12} fill={MUTED} style={mono}>
                  {cluster.length} posts carry the Substack import date; their real dates were lost
                </text>
              </g>
            )}
            {river.map((n, i) => (
              <g key={n.post.slug} opacity={lit(n.post) ? 1 : 0.12} style={{ transition: 'opacity .25s' }}>
                {n.extra.map((e) => (
                  <g key={e.theme}>
                    <line className="thread" pathLength={1} x1={n.x} y1={n.y} x2={n.x} y2={e.y} stroke={colour(e.theme)} strokeWidth={1.5} strokeOpacity={0.6} style={{ transitionDelay: `${400 + i * 40}ms` }} />
                    <circle className="dot" cx={n.x} cy={e.y} r={3.5} fill={colour(e.theme)} style={{ transitionDelay: `${500 + i * 40}ms` }} />
                  </g>
                ))}
                <Link href={`/posts/${n.post.slug}`} aria-label={n.post.title}>
                  <circle
                    className="dot cursor-pointer"
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={colour(n.post.themes[0])}
                    stroke={PAPER}
                    strokeWidth={2}
                    style={{ transitionDelay: `${i * 40}ms` }}
                    onMouseEnter={() => setHover(n.post.slug)}
                    onFocus={() => setHover(n.post.slug)}
                  />
                </Link>
              </g>
            ))}
          </svg>
          {hovered && hoveredNode && (
            <div
              className="pointer-events-none absolute z-10 w-[280px] rounded-2xl p-4 shadow-[0_12px_40px_rgba(18,20,23,.18)]"
              style={{
                background: INK,
                color: PAPER,
                left: `${Math.min(78, (hoveredNode.x / RW) * 100)}%`,
                top: `${(hoveredNode.y / (TOP + LANE * themes.length + 40)) * 100}%`,
                transform: 'translate(-50%, calc(-100% - 18px))',
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.12em] opacity-70" style={mono}>
                {hovered.importDate ? 'Imported 2023' : fmtDate(hovered.date)} · {hovered.words.toLocaleString('en-GB')} words
              </div>
              <div className="mt-1.5 text-[17px] font-bold leading-tight">{hovered.title}</div>
              {hovered.subtitle && <div className="mt-1 font-serif text-[14px] italic opacity-80">{hovered.subtitle}</div>}
            </div>
          )}
        </div>
      </section>

      {/* Map */}
      <section className="mx-auto max-w-[1240px] px-6 pt-28">
        <SectionLabel n="02" title="The map" note="Posts sit between the themes they belong to. The middle is where the overlaps live." />
        <div ref={mapRef} className="mt-6 overflow-x-auto">
          <svg viewBox={`0 0 ${MW} ${MH}`} className="block w-full" data-on={mapSeen} onMouseLeave={() => setHover(null)}>
            {map.nodes.map((n, i) =>
              n.post.themes.map((t) => {
                const h = map.hubs.find((x) => x.id === t)!;
                return (
                  <line key={n.post.slug + t} className="thread" pathLength={1} x1={h.x} y1={h.y} x2={n.x} y2={n.y} stroke={h.colour}
                    strokeOpacity={lit(n.post) ? 0.45 : 0.06} strokeWidth={1.25} style={{ transitionDelay: `${200 + i * 30}ms` }} />
                );
              })
            )}
            {map.hubs.map((h) => {
              const count = posts.filter((p) => p.themes.includes(h.id)).length;
              const on = !focus || focus === h.id;
              return (
                <g key={h.id} className="cursor-pointer" onClick={() => setFocus(focus === h.id ? null : h.id)} opacity={on ? 1 : 0.35} style={{ transition: 'opacity .25s' }}>
                  <circle className="dot" cx={h.x} cy={h.y} r={22 + count * 1.6} fill={h.colour} />
                  <text x={h.x} y={h.y + 6} textAnchor="middle" fontSize={18} fontWeight={700} fill="#fff" style={mono}>{count}</text>
                  <text x={h.x} y={h.y < MH / 2 ? h.y + 22 + count * 1.6 + 22 : h.y - 22 - count * 1.6 - 12} textAnchor="middle" fontSize={16} fontWeight={700} fill={h.colour}>{h.name}</text>
                </g>
              );
            })}
            {map.nodes.map((n, i) => (
              <Link key={n.post.slug} href={`/posts/${n.post.slug}`} aria-label={n.post.title}>
                <g className="float" style={{ animationDelay: `${-i * 0.7}s` }} opacity={lit(n.post) ? 1 : 0.15}
                  onMouseEnter={() => setHover(n.post.slug)}>
                  <circle className="dot" cx={n.x} cy={n.y} r={rOf(n.post.words) * 0.9} fill={PAPER} stroke={INK} strokeWidth={2} style={{ transitionDelay: `${i * 30}ms` }} />
                  {hover === n.post.slug && (
                    <g>
                      <rect x={n.x + 14} y={n.y - 15} width={Math.min(420, n.post.title.length * 8.6 + 24)} height={30} rx={15} fill={INK} />
                      <text x={n.x + 26} y={n.y + 5} fontSize={14} fontWeight={700} fill={PAPER}>{n.post.title}</text>
                    </g>
                  )}
                </g>
              </Link>
            ))}
          </svg>
        </div>
      </section>

      {/* Lengths */}
      <section className="mx-auto max-w-[1240px] px-6 pt-24">
        <SectionLabel n="03" title="How long I go on for" note="Every post by word count. The longest thing here is about AI agents arguing; the post about attention debt is one of the shortest, which is at least consistent." />
        <div ref={barsRef} className="mt-10 grid gap-1.5">
          {byLength.map((p, i) => (
            <Link key={p.slug} href={`/posts/${p.slug}`} className="group grid grid-cols-[minmax(0,320px)_1fr] items-center gap-4 no-underline mob:grid-cols-1 mob:gap-1"
              style={{ color: INK, opacity: !focus || p.themes.includes(focus) ? 1 : 0.2, transition: 'opacity .25s' }}>
              <span className="truncate text-[15px] font-medium group-hover:underline">{p.title}</span>
              <span className="flex items-center gap-3">
                <span className="bar block h-[14px] rounded-full" style={{ width: barsSeen ? `${(p.words / byLength[0].words) * 82}%` : '0%', background: colour(p.themes[0]), transitionDelay: `${i * 35}ms` }} />
                <span className="text-[12px]" style={{ ...mono, color: MUTED }}>{p.words.toLocaleString('en-GB')}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Index */}
      <section className="mx-auto max-w-[1240px] px-6 pb-32 pt-24">
        <SectionLabel n="04" title="Index" note={focus ? `Showing ${themes.find((t) => t.id === focus)!.name.toLowerCase()}.` : 'Everything, newest first.'} />
        <ul className="mt-8 border-t-2" style={{ borderColor: INK }}>
          {posts.filter((p) => !focus || p.themes.includes(focus)).map((p) => (
            <li key={p.slug} className="border-b" style={{ borderColor: 'rgba(18,20,23,.14)' }}>
              <Link href={`/posts/${p.slug}`} className="grid grid-cols-[110px_1fr_auto] items-baseline gap-6 py-4 no-underline mob:grid-cols-[1fr_auto] mob:gap-2" style={{ color: INK }}>
                <span className="text-[13px] mob:hidden" style={{ ...mono, color: MUTED }}>{p.importDate ? '2023*' : fmtDate(p.date)}</span>
                <span>
                  <span className="text-[19px] font-bold tracking-[-0.01em]">{p.title}</span>
                  {p.quote && <span className="mt-1 block font-serif text-[15px] italic" style={{ color: MUTED }}>{p.quote}</span>}
                </span>
                <span className="flex gap-1.5">
                  {p.themes.map((t) => <span key={t} className="h-3 w-3 rounded-full" style={{ background: colour(t) }} />)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SectionLabel({ n, title, note }: { n: string; title: string; note: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-baseline gap-4 mob:grid-cols-1 mob:gap-1">
      <span className="text-[13px] tracking-[0.12em]" style={{ ...mono, color: MUTED }}>{n}</span>
      <div>
        <h2 className="text-[clamp(28px,3.4vw,44px)] font-bold leading-none tracking-[-0.03em]">{title}</h2>
        <p className="mt-3 max-w-[60ch] text-[16px]" style={{ color: MUTED }}>{note}</p>
      </div>
    </div>
  );
}
