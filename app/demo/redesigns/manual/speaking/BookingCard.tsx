'use client';

import { useState } from 'react';

const INK = '#0E0F12';
const HI = '#FFD84A';
const BLUE = '#003593';
const mono = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' } as const;

const FORMATS = ['Podcast', 'Conference talk', 'Panel', 'Leadership offsite', 'Workshop'];

/**
 * Turns the three things Ben asks for (date, audience, format) into a
 * ready-to-send email. Nothing is stored or sent from the page itself.
 */
export function BookingCard({ talks }: { talks: string[] }) {
  const [date, setDate] = useState('');
  const [audience, setAudience] = useState('');
  const [format, setFormat] = useState(FORMATS[0]);
  const [talk, setTalk] = useState('');

  const body = [
    `Date: ${date || '(when is it?)'}`,
    `Audience: ${audience || '(who will be there, and how many?)'}`,
    `Format: ${format}`,
    talk ? `Talk: ${talk}` : null,
    '',
  ].filter((l) => l !== null).join('\n');
  const href = `mailto:ben@benstewart.ai?subject=${encodeURIComponent(`Speaking or podcast: ${format}`)}&body=${encodeURIComponent(body)}`;

  const field = 'mt-2 h-12 w-full rounded-xl border-2 bg-white px-3 text-[17px] outline-offset-2';
  const lab = 'block text-[13px] tracking-[0.1em]';

  return (
    <form className="rounded-3xl p-7 mob:p-5" style={{ background: BLUE, color: '#fff' }} onSubmit={(e) => { e.preventDefault(); window.location.href = href; }}>
      <p className="text-[13px] tracking-[0.1em] opacity-80" style={mono}>BOOKING REQUEST</p>
      <p className="mt-3 text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">Three things and it&apos;s a yes or a no.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 cards:grid-cols-1">
        <label className={lab} style={mono}>
          DATE
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. 12 March 2027" className={field} style={{ ...mono, borderColor: INK, color: INK, letterSpacing: 0 }} />
        </label>
        <label className={lab} style={mono}>
          FORMAT
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={field} style={{ ...mono, borderColor: INK, color: INK, letterSpacing: 0 }}>
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className={`${lab} col-span-2 cards:col-span-1`} style={mono}>
          AUDIENCE
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. 200 engineering leaders" className={field} style={{ ...mono, borderColor: INK, color: INK, letterSpacing: 0 }} />
        </label>
        <label className={`${lab} col-span-2 cards:col-span-1`} style={mono}>
          TALK (OPTIONAL)
          <select value={talk} onChange={(e) => setTalk(e.target.value)} className={field} style={{ ...mono, borderColor: INK, color: INK, letterSpacing: 0 }}>
            <option value="">Not sure yet</option>
            {talks.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[17px] font-bold" style={{ background: HI, color: INK }}>
          Write the email <span className="nudge inline-block" aria-hidden>→</span>
        </button>
        <span className="text-[15px] opacity-85">Opens your email app, addressed to ben@benstewart.ai.</span>
      </div>
    </form>
  );
}
