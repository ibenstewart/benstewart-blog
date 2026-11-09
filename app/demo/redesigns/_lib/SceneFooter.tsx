import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

/**
 * A footer with its content in the sky of an illustration. The scene sits
 * below the content, so nothing runs under the links on a phone, and its own
 * sky fades into `sky` so there is no seam. `overlay` draws on top of the
 * scene (Atlas uses it for its survey grid).
 */
export function SceneFooter({
  src,
  sky,
  focus = '22% 100%',
  children,
  overlay,
  className = '',
  style,
}: {
  src: string;
  sky: string;
  focus?: string;
  children: ReactNode;
  overlay?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}) {
  const fade = 'linear-gradient(to bottom, transparent, #000 30%)';
  return (
    <footer className={`relative overflow-hidden pb-[env(safe-area-inset-bottom)] ${className}`} style={{ background: sky, ...style }}>
      {overlay && <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]" style={overlay} />}
      <div className="relative z-10">{children}</div>
      <div className="relative -mt-6 h-[clamp(300px,40vw,600px)]" style={{ maskImage: fade, WebkitMaskImage: fade }}>
        <Image src={src} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: focus }} />
      </div>
    </footer>
  );
}
