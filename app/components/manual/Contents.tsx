'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; text: string };

/**
 * "In this entry": the post's own sections, numbered like the manual, in a
 * rail in the left margin on wide screens. It shows once the header has
 * scrolled away, steps aside while a wide block (a hero, the summary) is on
 * screen, and marks the section you're reading with aria-current. Posts
 * with fewer than two sections get no rail.
 */
export function Contents({ entry }: { entry: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const heads = [...document.querySelectorAll<HTMLHeadingElement>('#main h2.prose-h2[id]')];
    setItems(heads.map((h) => ({ id: h.id, text: h.textContent ?? '' })));
    if (heads.length < 2) return;

    const header = document.querySelector('.post-head');
    const end = document.querySelector('.entry-end');
    const wide = [...document.querySelectorAll('#main > .col-wide, #main > .tldr, #main > .hero-fig, #main > .quadrant')];
    const onScreen = new Set<Element>();
    let pastHeader = false;
    let atEnd = false;
    const update = () => setShown(pastHeader && !atEnd && onScreen.size === 0);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === header) pastHeader = !e.isIntersecting && e.boundingClientRect.top < 0;
        else if (e.target === end) atEnd = e.isIntersecting || e.boundingClientRect.top < 0;
        else if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
      update();
    });
    [header, end, ...wide].forEach((el) => el && io.observe(el));

    const onScroll = () => {
      let idx = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) idx = i; });
      setActive(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (items.length < 2) return null;
  return (
    <nav aria-label="In this entry" className="entry-rail" data-shown={shown || undefined}>
      <p className="label text-faint">In this entry</p>
      <ol className="relative mt-4 grid gap-1 border-l-2 border-hair">
        <span
          aria-hidden
          className="entry-rail-fill absolute top-0 -left-[2px] w-[2px] bg-accent"
          style={{ height: `${((active + 1) / items.length) * 100}%` }}
        />
        {items.map((it, i) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={i === active ? 'location' : undefined}
              className={`block rounded-r-lg py-1.5 pr-2 pl-4 text-[0.9375rem] leading-[1.3] font-medium no-underline transition-colors hover:text-ink ${
                i === active ? 'bg-hi text-ink' : 'text-faint'
              }`}
            >
              <span className={`mr-2 font-mono text-[0.75rem] ${i === active ? 'text-ink' : 'text-accent'}`}>
                {entry}.{i + 1}
              </span>
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
