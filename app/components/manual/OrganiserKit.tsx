import type { ReactNode } from 'react';
import { CopyBio } from './CopyBio';

/** The one short bio, shown on /bio and /speaking. Edit it here only. */
export const SHORT_BIO =
  "Ben Stewart is VP of Engineering at Skyscanner, based in Glasgow. He writes field reports at benstewart.ai about leading engineering teams through AI: what's working, what's breaking and what the data says, in plain English. He started his career writing SQL in 2006.";

/** The short bio in a card, with copy and photo download, plus any extra link. */
export function OrganiserKit({ children }: { children?: ReactNode }) {
  return (
    <div>
      <blockquote className="mt-8 max-w-[760px] rounded-3xl border-2 border-ink bg-card p-7 text-[1.25rem] leading-[1.55] text-ink mob:p-5 mob:text-[1.125rem]">
        {SHORT_BIO}
      </blockquote>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <CopyBio text={SHORT_BIO} />
        <a href="/images/ben-stewart.jpg" download className="inline-flex h-11 items-center rounded-xl border-2 border-ink px-4 text-[1rem] font-bold text-ink no-underline hover:bg-hi">
          Download photo
        </a>
        {children}
      </div>
    </div>
  );
}
