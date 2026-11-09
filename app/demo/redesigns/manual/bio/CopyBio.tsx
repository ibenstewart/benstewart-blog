'use client';

import { useState } from 'react';

const INK = '#0E0F12';
const HI = '#FFD84A';

/** Copies the short bio, and says so for screen readers too. */
export function CopyBio({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {}
  };
  return (
    <>
      <button onClick={copy}
        className="inline-flex h-11 items-center gap-2 rounded-xl border-2 px-4 text-[16px] font-bold transition-colors"
        style={{ borderColor: INK, background: copied ? INK : HI, color: copied ? HI : INK }}>
        {copied ? 'Copied' : 'Copy short bio'}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Short bio copied to the clipboard' : ''}</span>
    </>
  );
}
