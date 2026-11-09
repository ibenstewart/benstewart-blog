import type { Metadata } from 'next';

export const SITE_URL = 'https://www.benstewart.ai';
export const SITE_NAME = 'Ben Stewart';
export const SITE_TITLE = "Ben Stewart | Leading engineering teams through AI";
export const SITE_DESCRIPTION =
  "I run engineering teams working out AI in real time. Field reports on what's working, what's breaking and what the data says, in plain English.";

/**
 * Metadata for a top-level page (not a post). A page's `openGraph` and
 * `alternates` replace the root layout's wholesale rather than merging, so
 * this puts back what the layout sets: og:type, og:site_name, the share card
 * and the RSS link. `absolute` skips the "| Ben Stewart" suffix.
 */
export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
}: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const full = absolute ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: url, types: { 'application/rss+xml': '/feed.xml' } },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: full,
      description,
      url,
      images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    },
  };
}
