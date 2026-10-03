import { Tweet } from 'react-tweet';

type TweetEmbedProps = {
  /** The tweet's numeric ID, the last part of its URL. */
  id: string;
  /** Link for the fallback if the tweet can't be fetched, e.g. the x.com URL. */
  url: string;
  /** Fallback link text, e.g. "Jaatster's post on X". */
  label?: string;
};

/**
 * A tweet rendered to static HTML at build time by react-tweet, so readers
 * never load X's scripts. If the fetch fails (deleted tweet, API down) it
 * falls back to a plain link rather than react-tweet's "Tweet not found" box.
 * The `light` class pins react-tweet's own light theme; the site has no dark mode.
 */
export function TweetEmbed({ id, url, label = 'View the post on X' }: TweetEmbedProps) {
  return (
    <div className="tweet-embed light flex justify-center">
      <Tweet
        id={id}
        components={{
          TweetNotFound: () => (
            <p className="w-full rounded-[20px] border border-hair px-7 py-6 text-center text-[1.0625rem] font-medium">
              <a
                href={url}
                className="text-ink underline decoration-accent decoration-2 underline-offset-[0.22em] hover:text-accent"
              >
                {label}
              </a>
            </p>
          ),
        }}
      />
    </div>
  );
}
