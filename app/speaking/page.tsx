import type { Metadata } from 'next';
import { textLinkClass } from '@/app/components/TextLink';

export const metadata: Metadata = {
  title: "Speaking",
  description: "Talks by Ben Stewart on leading engineering teams through AI: the guardrail as a price, what level a task deserves, and sustainable pace.",
  alternates: {
    canonical: 'https://www.benstewart.ai/speaking'
  },
  openGraph: {
    title: "Speaking - Ben Stewart",
    description: "Talks by Ben Stewart on leading engineering teams through AI: the guardrail as a price, what level a task deserves, and sustainable pace.",
    url: "https://www.benstewart.ai/speaking",
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
  }
};

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video w-full border border-hair">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function VideoItem({ videoId, title, event, date }: { videoId: string; title: string; event: string; date: string }) {
  return (
    <div className="mb-10">
      <YouTubeEmbed videoId={videoId} title={title} />
      <p className="mt-3 font-serif italic text-[0.9375rem] text-muted">
        {title}
        <span className="not-italic font-sans text-[13px] text-faint"> · {event} · {date}</span>
      </p>
    </div>
  );
}

function PodcastItem({ title, show, url, date }: { title: string; show: string; url: string; date: string }) {
  return (
    <div className="mb-4">
      <a
        href={url}
        className={`text-lg ${textLinkClass}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </a>
      <p className="font-sans text-[13px] text-faint mt-1">{show} · {date}</p>
    </div>
  );
}

function ArticleItem({ title, publication, url, date }: { title: string; publication: string; url: string; date: string }) {
  return (
    <div className="mb-4">
      <a
        href={url}
        className={`text-lg ${textLinkClass}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </a>
      <p className="font-sans text-[13px] text-faint mt-1">{publication} · {date}</p>
    </div>
  );
}

// ============================================
// ADD YOUR CONTENT HERE
// ============================================

const talks: { title: string; abstract: string; formats: string }[] = [
  {
    title: 'Distribute capability, centralise the guardrail',
    abstract: "Let anyone add capability and hold the line in one place. Most of the guardrails I've built are gates. This is the case for making the guardrail a price instead, and for the places where a gate is still the right call.",
    formats: 'Keynote, 30 to 45 minutes. Podcast.',
  },
  {
    title: 'What level does this task deserve?',
    abstract: 'Two questions I ask before I hand anything to AI: what does it cost if the output is wrong, and can I check what comes back? Score the task and leave the person out of it.',
    formats: 'Talk, 25 to 40 minutes. Workshop. Podcast.',
  },
  {
    title: 'Sustainable pace just got faster',
    abstract: "Speed won, so why are teams using AI more tired than before? Most of them kept the old process and put AI on top of it, which means doing everything twice. The fix is substitution, and it starts with deciding what to stop.",
    formats: 'Talk, 30 minutes. Panel. Podcast.',
  },
];

// Same text as the "Short bio" section on /bio (app/bio/page.mdx). Keep the two identical.
const shortBio =
  "Ben Stewart is VP of Engineering at Skyscanner, based in Glasgow. He writes field reports at benstewart.ai about leading engineering teams through AI: what's working, what's breaking and what the data says, in plain English. He started his career writing SQL in 2006.";

const videos: { videoId: string; title: string; event: string; date: string }[] = [
  { videoId: 'Y938vr126C4', title: 'Tech Leaders Forum', event: 'Tech Leaders Forum, Edinburgh (CreateFuture)', date: 'March 2025' },
];

const podcasts: { title: string; show: string; url: string; date: string }[] = [
  // { title: 'Episode Title', show: 'Podcast Name', url: 'https://...', date: 'Month YYYY' },
];

const articles: { title: string; publication: string; url: string; date: string }[] = [
  // { title: 'Article Title', publication: 'Publication Name', url: 'https://...', date: 'Month YYYY' },
];

// ============================================

export default function SpeakingPage() {
  return (
    <div>
      <h1 className="font-sans text-3xl font-bold tracking-[-0.025em] text-ink mb-4 mob:text-2xl">Speaking</h1>
      <p className="font-sans text-[1.1875rem] leading-[1.62] text-muted mb-12">
        {"I talk to engineering and product leaders about what AI is actually doing to the way teams work. I'll do podcasts, conference talks, panels and leadership offsites."}
      </p>

      <section>
        <h2 className="font-sans text-[1.625rem] font-bold tracking-[-0.025em] text-ink mt-12 mb-5">Talks</h2>
        <div className="grid gap-8">
          {talks.map((talk) => (
            <div key={talk.title}>
              <h3 className="font-sans text-[1.25rem] font-bold text-ink">{talk.title}</h3>
              <p className="mt-2 font-sans text-[1.0625rem] leading-[1.62] text-muted">{talk.abstract}</p>
              <p className="mt-2 font-sans text-[13px] text-faint">{talk.formats}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 border border-hair rounded-[20px] p-6">
        <p className="font-sans text-[1.0625rem] leading-[1.62] text-muted">
          Hosting a podcast or running an event? Email{' '}
          <a
            href="mailto:ben@benstewart.ai?subject=Speaking%20or%20podcast"
            className={textLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            ben@benstewart.ai
          </a>{' '}
          with the date, the audience and the format.
        </p>
      </div>

      <section>
        <h2 className="font-sans text-[1.625rem] font-bold tracking-[-0.025em] text-ink mt-12 mb-5">For organisers</h2>
        <p className="font-sans text-[13px] text-faint">Short bio, copy as is:</p>
        <p className="mt-2 font-sans text-[1.0625rem] leading-[1.62] text-muted">{shortBio}</p>
      </section>

      {videos.length > 0 && (
        <section>
          <h2 className="font-sans text-[1.625rem] font-bold tracking-[-0.025em] text-ink mt-12 mb-5">Videos</h2>
          <div className="grid gap-8">
            {videos.map((video, i) => (
              <VideoItem key={i} {...video} />
            ))}
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section>
          <h2 className="font-sans text-[1.625rem] font-bold tracking-[-0.025em] text-ink mt-12 mb-5">Podcasts</h2>
          <div>
            {podcasts.map((podcast, i) => (
              <PodcastItem key={i} {...podcast} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="font-sans text-[1.625rem] font-bold tracking-[-0.025em] text-ink mt-12 mb-5">Articles</h2>
          <div>
            {articles.map((article, i) => (
              <ArticleItem key={i} {...article} />
            ))}
          </div>
        </section>
      )}

      {videos.length === 0 && podcasts.length === 0 && articles.length === 0 && (
        <p className="font-sans text-muted">Content coming soon...</p>
      )}
    </div>
  );
}
