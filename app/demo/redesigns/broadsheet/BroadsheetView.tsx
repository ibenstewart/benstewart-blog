'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ConceptPost, ThemeId } from '../_lib/data';
import { SceneFooter } from '../_lib/SceneFooter';

type Theme = { id: ThemeId; name: string; colour: string };

const PAPER = '#F2ECDF';
const INK = '#171512';
const GREY = '#5A554C';
const RED = '#B8322A';
const display = { fontFamily: 'var(--font-fraunces), Georgia, serif' } as const;
const text = { fontFamily: 'var(--font-bs-serif), Georgia, serif' } as const;

const VOLUMES = [
  { n: 'I', name: 'The new manager', span: '2015 to 2018', test: (p: ConceptPost) => (p.date ?? '') < '2019' },
  { n: 'II', name: 'The Substack years', span: 'Imported 2023', test: (p: ConceptPost) => p.importDate },
  { n: 'III', name: 'Humans and robots', span: '2024 to now', test: (p: ConceptPost) => (p.date ?? '') >= '2024' },
];

function Headline({ children, className, style }: { children: string; className?: string; style?: React.CSSProperties }) {
  return (
    <h2 className={className} style={style}>
      {children.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span className="bs-word inline-block" style={{ animationDelay: `${120 + i * 70}ms` }}>{w}&nbsp;</span>
        </span>
      ))}
    </h2>
  );
}

const fmt = (p: ConceptPost) =>
  p.importDate ? 'From the archive' : new Date(`${p.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function BroadsheetView({ posts, themes, today }: { posts: ConceptPost[]; themes: Theme[]; today: string }) {
  const [lead, second, third, ...rest] = posts;
  const quoted = posts.filter((p) => p.quote && p.quote !== p.subtitle);
  const [qi, setQi] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const themeName = (id: ThemeId) => themes.find((t) => t.id === id)!.name;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setQi((i) => (i + 1) % quoted.length), 6000);
    return () => clearInterval(t);
  }, [quoted.length]);

  const totalWords = posts.reduce((s, p) => s + p.words, 0);

  return (
    <div className="bs min-h-screen" style={{ background: PAPER, color: INK, ...text }}>
      <style>{`
        .bs ::selection { background: ${RED}; color: ${PAPER}; }
        .bs-word { animation: bs-rise .9s cubic-bezier(.16,1,.3,1) both; }
        @keyframes bs-rise { from { transform: translateY(105%); } }
        .bs-ticker { animation: bs-tick 90s linear infinite; }
        .bs-ticker:hover { animation-play-state: paused; }
        @keyframes bs-tick { to { transform: translateX(-50%); } }
        .bs-drop::first-letter { font-family: var(--font-fraunces); float: left; font-size: 5.2em; line-height: .82; padding: .06em .1em 0 0; font-weight: 800; color: ${RED}; }
        .bs-quote { transition: opacity .6s, transform .6s cubic-bezier(.16,1,.3,1); }
        .bs-vol { transition: transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s; }
        .bs-vol:hover { transform: translateY(-6px) rotate(-0.6deg); box-shadow: 0 18px 30px -18px rgba(23,21,18,.45); }
        .bs-story h3 { background: linear-gradient(${RED}, ${RED}) left 100% / 0 2px no-repeat; transition: background-size .4s cubic-bezier(.16,1,.3,1); display: inline; }
        .bs-story:hover h3 { background-size: 100% 2px; }
        @media (prefers-reduced-motion: reduce) {
          .bs-word, .bs-ticker { animation: none; }
          .bs-vol, .bs-vol:hover { transform: none; transition: none; }
        }
      `}</style>

      {/* Folio */}
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex justify-between border-b py-2.5 text-[13px] uppercase tracking-[0.14em] mob:text-[11px]" style={{ borderColor: INK, color: GREY }}>
          <span>Glasgow</span>
          <span className="mob:hidden">{today}</span>
          <span>No. {posts.length} · Free</span>
        </div>

        {/* Masthead */}
        <header className="pt-6 text-center">
          <Link href="/demo/redesigns" className="no-underline" style={{ color: INK }}>
            <span className="block text-[clamp(64px,13vw,188px)] font-[800] leading-[0.82] tracking-[-0.045em]" style={{ ...display, fontVariationSettings: '"opsz" 144, "SOFT" 0' }}>
              Ben Stewart
            </span>
          </Link>
          <p className="mt-4 text-[clamp(17px,1.6vw,22px)] italic" style={{ color: GREY }}>Engineer turned leader of humans and robots. Field reports since 2015.</p>
        </header>
        <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 border-y-[3px] border-double py-3 text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ borderColor: INK, ...display }}>
          {['Front page', ...themes.map((t) => t.name), 'Speaking'].map((n, i) => (
            <span key={n} style={{ color: i === 0 ? RED : INK }}>{n}</span>
          ))}
        </nav>
      </div>

      {/* Ticker */}
      <div className="mt-4 flex overflow-hidden" style={{ background: INK, color: PAPER }}>
        <span className="z-10 shrink-0 px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.18em]" style={{ background: RED, ...display }}>Quoted</span>
        <div className="flex overflow-hidden">
          <div className="bs-ticker flex shrink-0 whitespace-nowrap py-2.5 text-[16px] italic">
            {[...quoted, ...quoted].map((p, i) => (
              <Link key={i} href={`/posts/${p.slug}`} className="px-6 no-underline" style={{ color: PAPER }}>
                “{p.quote}” <span style={{ color: '#C9BFAD' }}>· {p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Front page */}
      <main className="mx-auto mt-10 grid max-w-[1280px] grid-cols-12 gap-x-10 px-6 tab:grid-cols-1">
        <article className="col-span-8 tab:col-span-1">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em]" style={{ color: RED, ...display }}>
            {themeName(lead.themes[0])} · Latest
          </p>
          <Link href={`/posts/${lead.slug}`} className="no-underline" style={{ color: INK }}>
            <Headline className="mt-3 text-[clamp(44px,6.4vw,92px)] font-[750] leading-[0.94] tracking-[-0.035em]" style={{ ...display, fontVariationSettings: '"opsz" 144' }}>
              {lead.title}
            </Headline>
          </Link>
          {lead.subtitle && <p className="mt-5 text-[clamp(20px,2vw,27px)] italic leading-snug" style={{ color: GREY }}>{lead.subtitle}</p>}
          <p className="mt-6 border-y py-2.5 text-[13px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(23,21,18,.25)', color: GREY }}>
            By Ben Stewart · {fmt(lead)} · {lead.readingMinutes} min read
          </p>
          <div className="mt-6 columns-2 gap-10 text-[18px] leading-[1.6] mob:columns-1" style={{ columnRule: '1px solid rgba(23,21,18,.2)' }}>
            {lead.lede.map((para, i) => (
              <p key={i} className={i === 0 ? 'bs-drop' : 'mt-4'}>{para}</p>
            ))}
            <p className="mt-4">
              <Link href={`/posts/${lead.slug}`} className="font-semibold" style={{ color: RED }}>Continued on page {lead.slug.length}</Link>
            </p>
          </div>
        </article>

        <aside className="col-span-4 border-l pl-10 tab:col-span-1 tab:mt-14 tab:border-l-0 tab:border-t-2 tab:pl-0 tab:pt-8" style={{ borderColor: 'rgba(23,21,18,.25)' }}>
          {[second, third].map((p, i) => (
            <Link key={p.slug} href={`/posts/${p.slug}`} className={`bs-story block no-underline ${i ? 'mt-8 border-t pt-8' : ''}`} style={{ color: INK, borderColor: 'rgba(23,21,18,.25)' }}>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: RED, ...display }}>{themeName(p.themes[0])}</p>
              <div className="mt-2 text-[30px] font-[700] leading-[1.02] tracking-[-0.02em]" style={display}><h3>{p.title}</h3></div>
              <p className="mt-3 text-[16px] leading-[1.55]" style={{ color: GREY }}>{p.lede[0]?.slice(0, 220)}…</p>
              <p className="mt-3 text-[12px] uppercase tracking-[0.14em]" style={{ color: GREY }}>{fmt(p)} · {p.readingMinutes} min</p>
            </Link>
          ))}
          <div className="mt-10 p-6" style={{ background: INK, color: PAPER }}>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ ...display, color: '#E8A79F' }}>By the numbers</p>
            <dl className="mt-4 grid grid-cols-2 gap-y-5">
              {[
                [posts.length, 'posts'],
                [totalWords.toLocaleString('en-GB'), 'words'],
                [new Set(posts.map((p) => p.date?.slice(0, 4))).size, 'years with a post'],
                [posts.filter((p) => p.themes.includes('ai')).length, 'about AI'],
              ].map(([v, l]) => (
                <div key={l as string}>
                  <dt className="text-[40px] font-[800] leading-none" style={display}>{v}</dt>
                  <dd className="mt-1 text-[14px] italic opacity-75">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </main>

      {/* Opinion */}
      <section className="mt-24 border-y-[3px] border-double py-20" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: RED, ...display }}>Opinion</p>
          <div className="relative mt-6 grid">
            {quoted.map((p, i) => (
              <Link key={p.slug} href={`/posts/${p.slug}`} aria-hidden={i !== qi} tabIndex={i === qi ? 0 : -1}
                className="bs-quote no-underline [grid-area:1/1]"
                style={{ color: INK, opacity: i === qi ? 1 : 0, transform: i === qi ? 'none' : 'translateY(14px)', pointerEvents: i === qi ? 'auto' : 'none' }}>
                <blockquote className="text-[clamp(32px,4.6vw,64px)] font-[600] leading-[1.06] tracking-[-0.025em]" style={{ ...display, fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                  <span style={{ color: RED }}>“</span>{p.quote}<span style={{ color: RED }}>”</span>
                </blockquote>
                <p className="mt-6 text-[17px] italic" style={{ color: GREY }}>From “{p.title}”</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {quoted.map((p, i) => (
              <button key={p.slug} onClick={() => setQi(i)} aria-label={`Quote ${i + 1}`} className="h-2 rounded-full transition-all"
                style={{ width: i === qi ? 28 : 8, background: i === qi ? RED : 'rgba(23,21,18,.25)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* Back issues */}
      <section className="mx-auto mt-20 max-w-[1280px] px-6">
        <div className="flex items-end justify-between border-b-2 pb-3" style={{ borderColor: INK }}>
          <h2 className="text-[clamp(32px,3.6vw,48px)] font-[800] tracking-[-0.03em]" style={display}>Back issues</h2>
          <span className="text-[15px] italic" style={{ color: GREY }}>Three volumes, {posts.length} stories</span>
        </div>
        <div className="mt-8 grid grid-cols-3 items-start gap-6 cards:grid-cols-1">
          {VOLUMES.map((v) => {
            const list = posts.filter(v.test);
            const isOpen = open === v.n;
            return (
              <div key={v.n} className="bs-vol border p-6" style={{ borderColor: INK, background: '#F7F2E7' }}>
                <button onClick={() => setOpen(isOpen ? null : v.n)} className="block w-full text-left" aria-expanded={isOpen}>
                  <div className="flex items-baseline justify-between border-b pb-2 text-[12px] uppercase tracking-[0.16em]" style={{ borderColor: INK, color: GREY }}>
                    <span>Volume {v.n}</span><span>{v.span}</span>
                  </div>
                  <div className="mt-4 text-[38px] font-[800] leading-[0.95] tracking-[-0.03em]" style={display}>{v.name}</div>
                  <div className="mt-3 text-[15px] italic" style={{ color: GREY }}>{list.length} stories · {isOpen ? 'close' : 'open'} {isOpen ? '↑' : '↓'}</div>
                </button>
                <div className="grid transition-[grid-template-rows] duration-500" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <ol className="overflow-hidden">
                    {list.map((p, i) => (
                      <li key={p.slug} className={`border-t py-2.5 ${i === 0 ? 'mt-5' : ''}`} style={{ borderColor: 'rgba(23,21,18,.2)' }}>
                        <Link href={`/posts/${p.slug}`} className="text-[17px] font-[650] no-underline hover:underline" style={{ ...display, color: INK }}>{p.title}</Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rest of the paper */}
      <section className="mx-auto mt-20 max-w-[1280px] px-6">
        <div className="border-b-2 pb-3" style={{ borderColor: INK }}>
          <h2 className="text-[clamp(32px,3.6vw,48px)] font-[800] tracking-[-0.03em]" style={display}>Also in the paper</h2>
        </div>
        <div className="mt-2 columns-4 gap-8 tab:columns-2 mob:columns-1" style={{ columnRule: '1px solid rgba(23,21,18,.2)' }}>
          {rest.map((p) => (
            <Link key={p.slug} href={`/posts/${p.slug}`} className="bs-story block break-inside-avoid border-b py-5 no-underline" style={{ color: INK, borderColor: 'rgba(23,21,18,.2)' }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: RED, ...display }}>{themeName(p.themes[0])}</p>
              <div className="mt-1.5 text-[22px] font-[700] leading-[1.08] tracking-[-0.015em]" style={display}><h3>{p.title}</h3></div>
              {p.subtitle && <p className="mt-2 text-[15px] italic leading-snug" style={{ color: GREY }}>{p.subtitle}</p>}
            </Link>
          ))}
        </div>
      </section>

      {/* Notices */}
      <section className="mx-auto mt-20 max-w-[1280px] px-6 pb-24">
        <div className="border-b-2 pb-3" style={{ borderColor: INK }}>
          <h2 className="text-[clamp(32px,3.6vw,48px)] font-[800] tracking-[-0.03em]" style={display}>Notices</h2>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-6 cards:grid-cols-1">
          {[
            { h: 'Speaker available', b: 'Engineering leader, Glasgow. Talks on AI, teams and incidents. Podcasts and events welcome.', l: 'See the speaking page', href: '/speaking' },
            { h: 'Delivered free', b: 'Every new field report, the day it is filed. No tracking, no newsletter, just a feed.', l: 'Subscribe by RSS', href: '/feed.xml' },
            { h: 'Correspondence', b: 'Letters to the editor are read and, more often than not, answered.', l: 'ben@benstewart.ai', href: 'mailto:ben@benstewart.ai' },
          ].map((n) => (
            <div key={n.h} className="border-[3px] border-double p-5 text-center" style={{ borderColor: INK }}>
              <p className="text-[22px] font-[800] uppercase tracking-[0.06em]" style={display}>{n.h}</p>
              <p className="mt-2 text-[16px] leading-[1.5]" style={{ color: GREY }}>{n.b}</p>
              <Link href={n.href} className="mt-3 inline-block text-[15px] font-semibold" style={{ color: RED }}>{n.l}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer: the back page, set as a reversed engraving */}
      <SceneFooter src="/images/footer/glen-ink.jpg" sky={INK} focus="30% 100%">
        <div className="mx-auto max-w-[1280px] px-6 pt-16 text-center" style={{ color: PAPER }}>
          <p className="text-[clamp(44px,7vw,96px)] font-[800] leading-[0.85] tracking-[-0.045em]" style={{ ...display, fontVariationSettings: '"opsz" 144' }}>
            Ben Stewart
          </p>
          <nav aria-label="Footer" className="mx-auto mt-6 flex max-w-[760px] flex-wrap justify-center gap-x-7 gap-y-2 border-y-[3px] border-double py-3 text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ borderColor: PAPER, ...display }}>
            {[['Posts', '/posts'], ['RSS', '/feed.xml'], ['GitHub', 'https://github.com/ibenstewart'], ['X', 'https://x.com/benstewart__'], ['LinkedIn', 'https://www.linkedin.com/in/ben-stewart-90944595/'], ['Contact', 'mailto:ben@benstewart.ai']].map(([n, href]) => (
              <a key={n} href={href} className="no-underline hover:underline" style={{ color: PAPER }}>{n}</a>
            ))}
          </nav>
          <p className="mt-4 text-[13px] uppercase tracking-[0.14em] opacity-70">
            Printed in Glasgow on recycled electrons · Set in Fraunces and Source Serif
          </p>
        </div>
      </SceneFooter>
    </div>
  );
}
