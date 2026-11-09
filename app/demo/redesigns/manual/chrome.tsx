import Link from 'next/link';
import { SceneFooter } from '../_lib/SceneFooter';
import { BG, FOOTER_LINKS, GREY, HI, INK, mono } from './content';

/** The Field manual top bar, shared by the home page and every entry. */
export function ManualTopBar({ current }: { current?: string }) {
  const nav: [string, string][] = [
    ['situations', '/demo/redesigns/manual#situations'],
    ['toolkit', '/demo/redesigns/manual#toolkit'],
    ['chapters', '/demo/redesigns/manual#chapters'],
  ];
  return (
    <header className="flex items-center justify-between gap-4 border-b-2 px-6 py-4" style={{ borderColor: INK, background: BG }}>
      <Link href="/demo/redesigns/manual" className="text-[20px] font-bold tracking-[-0.03em] no-underline" style={{ color: INK }}>
        Ben Stewart <span className="ml-2 rounded px-2 py-0.5 align-middle text-[12px] tracking-[0.08em]" style={{ ...mono, background: INK, color: BG }}>FIELD MANUAL</span>
      </Link>
      <nav className="flex gap-5 text-[14px] font-medium mob:hidden" style={mono}>
        {nav.map(([label, href]) => (
          <Link key={label} href={href} className="no-underline hover:underline" style={{ color: current && label.includes(current) ? INK : GREY }}>{label}</Link>
        ))}
        <Link href="/bio" className="no-underline hover:underline" style={{ color: GREY }}>bio</Link>
      </nav>
    </header>
  );
}

/** The Mesas footer in the Field manual's own type. */
export function ManualFooter({ status }: { status: string }) {
  return (
    <SceneFooter src="/images/footer/glen.jpg" sky="#003593" focus="30% 100%" className="border-t-2" style={{ borderColor: INK }}>
      <div className="px-10 pt-16 mob:px-6" style={{ color: '#fff' }}>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="text-[clamp(32px,4vw,56px)] font-bold leading-none tracking-[-0.04em]">
              Ben Stewart <span className="ml-1 rounded px-2 py-1 align-middle text-[13px] tracking-[0.08em]" style={{ ...mono, background: HI, color: INK }}>FIELD MANUAL</span>
            </p>
            <p className="mt-4 text-[13px] tracking-[0.1em] opacity-80" style={mono}>{status}</p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-2">
              {FOOTER_LINKS.map(([n, href]) => (
                <li key={n}>
                  <a href={href} className="inline-flex h-11 items-center rounded-xl border-2 px-4 text-[16px] font-bold no-underline transition-colors hover:bg-white hover:text-[#003593]" style={{ borderColor: 'rgba(255,255,255,.55)', color: '#fff' }}>{n}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </SceneFooter>
  );
}
