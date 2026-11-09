'use client';

import { useEffect, useState } from 'react';

const INK = '#0E0F12';
const HI = '#FFD84A';
const GREY = '#5C5F66';
const BLUE = '#003593';
const mono = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' } as const;

/** Mark-as-read, shared with the home page's chapter checklists. */
export function ReadToggle({ slug }: { slug: string }) {
  const [read, setRead] = useState(false);
  useEffect(() => {
    try { setRead((JSON.parse(localStorage.getItem('fm-read') ?? '[]') as string[]).includes(slug)); } catch {}
  }, [slug]);
  const toggle = () => {
    try {
      const list = JSON.parse(localStorage.getItem('fm-read') ?? '[]') as string[];
      const next = read ? list.filter((s) => s !== slug) : [...list, slug];
      localStorage.setItem('fm-read', JSON.stringify(next));
    } catch {}
    setRead(!read);
  };
  return (
    <button onClick={toggle} aria-pressed={read}
      className="inline-flex h-10 items-center gap-2.5 rounded-xl border-2 px-4 text-[15px] font-bold transition-colors"
      style={{ borderColor: INK, background: read ? INK : 'transparent', color: read ? HI : INK }}>
      <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border-2 text-[11px]" style={{ borderColor: read ? HI : INK }}>{read ? '✓' : ''}</span>
      {read ? 'Read' : 'Mark as read'}
    </button>
  );
}

/**
 * "In this entry": the post's own h2s, numbered like the manual, with the
 * section you are reading marked. Renders nothing for posts with fewer than
 * two sections.
 */
export function Contents({ entry }: { entry: string }) {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const heads = [...document.querySelectorAll<HTMLHeadingElement>('#fm-article h2[id]')];
    setItems(heads.map((h) => ({ id: h.id, text: h.textContent ?? '' })));
    const onScroll = () => {
      let idx = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) idx = i; });
      setActive(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (items.length < 2) return null;
  return (
    <nav aria-label="In this entry" className="tab:hidden">
      <p className="text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>IN THIS ENTRY</p>
      <ol className="relative mt-4 grid gap-1 border-l-2 pl-0" style={{ borderColor: 'rgba(14,15,18,.12)' }}>
        <span aria-hidden className="fm-rail absolute -left-[2px] top-0 w-[2px]"
          style={{ background: BLUE, height: `${((active + 1) / items.length) * 100}%` }} />
        {items.map((it, i) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="block rounded-r-lg py-1.5 pl-4 pr-2 text-[15px] font-medium leading-[1.3] no-underline transition-colors"
              style={{ color: i === active ? INK : GREY, background: i === active ? HI : 'transparent' }}>
              <span className="mr-2 text-[11px]" style={{ ...mono, color: i === active ? INK : BLUE }}>§{entry}.{i + 1}</span>{it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
