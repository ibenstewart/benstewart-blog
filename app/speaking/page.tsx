import type { Metadata } from 'next';
import { textLinkClass } from '@/app/components/TextLink';

export const metadata: Metadata = {
  title: "Speaking",
  description: "Conference talks, podcast appearances, and articles by Ben Stewart",
  alternates: {
    canonical: 'https://www.benstewart.ai/speaking'
  },
  openGraph: {
    title: "Speaking - Ben Stewart",
    description: "Conference talks, podcast appearances, and articles by Ben Stewart",
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

const videos: { videoId: string; title: string; event: string; date: string }[] = [
  { videoId: 'Y938vr126C4', title: 'Edinburgh Tech Leaders Forum', event: 'Edinburgh Tech Leaders Forum', date: '2024' },
];

const podcasts: { title: string; show: string; url: string; date: string }[] = [
  // { title: 'Episode Title', show: 'Podcast Name', url: 'https://...', date: '2024' },
];

const articles: { title: string; publication: string; url: string; date: string }[] = [
  // { title: 'Article Title', publication: 'Publication Name', url: 'https://...', date: '2024' },
];

// ============================================

export default function SpeakingPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-4">Speaking</h1>
      <p className="font-serif text-[1.1875rem] leading-[1.7] text-muted mb-12">
        Conference talks, podcast appearances, and articles about engineering leadership.
      </p>

      {videos.length > 0 && (
        <section>
          <h2 className="font-serif text-[1.625rem] font-semibold text-ink mt-12 mb-5">Videos</h2>
          <div className="grid gap-8">
            {videos.map((video, i) => (
              <VideoItem key={i} {...video} />
            ))}
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section>
          <h2 className="font-serif text-[1.625rem] font-semibold text-ink mt-12 mb-5">Podcasts</h2>
          <div>
            {podcasts.map((podcast, i) => (
              <PodcastItem key={i} {...podcast} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="font-serif text-[1.625rem] font-semibold text-ink mt-12 mb-5">Articles</h2>
          <div>
            {articles.map((article, i) => (
              <ArticleItem key={i} {...article} />
            ))}
          </div>
        </section>
      )}

      {videos.length === 0 && podcasts.length === 0 && articles.length === 0 && (
        <p className="font-serif italic text-muted">Content coming soon...</p>
      )}
    </div>
  );
}
