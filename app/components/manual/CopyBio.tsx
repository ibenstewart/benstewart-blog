'use client';

import { useState } from 'react';

/** Copies the short bio, and says so for screen readers too. */
export function CopyBio({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked: the bio is on the page to select by hand.
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border-2 border-ink px-4 text-[1rem] font-bold transition-colors ${copied ? 'surface-dark bg-ink text-hi' : 'bg-hi text-ink'}`}
      >
        {copied ? 'Copied' : 'Copy short bio'}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Short bio copied to the clipboard' : ''}</span>
    </>
  );
}
