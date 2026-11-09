import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { chapters } from '@/lib/manual';
import { ProfilePageJsonLd } from '@/app/components/JsonLd';
import { OrganiserKit } from '@/app/components/manual/OrganiserKit';
import { PageHead, PageSection } from '@/app/components/manual/PageHead';
import { textLinkClass } from '@/app/components/TextLink';
import { RouteChart, type Waypoint } from './RouteChart';
import { VoxelHead } from './VoxelHead';
import { VOXEL } from './voxel-data';

const bioDescription = 'Ben Stewart, VP of Engineering at Skyscanner. Field reports on leading engineering teams through AI.';

export const metadata: Metadata = pageMetadata({
  title: 'About Ben Stewart, VP of Engineering at Skyscanner',
  description: bioDescription,
  path: '/bio',
  absolute: true,
});

/** The timeline, oldest first. `level` only places each role on the climb. */
const ROUTE: Waypoint[] = [
  { year: 2006, title: 'Software Developer', org: 'Arnold Clark', note: 'Began career writing code. SQL, .NET, and a lot of learning.', level: 1 },
  { year: 2008, title: 'Engineer', org: 'Glasgow Science Centre', note: 'SCIENCE!', level: 1.05 },
  { year: 2010, title: 'Engineer', org: 'City Technologies', note: 'Built software and ran systems for large telephone and energy companies.', level: 1.35 },
  { year: 2012, title: 'Team Lead', org: 'CityFM', note: 'Took on people responsibilities for the very first time.', level: 2.2 },
  { year: 2014, title: 'Engineering Manager', org: 'CityFM', note: 'Took on more teams and made them faster.', level: 3 },
  { year: 2016, title: 'Head of Software Engineering', org: 'CityFM', note: 'Ran teams in the UK, US and Malaysia for blue-chip clients including Asda, Marks & Spencer and Walmart.', level: 3.9 },
  { year: 2019, title: 'Senior Engineering Manager', org: 'Skyscanner', note: 'Joined to build manager culture and teams across several countries.', level: 4.3 },
  { year: 2020, title: 'Director of Engineering', org: 'Skyscanner', note: 'Scaled the organisation and how it delivered.', level: 4.9 },
  { year: 2024, title: 'Senior Director', org: 'Skyscanner', note: 'Leading engineering across several product areas.', level: 6 },
  { year: 2026, title: 'VP of Engineering', org: 'Skyscanner', note: 'Running a 250-engineer org through the AI transition.', level: 7 },
];

const cardLink = 'group block rounded-3xl p-7 no-underline transition-transform duration-200 hover:-translate-y-1 mob:p-5';

export default async function BioPage() {
  const posts = await getAllPosts();
  const chs = chapters(posts);

  const authorCard = (
    <aside aria-label="Author card" className="overflow-hidden rounded-3xl border-2 border-ink bg-card mob:grid mob:grid-cols-[144px_minmax(0,1fr)]">
      <div
        className="vox-grid bg-accent mob:flex mob:items-end"
        style={{ backgroundSize: `100% calc(100% / ${VOXEL.h} * 4), calc(100% / ${VOXEL.w} * 4) 100%` }}
      >
        <VoxelHead className="w-full" />
      </div>
      <dl className="grid gap-3 p-5 font-mono text-[0.8125rem] tracking-[0.06em] mob:gap-2 mob:p-3.5 mob:text-[0.75rem]">
        {[
          ['Name', 'Ben Stewart'],
          ['Role', 'VP of Engineering, Skyscanner'],
          ['Base', 'Glasgow'],
          ['Writing code since', '2006'],
          ['Entries filed', String(posts.length)],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[1fr_auto] gap-3 border-b border-hair pb-2.5 last:border-0 last:pb-0 mob:grid-cols-1 mob:gap-0 mob:pb-1.5">
            <dt className="uppercase text-faint">{k}</dt>
            <dd className="text-right font-medium text-ink mob:text-left">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );

  return (
    <>
      <PageHead
        label="Appendix A · About the author"
        title="Engineer turned leader."
        standfirst="I run engineering teams that are working out AI in real time, and I write about it here while it's still messy."
        aside={authorCard}
      >
        <ProfilePageJsonLd />
        <div className="mt-7 grid max-w-[62ch] gap-4 text-[1.1875rem] leading-[1.6] text-faint">
          <p>At home I have a wife, a daughter and a dog that I met in that exact order. I build things and help teams build better.</p>
          <p>Currently at Skyscanner, working on how technology, product, and people come together to make travel simpler.</p>
        </div>
        <ul role="list" className="mt-9 grid grid-cols-4 gap-3 cards:grid-cols-2">
          {[
            ['20', 'years in'],
            ['250', 'engineers'],
            [String(posts.length), 'entries filed'],
            ['1', 'dog'],
          ].map(([n, l]) => (
            <li key={l} className="rounded-2xl border-2 border-ink px-4 py-4">
              <span className="block font-mono text-[clamp(1.875rem,3vw,2.625rem)] leading-none font-bold tracking-[-0.03em] text-ink">{n}</span>
              <span className="label mt-2 block text-faint">{l}</span>
            </li>
          ))}
        </ul>
      </PageHead>

      <PageSection id="route" label="A.1 · The route so far" title="Twenty years, mostly uphill.">
        <p className="mt-5 max-w-[56ch] text-[1.1875rem] leading-[1.6] text-faint">
          I started out writing SQL at Arnold Clark in 2006. Now I run a 250-engineer org at Skyscanner. The flat bit at the start is three engineering jobs; the climb starts when I got my first team.
        </p>
        <div className="mt-10 overflow-hidden rounded-3xl border-2 border-ink bg-accent tab:hidden">
          <RouteChart route={ROUTE} />
        </div>
        <ol role="list" className="mt-12 grid grid-cols-2 gap-x-10 gap-y-2 mob:grid-cols-1">
          {[...ROUTE].reverse().map((s, i) => (
            <li key={s.year} className={`grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t-2 py-5 ${i < 2 ? 'border-ink' : 'border-hair'}`}>
              <span className="pt-1 font-mono text-[0.9375rem] font-medium text-accent">{s.year}</span>
              <span>
                <span className="block text-[1.3125rem] leading-[1.15] font-bold tracking-[-0.015em] text-ink">{s.title}</span>
                <span className="label mt-1 block text-faint">{s.org}</span>
                <span className="mt-2 block text-[1.0625rem] leading-[1.5] text-faint">{s.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection id="covers" label="A.2 · The chapters" title="What I write about.">
        <p className="mt-5 max-w-[62ch] text-[1.1875rem] leading-[1.6] text-faint">
          Mostly what happens when you run engineering teams through AI. Which tasks I hand over and which I keep, what it cost when I got that wrong, and the old processes teams keep running underneath the new tools. The view behind most of it is that AI adoption is a leadership problem before it&apos;s a tooling one. The older posts are about leadership from before AI turned up, and plenty of it still applies.
        </p>
        <ul role="list" className="mt-10 grid grid-cols-5 gap-4 tab:grid-cols-3 cards:grid-cols-2 mob:grid-cols-1">
          {chs.map(({ theme, number, entries }) => (
            <li key={theme.id}>
              <Link href={`/#ch-${theme.id}`} className="group flex h-full flex-col rounded-3xl border-2 border-ink bg-card p-5 text-ink no-underline transition-transform duration-200 hover:-translate-y-1">
                <span aria-hidden className="h-1.5 w-10 rounded-full" style={{ background: theme.colour }} />
                <span className="label mt-4 text-faint">Chapter {number}</span>
                <span className="mt-1 text-[1.375rem] leading-[1.05] font-bold tracking-[-0.02em]">{theme.name}</span>
                <span className="mt-auto pt-6 font-mono text-[0.875rem] font-medium">
                  {entries.length} {entries.length === 1 ? 'entry' : 'entries'} <span aria-hidden className="nudge inline-block">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[1.0625rem]">
          <Link href="/posts" className={`font-bold ${textLinkClass}`}>Or read them in order: every entry, newest first</Link>
        </p>
      </PageSection>

      <PageSection id="short-bio" label="A.3 · For organisers and hosts" title="Short bio, copy as is." last>
        <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-end gap-10 tab:grid-cols-1">
          <OrganiserKit />
          <div className="grid gap-4">
            <Link href="/speaking" className={`${cardLink} surface-dark bg-accent text-white`}>
              <span className="label block text-white/80">Host a podcast or run an event?</span>
              <span className="mt-3 block text-[1.75rem] leading-[1.1] font-bold tracking-[-0.02em]">
                Here&apos;s what I talk about <span aria-hidden className="nudge inline-block text-hi">→</span>
              </span>
            </Link>
            <a href="mailto:ben@benstewart.ai" className={`${cardLink} surface-dark bg-ink text-paper`}>
              <span className="label block text-paper/80">Anything else</span>
              <span className="mt-3 block text-[1.75rem] leading-[1.1] font-bold tracking-[-0.02em] break-words">
                ben@benstewart.ai <span aria-hidden className="nudge inline-block text-hi">→</span>
              </span>
            </a>
          </div>
        </div>
      </PageSection>
    </>
  );
}
