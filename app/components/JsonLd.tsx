import { SITE_DESCRIPTION } from '@/lib/site';

export const PERSON_ID = 'https://www.benstewart.ai/#person';

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
};

export function ArticleJsonLd({ title, description, date, lastModified, url, image }: ArticleJsonLdProps) {
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
      name: 'Ben Stewart',
      url: 'https://www.benstewart.ai',
    },
    ...(image && { image: image }),
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
    name: 'Ben Stewart',
    url: 'https://www.benstewart.ai',
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
