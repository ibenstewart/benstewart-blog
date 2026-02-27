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
    author: {
      '@type': 'Person',
      name: 'Ben Stewart',
      url: 'https://www.benstewart.ai/bio',
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
    name: 'Ben Stewart',
    url: 'https://www.benstewart.ai',
    jobTitle: 'Engineering Leader',
    worksFor: {
      '@type': 'Organization',
      name: 'Skyscanner',
    },
    sameAs: [
      'https://www.linkedin.com/in/ben-stewart-90944595/',
    ],
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
    description: 'Engineer turned leader. Currently at Skyscanner. Writing about software and leadership since 2006.',
    author: {
      '@type': 'Person',
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
