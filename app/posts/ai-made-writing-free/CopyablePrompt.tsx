'use client';

import { useState } from 'react';

export function CopyablePrompt({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label} to clipboard`}
          className="text-sm text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 bg-raise rounded-lg border border-hair font-mono text-sm leading-relaxed text-ink">
        {text}
      </div>
    </div>
  );
}
