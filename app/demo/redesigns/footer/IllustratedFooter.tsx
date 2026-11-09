'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Footer concept: the Glasgow Civic footer set in the sky of a full-bleed
 * illustration. Each image's sky sits within a shade of the site's accent
 * blue, so the footer reads as part of the palette rather than a photo.
 * `focus` keeps the subject in frame when a narrow screen crops the sides.
 */
const SCENES = [
  { id: 'mesas', name: 'Mesas', src: '/images/footer/mesas.jpg', sky: '#003593', focus: '22% 100%', w: 2400, h: 1351 },
  { id: 'gates', name: 'Gates', src: '/images/footer/gates.jpg', sky: '#033A97', focus: '70% 100%', w: 2400, h: 1340 },
  { id: 'chess', name: 'Chess', src: '/images/footer/chess.jpg', sky: '#0D3E9B', focus: '24% 100%', w: 2400, h: 1340 },
  { id: 'meadow', name: 'Meadow', src: '/images/footer/meadow.jpg', sky: '#0A3BB6', focus: '34% 100%', w: 2201, h: 1228 },
] as const;

const LINKS = [
  { name: 'posts', url: '/posts', external: false },
  { name: 'rss', url: '/feed.xml', external: false },
  { name: 'github', url: 'https://github.com/ibenstewart', external: true },
  { name: 'x', url: 'https://x.com/benstewart__', external: true },
  { name: 'linkedin', url: 'https://www.linkedin.com/in/ben-stewart-90944595/', external: true },
  { name: 'contact', url: 'mailto:ben@benstewart.ai', external: true },
];

const pill =
  'inline-flex h-11 items-center rounded-full border border-white/40 px-5 text-base font-medium text-paper no-underline transition-colors hover:border-paper hover:bg-paper hover:text-accent mob:h-10 mob:px-4 mob:text-[0.9375rem]';

export function IllustratedFooter() {
  const [id, setId] = useState<(typeof SCENES)[number]['id']>('mesas');
  const scene = SCENES.find((s) => s.id === id)!;

  useEffect(() => {
    const fromHash = SCENES.find((s) => `#${s.id}` === window.location.hash);
    if (fromHash) setId(fromHash.id);
  }, []);

  const pick = (next: typeof id) => {
    setId(next);
    history.replaceState(null, '', `#${next}`);
  };

  return (
    <>
      <footer
        className="relative mt-[var(--section)] overflow-hidden pb-[env(safe-area-inset-bottom)] transition-colors duration-500"
        style={{ gridColumn: 'full', background: scene.sky }}
      >
        <div className="site-container relative z-10 pt-[clamp(48px,6vw,88px)]">
          <div className="flex flex-wrap items-start justify-between gap-8 mob:block">
            <div>
              <Link href="/" className="block text-[clamp(1.75rem,3.2vw,2.75rem)] leading-none font-bold tracking-[-0.035em] text-paper no-underline">
                Ben Stewart
              </Link>
              <p className="mt-3 text-[0.9375rem] font-medium tracking-[0.005em] text-blond">Glasgow</p>
            </div>
            <nav aria-label="Footer">
              <ul role="list" className="flex flex-wrap gap-2.5 mob:mt-7">
                {LINKS.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className={pill}>{link.name}</a>
                    ) : (
                      <Link href={link.url} className={pill}>{link.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        {/* The scene sits below the links, so the subject never runs under them;
            its own sky fades into the footer colour so there is no seam. */}
        <div
          className="relative -mt-6 h-[clamp(300px,40vw,600px)]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, #000 30%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 30%)' }}
        >
          {SCENES.map((s) => (
            <Image
              key={s.id}
              src={s.src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover transition-opacity duration-500"
              style={{ objectPosition: s.focus, opacity: s.id === id ? 1 : 0 }}
              priority={s.id === id}
            />
          ))}
        </div>
      </footer>

      {/* Demo only: switch between the four scenes. */}
      <div
        className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full bg-ink p-1 shadow-[0_8px_30px_rgba(0,0,0,.25)]"
        role="group"
        aria-label="Footer scene"
      >
        {SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => pick(s.id)}
            aria-pressed={s.id === id}
            className="h-9 rounded-full px-4 text-[0.9375rem] font-medium transition-colors"
            style={{ background: s.id === id ? 'var(--accent)' : 'transparent', color: '#fff' }}
          >
            {s.name}
          </button>
        ))}
      </div>
    </>
  );
}
