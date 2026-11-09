import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { entryNumbers } from '@/lib/manual';
import { OrganiserKit } from '@/app/components/manual/OrganiserKit';
import { PageHead, PageSection } from '@/app/components/manual/PageHead';
import { textLinkClass } from '@/app/components/TextLink';
import { BookingCard } from './BookingCard';

const speakingDescription = 'Talks by Ben Stewart on leading engineering teams through AI: the guardrail as a price, what level a task deserves, and sustainable pace.';

export const metadata: Metadata = pageMetadata({
  title: 'Speaking on AI and engineering leadership',
  description: speakingDescription,
  path: '/speaking',
});

// ============================================
// ADD YOUR CONTENT HERE
// ============================================

/** Talks ready to give. `minutes` is the shortest and longest version; `slug` is the entry it comes from, if any. */
const talks: { title: string; abstract: string; formats: string[]; minutes: [number, number]; slug: string | null }[] = [
  {
    title: 'Distribute capability, centralise the guardrail',
    abstract: "Let anyone add capability and hold the line in one place. Most of the guardrails I've built are gates. This is the case for making the guardrail a price instead, and for the places where a gate is still the right call.",
    formats: ['Keynote', 'Podcast'],
    minutes: [30, 45],
    slug: null,
  },
  {
    title: 'What level does this task deserve?',
    abstract: 'Two questions I ask before I hand anything to AI: what does it cost if the output is wrong, and can I check what comes back? Score the task and leave the person out of it.',
    formats: ['Talk', 'Workshop', 'Podcast'],
    minutes: [25, 40],
    slug: 'what-level-does-this-task-deserve',
  },
  {
    title: 'Sustainable pace just got faster',
    abstract: "Speed won, so why are teams using AI more tired than before? Most of them kept the old process and put AI on top of it, which means doing everything twice. The fix is substitution, and it starts with deciding what to stop.",
    formats: ['Talk', 'Panel', 'Podcast'],
    minutes: [30, 30],
    slug: 'sustainable',
  },
];

/** YouTube embeds that play on the page. */
const videos: { videoId: string; title: string; event: string; date: string }[] = [
  { videoId: 'Y938vr126C4', title: 'Tech Leaders Forum', event: 'Tech Leaders Forum, Edinburgh (CreateFuture)', date: 'March 2025' },
];

/** External links. Each list shows up as its own section once it has something in it. */
const podcasts: { title: string; show: string; url: string; date: string }[] = [
  // { title: 'Episode Title', show: 'Podcast Name', url: 'https://...', date: 'Month YYYY' },
];

const articles: { title: string; publication: string; url: string; date: string }[] = [
  // { title: 'Article Title', publication: 'Publication Name', url: 'https://...', date: 'Month YYYY' },
];

// ============================================

/** A 0 to 60 minute scale with the talk's length marked on it. */
function Duration({ range }: { range: [number, number] }) {
  const [a, b] = range;
  const text = a === b ? `${a} min` : `${a} to ${b} min`;
  return (
    <div>
      <p className="label flex items-baseline justify-between text-faint">
        <span>Length</span>
        <span className="text-ink">{text}</span>
      </p>
      <div aria-hidden className="relative mt-2 h-3 rounded-full bg-ink/10">
        <span className="absolute inset-y-0 rounded-full bg-accent" style={{ left: `${(a / 60) * 100}%`, width: `max(12px, ${((b - a) / 60) * 100}%)` }} />
        {[15, 30, 45].map((t) => (
          <span key={t} className="absolute inset-y-0 w-px bg-ink/25" style={{ left: `${(t / 60) * 100}%` }} />
        ))}
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between font-mono text-[0.6875rem] text-faint">
        <span>0</span><span>15</span><span>30</span><span>45</span><span>60</span>
      </div>
    </div>
  );
}

/** Podcasts or articles: a plain list of outbound links. */
function LinkList({ items }: { items: { title: string; where: string; url: string; date: string }[] }) {
  return (
    <ul role="list" className="mt-10 grid gap-1">
      {items.map((it) => (
        <li key={it.url} className="border-t-2 border-hair py-4 first:border-ink">
          <a href={it.url} target="_blank" rel="noopener noreferrer" className={`text-[1.25rem] font-bold ${textLinkClass}`}>{it.title}</a>
          <p className="label mt-1 text-faint">{it.where} · {it.date}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function SpeakingPage() {
  const numbers = entryNumbers(await getAllPosts());
  const sections = [
    'talks',
    'booking',
    ...(videos.length ? ['film'] : []),
    ...(podcasts.length ? ['podcasts'] : []),
    ...(articles.length ? ['articles'] : []),
    'organisers',
  ];
  const n = (id: string) => `B.${sections.indexOf(id) + 1}`;

  return (
    <>
      <PageHead
        label="Appendix B · Speaking"
        title="What I talk about."
        standfirst="I talk to engineering and product leaders about what AI is actually doing to the way teams work."
      >
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="label mr-1 text-faint">I&apos;ll do</span>
          <ul role="list" className="contents">
            {['Podcasts', 'Conference talks', 'Panels', 'Leadership offsites'].map((f) => (
              <li key={f} className="inline-flex h-9 items-center rounded-full border-2 border-ink px-4 text-[0.9375rem] font-bold text-ink">{f}</li>
            ))}
          </ul>
        </div>
      </PageHead>

      <PageSection id="talks" label={`${n('talks')} · Talks`} title="Three talks, ready to go.">
        <ol role="list" className="mt-10 grid grid-cols-3 gap-5 tab:grid-cols-1">
          {talks.map((t, i) => {
            const number = t.slug ? numbers.get(t.slug) : undefined;
            return (
              <li key={t.title} className="flex flex-col rounded-3xl border-2 border-ink bg-card p-6">
                <span className="label text-faint">Talk {String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-[1.6875rem] leading-[1.08] font-bold tracking-[-0.02em] text-ink">{t.title}</h3>
                <p className="mt-4 text-[1.0625rem] leading-[1.55] text-faint">{t.abstract}</p>
                <div className="mt-auto pt-6">
                  <ul role="list" aria-label="Formats" className="flex flex-wrap gap-1.5">
                    {t.formats.map((f) => (
                      <li key={f} className="label rounded-md bg-accent/8 px-2 py-1 text-accent">{f}</li>
                    ))}
                  </ul>
                  <div className="mt-5"><Duration range={t.minutes} /></div>
                  <div className="mt-5 border-t-2 border-ink/12 pt-4">
                    {t.slug && number ? (
                      <Link href={`/posts/${t.slug}`} className={`text-[0.9375rem] font-bold ${textLinkClass}`}>Read entry {number} first</Link>
                    ) : (
                      <span className="text-[0.9375rem] text-faint">New material, not written up yet</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </PageSection>

      <section id="booking" aria-labelledby="booking-title" className="col-bleed scroll-mt-4 border-b-2 border-ink">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-12 px-[var(--gutter)] py-20 tab:grid-cols-1 mob:py-14">
          <div>
            <p className="label text-accent">{n('booking')} · Booking</p>
            <h2 id="booking-title" className="mt-4 text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] text-ink">Hosting a podcast or running an event?</h2>
            <p className="mt-5 max-w-[46ch] text-[1.1875rem] leading-[1.6] text-faint">
              Email <a href="mailto:ben@benstewart.ai?subject=Speaking%20or%20podcast" className={`font-bold ${textLinkClass}`}>ben@benstewart.ai</a> with the date, the audience and the format. Or fill these in and I&apos;ll write the email for you.
            </p>
          </div>
          <BookingCard talks={talks.map((t) => t.title)} />
        </div>
      </section>

      {videos.length > 0 && (
        <PageSection id="film" label={`${n('film')} · On film`} title="See one first.">
          <div className="mt-10 grid gap-8">
            {videos.map((v) => (
              <figure key={v.videoId} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-end gap-8 tab:grid-cols-1">
                <div className="aspect-video overflow-hidden rounded-3xl border-2 border-ink bg-ink">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${v.videoId}`}
                    title={v.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <figcaption>
                  <span className="label block text-faint">{v.date}</span>
                  <span className="mt-2 block text-[1.75rem] leading-[1.1] font-bold tracking-[-0.02em] text-ink">{v.title}</span>
                  <span className="mt-2 block text-[1.0625rem] text-faint">{v.event}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </PageSection>
      )}

      {podcasts.length > 0 && (
        <PageSection id="podcasts" label={`${n('podcasts')} · Podcasts`} title="On the air.">
          <LinkList items={podcasts.map((p) => ({ title: p.title, where: p.show, url: p.url, date: p.date }))} />
        </PageSection>
      )}

      {articles.length > 0 && (
        <PageSection id="articles" label={`${n('articles')} · Articles`} title="Written elsewhere.">
          <LinkList items={articles.map((a) => ({ title: a.title, where: a.publication, url: a.url, date: a.date }))} />
        </PageSection>
      )}

      <PageSection id="organisers" label={`${n('organisers')} · For organisers`} title="Short bio, copy as is." last>
        <OrganiserKit>
          <Link href="/bio" className={`ml-2 text-[1rem] font-bold ${textLinkClass}`}>Full bio in Appendix A</Link>
        </OrganiserKit>
      </PageSection>
    </>
  );
}
