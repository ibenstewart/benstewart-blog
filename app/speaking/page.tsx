import Link from 'next/link';

export const metadata = {
  title: "Speaking",
  description: "Conference talks, podcast appearances, and articles by Ben Stewart"
};

function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video w-full mb-4">
      <iframe
        className="w-full h-full rounded-lg"
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
    <div className="mb-8">
      <YouTubeEmbed videoId={videoId} title={title} />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">{event} · {date}</p>
    </div>
  );
}

function PodcastItem({ title, show, url, date }: { title: string; show: string; url: string; date: string }) {
  return (
    <div className="mb-4">
      <Link
        href={url}
        className="text-lg underline decoration-neutral-500 underline-offset-[2.5px] hover:decoration-neutral-400 dark:decoration-neutral-500 dark:hover:decoration-neutral-600 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </Link>
      <p className="text-neutral-600 dark:text-neutral-400">{show} · {date}</p>
    </div>
  );
}

function ArticleItem({ title, publication, url, date }: { title: string; publication: string; url: string; date: string }) {
  return (
    <div className="mb-4">
      <Link
        href={url}
        className="text-lg underline decoration-neutral-500 underline-offset-[2.5px] hover:decoration-neutral-400 dark:decoration-neutral-500 dark:hover:decoration-neutral-600 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </Link>
      <p className="text-neutral-600 dark:text-neutral-400">{publication} · {date}</p>
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
      <h1 className="text-2xl md:text-3xl font-medium mb-4">Speaking</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-12">
        Conference talks, podcast appearances, and articles about engineering leadership.
      </p>

      {videos.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-medium mb-6">Videos</h2>
          <div className="grid gap-8">
            {videos.map((video, i) => (
              <VideoItem key={i} {...video} />
            ))}
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-medium mb-6">Podcasts</h2>
          <div>
            {podcasts.map((podcast, i) => (
              <PodcastItem key={i} {...podcast} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-medium mb-6">Articles</h2>
          <div>
            {articles.map((article, i) => (
              <ArticleItem key={i} {...article} />
            ))}
          </div>
        </section>
      )}

      {videos.length === 0 && podcasts.length === 0 && articles.length === 0 && (
        <p className="text-neutral-500 italic">Content coming soon...</p>
      )}
    </div>
  );
}
