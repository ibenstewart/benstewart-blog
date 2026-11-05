'use client';

import { useEffect, useRef, useState } from 'react';

/** Longest step of the hero rise in globals.css, plus a little slack. */
const RISE_MS = 1600;

/**
 * The image inside a hero Figure (plan KTD8). A client component because the
 * server-side MDX mapping cannot pass onError. If the image fails, the frame
 * gets `is-empty` and CSS hides the whole figure. The useEffect check covers
 * errors that fired before hydration.
 *
 * The arch rises (DESIGN.md 3.6): if the image is still loading when the
 * component mounts, the frame is armed and the image rises through the arch
 * once it arrives. An image that is already showing is never hidden again, so
 * a cached image simply stays put.
 */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current;
    const frame = img?.parentElement;
    if (!img || !frame) return;
    if (img.complete) {
      if (img.naturalWidth === 0) setFailed(true);
      return;
    }

    frame.dataset.rise = 'armed';
    let timer: number | undefined;
    const play = () => {
      frame.dataset.rise = 'play';
      timer = window.setTimeout(() => delete frame.dataset.rise, RISE_MS);
    };
    img.addEventListener('load', play, { once: true });
    return () => {
      img.removeEventListener('load', play);
      window.clearTimeout(timer);
      delete frame.dataset.rise;
    };
  }, []);

  return (
    <div className={failed ? 'frame is-empty' : 'frame'}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        decoding="async"
        fetchPriority="high"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
