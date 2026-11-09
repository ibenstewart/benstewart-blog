'use client';

import { useState } from 'react';

const FORMATS = ['Podcast', 'Conference talk', 'Panel', 'Leadership offsite', 'Workshop'];

/**
 * Turns the three things Ben asks for (date, audience, format) into a
 * ready-to-send email. Nothing is stored or sent from the page itself; the
 * button opens the reader's own email app.
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
    ...(talk ? [`Talk: ${talk}`] : []),
    '',
  ].join('\n');
  const href = `mailto:ben@benstewart.ai?subject=${encodeURIComponent(`Speaking or podcast: ${format}`)}&body=${encodeURIComponent(body)}`;

  const field = 'mt-2 h-12 w-full rounded-xl border-2 border-ink bg-card px-3 font-mono text-[1.0625rem] tracking-normal normal-case text-ink';
  const lab = 'label block text-white/85';

  return (
    <form
      aria-labelledby="booking-card-title"
      className="surface-dark rounded-3xl bg-accent p-7 text-white mob:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
    >
      <p className="label text-white/80">Booking request</p>
      <p id="booking-card-title" className="mt-3 text-[1.75rem] leading-[1.1] font-bold tracking-[-0.02em]">Three things and it&apos;s a yes or a no.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 cards:grid-cols-1">
        <label className={lab}>
          Date
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. 12 March 2027" className={field} />
        </label>
        <label className={lab}>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value)} className={field}>
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className={`${lab} col-span-2 cards:col-span-1`}>
          Audience
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. 200 engineering leaders" className={field} />
        </label>
        <label className={`${lab} col-span-2 cards:col-span-1`}>
          Talk (optional)
          <select value={talk} onChange={(e) => setTalk(e.target.value)} className={field}>
            <option value="">Not sure yet</option>
            {talks.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-xl bg-hi px-5 text-[1.0625rem] font-bold text-ink">
          Write the email <span aria-hidden className="nudge inline-block">→</span>
        </button>
        <span className="text-[0.9375rem] text-white/85">Opens your email app, addressed to ben@benstewart.ai.</span>
      </div>
    </form>
  );
}
