'use client';

import { useReadList } from './readState';

/** Mark an entry as read. Shares its state with the chapter checklists on the home page. */
export function ReadToggle({ slug, className = '' }: { slug: string; className?: string }) {
  const { read, toggle } = useReadList();
  const on = read.includes(slug);
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={on}
      className={`inline-flex h-11 items-center gap-2.5 rounded-xl border-2 border-ink px-4 font-sans text-[0.9375rem] font-bold tracking-normal normal-case transition-colors ${
        on ? 'bg-ink text-hi' : 'bg-transparent text-ink hover:bg-hi'
      } ${className}`}
    >
      <span
        aria-hidden
        className={`grid h-5 w-5 place-items-center rounded-[5px] border-2 text-[0.75rem] ${on ? 'border-hi' : 'border-ink'}`}
      >
        {on ? '✓' : ''}
      </span>
      {on ? 'Read' : 'Mark as read'}
    </button>
  );
}
