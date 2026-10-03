'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The image inside a hero Figure (plan KTD8). A client component because the
 * server-side MDX mapping cannot pass onError. If the image fails, the frame
 * gets `is-empty` and CSS hides the whole figure. The useEffect check covers
 * errors that fired before hydration.
 */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
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
