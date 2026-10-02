'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

/**
 * A fenced code block with a Copy button (DESIGN.md 4.3, plan KTD9).
 * The button sits outside the <pre> so the copied text never includes it,
 * and stays hidden until JS runs and the Clipboard API is available, so the
 * block works fully without JavaScript.
 */
export function CodeBlock({ children }: { children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canCopy, setCanCopy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator.clipboard?.writeText === 'function') setCanCopy(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={canCopy ? 'code-block has-copy' : 'code-block'}>
      <button type="button" className="copy" hidden={!canCopy} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
      <pre ref={preRef} role="region" aria-label="Code sample" tabIndex={0}>
        {children}
      </pre>
    </div>
  );
}
