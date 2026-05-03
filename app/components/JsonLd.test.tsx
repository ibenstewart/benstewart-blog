import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  ArticleJsonLd,
  FAQJsonLd,
  PersonJsonLd,
  WebsiteJsonLd,
} from './JsonLd';

function readJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!script) throw new Error('no JSON-LD script tag rendered');
  // Reverse the < escape so JSON.parse can read it back.
  const text = script.innerHTML.replace(/\\u003c/g, '<');
  return { raw: script.innerHTML, parsed: JSON.parse(text) };
}

describe('ArticleJsonLd', () => {
  const baseProps = {
    title: 'A Post',
    description: 'A description.',
    date: '2024-01-15',
    url: 'https://www.benstewart.ai/posts/a-post',
  };

  it('emits a BlogPosting with required schema fields', () => {
    const { container } = render(<ArticleJsonLd {...baseProps} />);
    const { parsed } = readJsonLd(container);

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('BlogPosting');
    expect(parsed.headline).toBe(baseProps.title);
    expect(parsed.description).toBe(baseProps.description);
    expect(parsed.datePublished).toBe(baseProps.date);
    expect(parsed.url).toBe(baseProps.url);
    expect(parsed.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': baseProps.url,
    });
    expect(parsed.author.name).toBe('Ben Stewart');
    expect(parsed.publisher.name).toBe('Ben Stewart');
  });

  it('defaults dateModified to date when lastModified is omitted', () => {
    const { container } = render(<ArticleJsonLd {...baseProps} />);
    const { parsed } = readJsonLd(container);
    expect(parsed.dateModified).toBe(baseProps.date);
  });

  it('uses lastModified for dateModified when provided', () => {
    const { container } = render(
      <ArticleJsonLd {...baseProps} lastModified="2024-03-20" />,
    );
    const { parsed } = readJsonLd(container);
    expect(parsed.dateModified).toBe('2024-03-20');
    expect(parsed.datePublished).toBe(baseProps.date);
  });

  it('omits image when not provided', () => {
    const { container } = render(<ArticleJsonLd {...baseProps} />);
    const { parsed } = readJsonLd(container);
    expect(parsed).not.toHaveProperty('image');
  });

  it('includes image when provided', () => {
    const { container } = render(
      <ArticleJsonLd
        {...baseProps}
        image="https://www.benstewart.ai/images/posts/a-post-0.png"
      />,
    );
    const { parsed } = readJsonLd(container);
    expect(parsed.image).toBe(
      'https://www.benstewart.ai/images/posts/a-post-0.png',
    );
  });

  it('escapes < characters in the rendered script to prevent HTML injection', () => {
    const { container } = render(
      <ArticleJsonLd
        {...baseProps}
        title='Closing tag </script><script>alert(1)</script>'
        description="contains <b>html</b>"
      />,
    );
    const { raw, parsed } = readJsonLd(container);

    // Raw HTML must not contain any literal '<'
    expect(raw).not.toMatch(/</);
    expect(raw).toContain('\\u003c');

    // After unescaping, the JSON parses cleanly and preserves the original strings.
    expect(parsed.headline).toBe(
      'Closing tag </script><script>alert(1)</script>',
    );
    expect(parsed.description).toBe('contains <b>html</b>');
  });
});

describe('FAQJsonLd', () => {
  it('renders FAQPage with one mainEntity per question', () => {
    const faqs = [
      { question: 'What is this?', answer: 'A blog.' },
      { question: 'Who writes it?', answer: 'Ben.' },
    ];
    const { container } = render(<FAQJsonLd faqs={faqs} />);
    const { parsed } = readJsonLd(container);

    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'What is this?',
      acceptedAnswer: { '@type': 'Answer', text: 'A blog.' },
    });
    expect(parsed.mainEntity[1].name).toBe('Who writes it?');
  });

  it('renders an empty mainEntity array when no faqs are passed', () => {
    const { container } = render(<FAQJsonLd faqs={[]} />);
    const { parsed } = readJsonLd(container);
    expect(parsed.mainEntity).toEqual([]);
  });

  it('escapes < in question/answer text', () => {
    const { container } = render(
      <FAQJsonLd
        faqs={[{ question: '</script>', answer: '<img onerror=x>' }]}
      />,
    );
    const { raw, parsed } = readJsonLd(container);
    expect(raw).not.toMatch(/</);
    expect(parsed.mainEntity[0].name).toBe('</script>');
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe('<img onerror=x>');
  });
});

describe('PersonJsonLd', () => {
  it('emits a Person schema with stable identity fields', () => {
    const { container } = render(<PersonJsonLd />);
    const { parsed } = readJsonLd(container);

    expect(parsed['@type']).toBe('Person');
    expect(parsed.name).toBe('Ben Stewart');
    expect(parsed.url).toBe('https://www.benstewart.ai');
    expect(parsed.jobTitle).toBe('Engineering Leader');
    expect(parsed.worksFor.name).toBe('Skyscanner');
    expect(parsed.sameAs).toContain(
      'https://www.linkedin.com/in/ben-stewart-90944595/',
    );
  });
});

describe('WebsiteJsonLd', () => {
  it('emits a WebSite schema for the site root', () => {
    const { container } = render(<WebsiteJsonLd />);
    const { parsed } = readJsonLd(container);

    expect(parsed['@type']).toBe('WebSite');
    expect(parsed.name).toBe('Ben Stewart');
    expect(parsed.url).toBe('https://www.benstewart.ai');
    expect(parsed.author.name).toBe('Ben Stewart');
  });
});
