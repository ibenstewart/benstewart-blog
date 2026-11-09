'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Which entries this reader has ticked off. Kept in this browser only
 * (localStorage), and every read and write is wrapped so a private window
 * or blocked storage just means nothing is remembered. The page renders as
 * unread first and fills in after hydration, so server and client agree.
 */
const KEY = 'fm-read';
const EVENT = 'fm-read-change';

function load(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function save(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage is blocked: the tick still shows for this page view.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: list }));
}

/** The read list, kept in step across every component on the page and other tabs. */
export function useReadList() {
  const [read, setRead] = useState<string[]>([]);

  useEffect(() => {
    setRead(load());
    const onChange = (e: Event) => setRead((e as CustomEvent<string[]>).detail);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setRead(load()); };
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    save(read.includes(slug) ? read.filter((s) => s !== slug) : [...read, slug]);
  }, [read]);

  return { read, toggle };
}
