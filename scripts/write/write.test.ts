// @vitest-environment node
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { diffParagraphs, diffWords } from './diff.mjs';
import { bodyStart, getFields, setField } from './fields.mjs';
import { checkStyle, openComponent } from './house-style.mjs';
import { findLine, offsetInLine, plain, visibleLines } from './locate.mjs';
import { createDesk } from './server.mjs';

const POST = `export const metadata = {
  title: "The Long Search Title",
  date: "2026-01-02",
  themes: ["ai"],
  quote: "Speed won.",
  subtitle: "A standfirst",
  description: "What it is about.",
  alternates: {
    canonical: 'https://www.benstewart.ai/posts/my-post'
  },
  openGraph: {
    type: "article",
    siteName: "Ben Stewart",
    publishedTime: "2026-01-02",
    title: "The Long Search Title",
    description: "A different share description.",
    url: "https://www.benstewart.ai/posts/my-post",
  }
};

<PostHeader title="Short Title" slug="my-post" />

<PostSchema
  title="The Long Search Title"
  description="What it is about."
  date="2026-01-02"
  slug="my-post"
/>

That debate is over. **Speed won.** The question is how.

## The wrong question

- First thing
- Second thing

<KeyPoint>Read it before you send it.</KeyPoint>

<PostNav slug="my-post" />
`;

describe('fields', () => {
  it('finds where the writing starts, past the metadata, PostHeader and PostSchema', () => {
    expect(POST.slice(bodyStart(POST))).toMatch(/^That debate is over\./);
    expect(bodyStart('Just prose, no metadata.')).toBe(-1);
  });

  it('skips a leading FAQJsonLd block too', () => {
    const withFaq = POST.replace('That debate', '<FAQJsonLd faqs={[\n  { question: "Q?", answer: "A." }\n]} />\n\nThat debate');
    expect(withFaq.slice(bodyStart(withFaq))).toMatch(/^That debate is over\./);
  });

  it('reads the fields the way the site does', () => {
    expect(getFields(POST)).toMatchObject({
      displayTitle: 'Short Title',
      seoTitle: 'The Long Search Title',
      subtitle: 'A standfirst',
      description: 'What it is about.',
      quote: 'Speed won.',
      date: '2026-01-02',
      draft: false,
    });
  });

  it('changes nothing when a field is set to the value it already has', () => {
    const fields = getFields(POST);
    for (const name of ['displayTitle', 'seoTitle', 'subtitle', 'description', 'quote'] as const) {
      expect(setField(POST, name, fields[name]!)).toBe(POST);
    }
  });

  it('sets the display title on PostHeader only', () => {
    const next = setField(POST, 'displayTitle', 'New Name');
    expect(next).toContain('<PostHeader title="New Name" slug="my-post" />');
    expect(getFields(next).seoTitle).toBe('The Long Search Title');
  });

  it('keeps the search title in step across metadata, openGraph and PostSchema', () => {
    const next = setField(POST, 'seoTitle', 'Another Title');
    expect(next.match(/Another Title/g)).toHaveLength(3);
    expect(next).not.toContain('The Long Search Title');
  });

  it('leaves an openGraph value alone when it was different on purpose', () => {
    const next = setField(POST, 'description', 'New description.');
    expect(next.match(/New description\./g)).toHaveLength(2);
    expect(next).toContain('description: "A different share description."');
  });

  it('turns straight double quotes into single ones so the JSX prop stays valid', () => {
    const next = setField(POST, 'description', 'He said "no".');
    expect(next).toContain(`description="He said 'no'."`);
    expect(getFields(next).description).toBe("He said 'no'.");
  });

  it('escapes a double quote in the pull quote', () => {
    const next = setField(POST, 'quote', 'She said "go".');
    expect(next).toContain('quote: "She said \\"go\\".",');
    expect(getFields(next).quote).toBe('She said "go".');
  });

  it('removes an emptied subtitle and adds one back under the quote', () => {
    const without = setField(POST, 'subtitle', '');
    expect(without).not.toContain('subtitle:');
    const again = setField(without, 'subtitle', 'Back again');
    expect(again).toContain('  quote: "Speed won.",\n  subtitle: "Back again",\n');
  });

  it('never touches the body', () => {
    const body = POST.slice(bodyStart(POST));
    const next = setField(POST, 'seoTitle', 'That debate is over.');
    expect(next.slice(bodyStart(next))).toBe(body);
  });
});

describe('house style', () => {
  const rules = (body: string) => checkStyle(POST.replace('That debate is over.', body)).notes.map((n) => n.rule);

  it('has nothing to say about a clean post', () => {
    expect(checkStyle(POST).notes).toEqual([]);
  });

  it('flags a sentence that starts with And, But or Because', () => {
    const { notes } = checkStyle(POST.replace('That debate is over.', 'It works. But nobody knows why.'));
    expect(notes).toHaveLength(1);
    expect(notes[0].rule).toBe('opener');
    expect(POST.replace('That debate is over.', 'It works. But nobody knows why.').slice(notes[0].start, notes[0].end)).toBe('But');
    expect(rules('And so it goes.')).toEqual(['opener']);
    expect(rules('Because it does.')).toEqual(['opener']);
  });

  it('leaves the same words alone mid-sentence', () => {
    expect(rules('It works, but nobody knows why, and that is fine because it does.')).toEqual([]);
  });

  it('offers the UK spelling', () => {
    const { notes } = checkStyle(POST.replace('That debate is over.', 'We organized the color of the center.'));
    expect(notes.map((n) => n.fix)).toEqual(['organised', 'colour', 'centre']);
  });

  it('ignores code, links, JSX props and the metadata', () => {
    const body = 'See [the docs](https://example.com/color/organize).\n\n```\nBut color = organize()\n```\n\n`And color` here.\n\n<Figure src="/images/color.png" alt="But a color" />';
    expect(rules(body)).toEqual([]);
  });

  it('flags hedging and corporate speak', () => {
    expect(rules('Perhaps we could leverage it.')).toEqual(['hedge', 'corporate']);
  });

  it('only minds "it’s not X, it’s Y" the second time', () => {
    expect(rules("That's not a win. That's a tax.")).toEqual([]);
    expect(rules("That's not a win. That's a tax. It isn't speed, it's waste.")).toEqual(['flip', 'flip']);
  });

  it('checks the pull quote is in the post word for word', () => {
    expect(checkStyle(POST.replace('quote: "Speed won."', 'quote: "Speed always wins."')).notes.map((n) => n.rule)).toEqual(['quote']);
    // Emphasis marks in the body don't count against it.
    expect(checkStyle(POST.replace('quote: "Speed won."', 'quote: "Speed won. The question is how."')).notes).toEqual([]);
  });

  it('spots a component that is still being typed', () => {
    expect(openComponent(POST)).toBeNull();
    expect(openComponent('<Callout type="tip">Half written')).toBe('Callout');
    expect(openComponent('<Callout type="ti')).toBe('Callout');
    expect(openComponent('<Callout type="tip">Done</Callout>\n\n<Figure src="/a.png" alt="a > b" />')).toBeNull();
    expect(openComponent('<Stats items={[{ value: "1", label: "a" }]} />\n\n<Lede>\nText\n</Lede>')).toBeNull();
    expect(openComponent('Generics like `Array<String>` and\n\n```\n<Open>\n```')).toBeNull();
  });

  it('counts words the way the entry’s meta line does', () => {
    expect(checkStyle(POST).stats).toMatchObject({ words: 26, minutes: 1, emphasis: 1, hasTLDR: false, swears: 0 });
  });
});

describe('locate', () => {
  const body = POST.slice(bodyStart(POST));
  const lines = visibleLines(body);

  it('reduces a line of MDX to what a reader sees', () => {
    expect(plain('That debate is over. **Speed won.** The [question](https://x.y) is *how*.')).toBe('that debate is over. speed won. the question is how.');
    expect(plain('## The wrong question')).toBe('the wrong question');
    expect(plain('- First thing')).toBe('first thing');
    expect(plain('<KeyPoint>Read it before you send it.</KeyPoint>')).toBe('read it before you send it.');
  });

  it('finds the source line for a rendered paragraph, heading, list item and component', () => {
    const at = (rendered: string) => body.slice(lines[findLine(lines, rendered)].start).split('\n')[0];
    expect(at('That debate is over. Speed won. The question is how.')).toMatch(/^That debate/);
    expect(at('The wrong question')).toBe('## The wrong question');
    expect(at('Second thing')).toBe('- Second thing');
    expect(at('Read it before you send it.')).toMatch(/^<KeyPoint>/);
    expect(findLine(lines, 'Nothing like this is in the post')).toBe(-1);
  });

  it('uses the position on the page to choose between two identical lines', () => {
    const twice = visibleLines('Same line here, twice over.\n\nOther.\n\nMore.\n\nSame line here, twice over.');
    expect(findLine(twice, 'Same line here, twice over.', 0)).toBe(0);
    expect(findLine(twice, 'Same line here, twice over.', 1)).toBe(3);
  });

  it('knows which image a line holds', () => {
    expect(visibleLines('![Alt text](/images/posts/a-0.jpg)')[0].image).toBe('/images/posts/a-0.jpg');
    expect(visibleLines('<Figure src="/images/posts/b-1.png" alt="x" />')[0].image).toBe('/images/posts/b-1.png');
  });

  it('lands on the clicked word when the source has it verbatim', () => {
    expect(offsetInLine('That debate is over. **Speed won.**', 'debate is over.')).toBe(5);
    expect(offsetInLine('That debate is over.', 'not there')).toBe(0);
  });
});

describe('diff', () => {
  it('marks the words that changed', () => {
    expect(diffWords('Speed won the day.', 'Speed lost the day.').map((p) => `${p.type}:${p.value.trim()}`)).toEqual(['same:Speed', 'del:won', 'add:lost', 'same:the', 'same:day.']);
  });

  it('pairs a rewritten paragraph and reports added and removed ones', () => {
    const steps = diffParagraphs('One.\n\nTwo is here.\n\nThree.', 'One.\n\nTwo was here.\n\nThree.\n\nFour.');
    expect(steps.map((s) => s.type)).toEqual(['same', 'change', 'same', 'add']);
    expect(diffParagraphs('One.\n\nTwo.', 'One.').map((s) => s.type)).toEqual(['same', 'del']);
  });
});

describe('the desk server', () => {
  let dir: string;
  let base: string;
  let server: ReturnType<typeof createDesk>;
  const file = () => path.join(dir, 'app', 'posts', 'my-post', 'page.mdx');
  const put = (slug: string, body: unknown, headers: Record<string, string> = {}) =>
    fetch(`${base}/__write/api/entry/${slug}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', origin: base, ...headers },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'desk-'));
    await mkdir(path.join(dir, 'app', 'posts', 'my-post'), { recursive: true });
    await writeFile(file(), POST);
    await writeFile(path.join(dir, 'secret.txt'), 'keep out');
    server = createDesk({ repo: dir, claude: '' });
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise((done) => server.close(done));
    await rm(dir, { recursive: true, force: true });
  });

  it('lists the entries', async () => {
    const { entries } = await (await fetch(`${base}/__write/api/entries`)).json();
    expect(entries).toEqual([{ slug: 'my-post', title: 'Short Title', date: '2026-01-02', draft: false, words: 26, chapter: 'Working with AI' }]);
  });

  it('reads an entry with its hash and what the validator makes of it', async () => {
    const data = await (await fetch(`${base}/__write/api/entry/my-post`)).json();
    expect(data.content).toBe(POST);
    expect(data.hash).toMatch(/^[0-9a-f]{40}$/);
    expect(data.problems).toContain('missing openGraph.images');
    expect(data.committed).toBeNull();
  });

  it('saves, then refuses a save made from a stale copy', async () => {
    const { hash } = await (await fetch(`${base}/__write/api/entry/my-post`)).json();
    const edited = POST.replace('Speed won.**', 'Speed won.** Obviously.');
    const saved = await put('my-post', { content: edited, baseHash: hash });
    expect(saved.status).toBe(200);
    expect(await readFile(file(), 'utf-8')).toBe(edited);

    const stale = await put('my-post', { content: POST, baseHash: hash });
    expect(stale.status).toBe(409);
    expect((await stale.json()).content).toBe(edited);
    expect(await readFile(file(), 'utf-8')).toBe(edited);
  });

  it('only writes page.mdx inside an existing post folder', async () => {
    for (const slug of ['nope', '..', '%2e%2e', '..%2f..%2fsecret', 'my-post%2f..%2f..']) {
      expect((await put(slug, { content: 'x', baseHash: 'x', force: true })).status).toBe(404);
    }
    expect(await readFile(path.join(dir, 'secret.txt'), 'utf-8')).toBe('keep out');
  });

  it('refuses writes from another site', async () => {
    expect((await put('my-post', { content: 'x', force: true }, { origin: 'https://evil.example' })).status).toBe(403);
    expect((await put('my-post', { content: 'x', force: true }, { 'content-type': 'text/plain' })).status).toBe(403);
  });

  it('serves its own files and nothing else from the repo', async () => {
    expect((await fetch(`${base}/__write/src/secret.txt`)).status).toBe(404);
    expect((await fetch(`${base}/__write/src/scripts/write/%2e%2e/%2e%2e/secret.txt`)).status).toBe(404);
  });
});
