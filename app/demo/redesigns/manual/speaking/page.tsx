import Link from 'next/link';
import { getConceptPosts, THEMES } from '../../_lib/data';
import { BG, BLUE, GREY, HI, INK, MANUAL_CSS, chapters, entryHref, mono } from '../content';
import { ManualFooter, ManualTopBar } from '../chrome';
import { CopyBio } from '../bio/CopyBio';
import { BookingCard } from './BookingCard';

export const metadata = { title: 'Speaking · Field manual' };

/** The talks from /speaking, with their formats and lengths split out for the cards. */
const TALKS = [
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
] as const;

const SHORT_BIO =
  "Ben Stewart is VP of Engineering at Skyscanner, based in Glasgow. He writes field reports at benstewart.ai about leading engineering teams through AI: what's working, what's breaking and what the data says, in plain English. He started his career writing SQL in 2006.";

const VIDEOS = [
  { videoId: 'Y938vr126C4', title: 'Tech Leaders Forum', event: 'Tech Leaders Forum, Edinburgh (CreateFuture)', date: 'March 2025' },
];

/** A 0 to 60 minute scale with the talk's length marked on it. */
function Duration({ range }: { range: readonly [number, number] }) {
  const [a, b] = range;
  const label = a === b ? `${a} MIN` : `${a} TO ${b} MIN`;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>
        <span>LENGTH</span>
        <span style={{ color: INK }}>{label}</span>
      </div>
      <div className="relative mt-2 h-3 rounded-full" style={{ background: 'rgba(14,15,18,.1)' }} aria-hidden>
        <span className="absolute inset-y-0 rounded-full" style={{ left: `${(a / 60) * 100}%`, width: `max(12px, ${((b - a) / 60) * 100}%)`, background: BLUE }} />
        {[15, 30, 45].map((t) => (
          <span key={t} className="absolute inset-y-0 w-px" style={{ left: `${(t / 60) * 100}%`, background: 'rgba(14,15,18,.25)' }} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px]" style={{ ...mono, color: GREY }} aria-hidden>
        <span>0</span><span>15</span><span>30</span><span>45</span><span>60</span>
      </div>
    </div>
  );
}

export default async function SpeakingPage() {
  const posts = await getConceptPosts({ includeDrafts: true });
  const numbers = new Map(chapters(posts, [...THEMES]).flatMap((c) => c.entries.map((e) => [e.post.slug, e.number] as const)));
  const label = 'text-[13px] tracking-[0.1em]';
  const h2 = 'mt-4 text-[clamp(36px,4.4vw,64px)] font-bold leading-[0.95] tracking-[-0.04em]';

  return (
    <div className="rd-root" style={{ background: BG, color: INK }}>
      <style>{MANUAL_CSS}</style>
      <ManualTopBar current="speaking" />

      <header className="border-b-2 px-10 pb-12 pt-12 mob:px-6 mob:pb-9 mob:pt-8" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className={label} style={{ ...mono, color: GREY }}>APPENDIX B · SPEAKING</p>
          <h1 className="mt-5 text-[clamp(44px,6.6vw,96px)] font-bold leading-[0.92] tracking-[-0.045em]">Talks from the field.</h1>
          <p className="mt-6 max-w-[34ch] text-[clamp(21px,2.1vw,28px)] font-medium leading-[1.3] tracking-[-0.01em]">
            <span className="fm-hl">I talk to engineering and product leaders about what AI is actually doing to the way teams work.</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] tracking-[0.08em]" style={{ ...mono, color: GREY }}>I&apos;LL DO</span>
            {['Podcasts', 'Conference talks', 'Panels', 'Leadership offsites'].map((f) => (
              <span key={f} className="inline-flex h-9 items-center rounded-full border-2 px-4 text-[15px] font-bold" style={{ borderColor: INK }}>{f}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Talks */}
      <section id="talks" className="border-b-2 px-10 py-20 mob:px-6 mob:py-14" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className={label} style={{ ...mono, color: BLUE }}>B.1 · TALKS</p>
          <h2 className={h2}>Three talks, ready to go.</h2>
          <ol className="mt-10 grid grid-cols-3 gap-5 tab:grid-cols-1">
            {TALKS.map((t, i) => {
              const n = t.slug ? numbers.get(t.slug) : undefined;
              return (
                <li key={t.title} className="flex flex-col rounded-3xl border-2 p-6" style={{ borderColor: INK, background: '#fff' }}>
                  <span className="text-[12px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>TALK {String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-[27px] font-bold leading-[1.08] tracking-[-0.02em]">{t.title}</h3>
                  <p className="mt-4 text-[17px] leading-[1.55]" style={{ color: GREY }}>{t.abstract}</p>
                  <div className="mt-auto pt-6">
                    <ul className="flex flex-wrap gap-1.5">
                      {t.formats.map((f) => (
                        <li key={f} className="rounded-md px-2 py-1 text-[12px] tracking-[0.06em]" style={{ ...mono, background: 'rgba(0,53,147,.08)', color: BLUE }}>{f.toUpperCase()}</li>
                      ))}
                    </ul>
                    <div className="mt-5"><Duration range={t.minutes} /></div>
                    <div className="mt-5 border-t-2 pt-4" style={{ borderColor: 'rgba(14,15,18,.12)' }}>
                      {t.slug && n ? (
                        <Link href={entryHref(t.slug)} className="text-[15px] font-bold underline decoration-2 underline-offset-4" style={{ color: INK, textDecorationColor: BLUE }}>
                          Read entry {n} first
                        </Link>
                      ) : (
                        <span className="text-[15px]" style={{ color: GREY }}>New material, not written up yet</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="border-b-2 px-10 py-20 mob:px-6 mob:py-14" style={{ borderColor: INK }}>
        <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-12 tab:grid-cols-1">
          <div>
            <p className={label} style={{ ...mono, color: BLUE }}>B.2 · BOOKING</p>
            <h2 className={h2}>Hosting a podcast or running an event?</h2>
            <p className="mt-5 max-w-[46ch] text-[19px] leading-[1.6]" style={{ color: GREY }}>
              Email <a href="mailto:ben@benstewart.ai?subject=Speaking%20or%20podcast" className="font-bold underline decoration-2 underline-offset-4" style={{ color: INK, textDecorationColor: BLUE }}>ben@benstewart.ai</a> with the date, the audience and the format. Or fill these in and I&apos;ll write the email for you.
            </p>
          </div>
          <BookingCard talks={TALKS.map((t) => t.title)} />
        </div>
      </section>

      {/* On film */}
      <section id="film" className="border-b-2 px-10 py-20 mob:px-6 mob:py-14" style={{ borderColor: INK }}>
        <div className="mx-auto max-w-[1180px]">
          <p className={label} style={{ ...mono, color: BLUE }}>B.3 · ON FILM</p>
          <h2 className={h2}>See one first.</h2>
          <div className="mt-10 grid gap-8">
            {VIDEOS.map((v) => (
              <figure key={v.videoId} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-end gap-8 tab:grid-cols-1">
                <div className="aspect-video overflow-hidden rounded-3xl border-2" style={{ borderColor: INK, background: INK }}>
                  <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${v.videoId}`} title={v.title} loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <figcaption>
                  <span className="block text-[13px] tracking-[0.1em]" style={{ ...mono, color: GREY }}>{v.date.toUpperCase()}</span>
                  <span className="mt-2 block text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">{v.title}</span>
                  <span className="mt-2 block text-[17px]" style={{ color: GREY }}>{v.event}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* For organisers */}
      <section id="organisers" className="px-10 py-20 mob:px-6 mob:py-14">
        <div className="mx-auto max-w-[1180px]">
          <p className={label} style={{ ...mono, color: BLUE }}>B.4 · FOR ORGANISERS</p>
          <h2 className={h2}>Short bio, copy as is.</h2>
          <blockquote className="mt-8 max-w-[760px] rounded-3xl border-2 p-7 text-[20px] leading-[1.55]" style={{ borderColor: INK, background: '#fff' }}>
            {SHORT_BIO}
          </blockquote>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CopyBio text={SHORT_BIO} />
            <a href="/images/ben-stewart.jpg" download className="inline-flex h-11 items-center rounded-xl border-2 px-4 text-[16px] font-bold no-underline" style={{ borderColor: INK, color: INK }}>
              Download photo
            </a>
            <Link href="/demo/redesigns/manual/bio" className="ml-2 text-[16px] font-bold underline decoration-2 underline-offset-4" style={{ color: INK, textDecorationColor: HI }}>
              Full bio in Appendix A
            </Link>
          </div>
        </div>
      </section>

      <ManualFooter status="GLASGOW · APPENDIX B · SPEAKING" />
    </div>
  );
}
