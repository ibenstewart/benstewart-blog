import { SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

export const PERSON_ID = 'https://www.benstewart.ai/#person';
export const WEBSITE_ID = 'https://www.benstewart.ai/#website';

const SAME_AS = [
  'https://www.linkedin.com/in/ben-stewart-90944595/',
  'https://github.com/ibenstewart',
  'https://x.com/benstewart__',
];

type ArticleJsonLdProps = {
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  url: string;
  image?: string;
  /** The entry's chapter name, e.g. "Working with AI". */
  section?: string;
  /** Every theme the entry is tagged with, by name. */
  keywords?: string[];
};

export function ArticleJsonLd({ title, description, date, lastModified, url, image, section, keywords }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    datePublished: date,
    dateModified: lastModified ?? date,
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Ben Stewart',
      url: 'https://www.benstewart.ai/bio',
      sameAs: SAME_AS,
    },
    publisher: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Ben Stewart',
      url: 'https://www.benstewart.ai',
    },
    isPartOf: { '@type': 'WebSite', '@id': WEBSITE_ID },
    inLanguage: 'en-GB',
    ...(image && { image: image }),
    ...(section && { articleSection: section }),
    ...(keywords && keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}

type FAQItem = { question: string; answer: string };
type FAQJsonLdProps = { faqs: FAQItem[] };

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}

export function PersonJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Ben Stewart',
    url: 'https://www.benstewart.ai',
    description: 'Engineering leader in Glasgow. Writes field reports on leading engineering teams through AI.',
    knowsAbout: ['Engineering leadership', 'AI adoption in engineering teams', 'Software delivery'],
    jobTitle: 'VP of Engineering',
    worksFor: {
      '@type': 'Organization',
      name: 'Skyscanner',
    },
    sameAs: SAME_AS,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Ben Stewart',
    url: 'https://www.benstewart.ai',
    inLanguage: 'en-GB',
    description: SITE_DESCRIPTION,
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Ben Stewart',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}

/**
 * The bio page as a ProfilePage about the site's Person. The Person itself is
 * in the root layout on every page; this points at it by @id.
 */
export function ProfilePageJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE_URL}/bio`,
    name: 'About Ben Stewart',
    mainEntity: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
