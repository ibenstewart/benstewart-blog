import Link from 'next/link';

const CONCEPTS = [
  {
    href: '/demo/redesigns/atlas',
    letter: 'A',
    name: 'Atlas',
    pitch: 'The blog as a data map. The homepage is a set of live charts of your own writing: a timeline river, a theme map and a length chart, all filterable by theme.',
    bg: '#F3F1EA', fg: '#121417',
  },
  {
    href: '/demo/redesigns/broadsheet',
    letter: 'B',
    name: 'Broadsheet',
    pitch: 'The blog as a newspaper. A masthead, a front page with the latest post as the lead story, a ticker of your best lines, and the archive bound as three back issues.',
    bg: '#F2ECDF', fg: '#171512',
  },
  {
    href: '/demo/redesigns/manual',
    letter: 'C',
    name: 'Field manual',
    pitch: 'The blog as a playbook. Start from the problem you have, get a reading order; flip cards for your named frameworks; chapters you can tick off.',
    bg: '#1740D8', fg: '#FFFFFF',
  },
];

export default function RedesignsIndex() {
  return (
    <>
      <h1 className="text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-[-0.035em]">Three directions</h1>
      <p className="text-[19px] text-muted">
        Working prototypes built on the real posts. Each one takes over the whole page, so the Glasgow Civic masthead and footer disappear while you look at it.
      </p>
      <ul className="col-wide mt-12 grid gap-5">
        {CONCEPTS.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="group grid grid-cols-[120px_1fr] items-center gap-8 rounded-[28px] p-8 no-underline mob:grid-cols-1 mob:gap-3" style={{ background: c.bg, color: c.fg }}>
              <span className="text-[96px] font-bold leading-[0.8] tracking-[-0.05em]">{c.letter}</span>
              <span>
                <span className="block text-[32px] font-bold tracking-[-0.03em]">
                  {c.name} <span className="nudge inline-block">→</span>
                </span>
                <span className="mt-2 block text-[18px] opacity-80">{c.pitch}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
