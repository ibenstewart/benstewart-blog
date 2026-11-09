import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { SITUATIONS, THEMES, TOOLS, chapters } from '@/lib/manual';
import { PageHead, PageSection } from '@/app/components/manual/PageHead';
import { textLinkClass } from '@/app/components/TextLink';

export const metadata: Metadata = {
  title: 'Copy review',
  robots: { index: false, follow: false },
};

const code = 'rounded bg-raise px-1.5 py-0.5 font-mono text-[0.875em] text-ink';

/**
 * Every line of manual copy on one page, for Ben to sign off: chapters,
 * situations, tools and pull quotes, each with the entry it points at. Not
 * linked from anywhere, not in the sitemap and noindex. Drafts are shown and
 * marked, so a draft's copy can be checked before it's published.
 */
export default async function CopyReviewPage() {
  const posts = await getAllPosts(undefined, { includeDrafts: true });
  const chs = chapters(posts);
  const entry = new Map(chs.flatMap((c) => c.entries.map((e) => [e.post.slug, e] as const)));
  const ref = (slug: string) => {
    const e = entry.get(slug);
    return e ? (
      <Link href={`/posts/${slug}`} className={textLinkClass}>
        <span className="font-mono text-accent">{e.number}</span> {e.post.title}
      </Link>
    ) : (
      <span className="text-red">Missing post: {slug}</span>
    );
  };
  const draft = <span className="label ml-2 rounded bg-hi px-1.5 py-0.5 text-ink">Draft</span>;

  return (
    <>
      <PageHead label="For Ben · Copy review" title="Every line to sign off.">
        <p className="mt-6 max-w-[60ch] text-[1.1875rem] leading-[1.6] text-faint">
          The chapters, reading orders, tools and pull quotes, each with the entry it points at. Situations and tools live in <code className={code}>lib/manual-data.mjs</code>; themes and quotes live in each post&apos;s metadata. This page isn&apos;t linked from anywhere and search engines are told to skip it.
        </p>
      </PageHead>

      <PageSection id="themes" label="1 · Chapters" title="Five chapters.">
        <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-[1.6] text-faint">
          A post&apos;s first theme is its chapter and sets its number. Posts that also carry a theme as a second or later choice are listed under &ldquo;also tagged&rdquo;.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-5 cards:grid-cols-1">
          {chs.map(({ theme, number, entries }) => {
            const also = posts.filter((p) => p.themes.slice(1).includes(theme.id));
            return (
              <section key={theme.id} aria-labelledby={`t-${theme.id}`} className="rounded-3xl border-2 border-ink bg-card p-6">
                <p className="label text-faint">
                  <span aria-hidden className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-[0.05em]" style={{ background: theme.colour }} />
                  Chapter {number} · <code className="normal-case">{theme.id}</code>
                </p>
                <h3 id={`t-${theme.id}`} className="mt-2 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">{theme.name}</h3>
                <ol role="list" className="mt-4 grid gap-1.5 text-[1rem]">
                  {entries.map((e) => (
                    <li key={e.post.slug}>{ref(e.post.slug)}{e.post.draft && draft}</li>
                  ))}
                </ol>
                {also.length > 0 && (
                  <p className="mt-4 text-[0.9375rem] leading-[1.5] text-faint">
                    Also tagged: {also.map((p) => p.title).join(', ')}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </PageSection>

      <PageSection id="situations" label="2 · Situations" title={`${SITUATIONS.length} reading orders.`}>
        <ol role="list" className="mt-10 grid gap-5">
          {SITUATIONS.map((s) => (
            <li key={s.id} className="rounded-3xl border-2 border-ink bg-card p-6">
              <p className="label text-faint"><code className="normal-case">{s.id}</code></p>
              <h3 className="mt-2 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">{s.label}</h3>
              <ol role="list" className="mt-4 grid gap-3">
                {s.path.map(([slug, why], i) => (
                  <li key={slug} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                    <span className="font-mono font-bold text-accent">{i + 1}</span>
                    <span>
                      <span className="block text-[1.0625rem] font-medium">{ref(slug)}</span>
                      <span className="mt-1 block text-[1rem] text-muted">&ldquo;{why}&rdquo;</span>
                    </span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection id="tools" label="3 · Toolkit" title={`${TOOLS.length} tools.`}>
        <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-[1.6] text-faint">Each line paraphrases its post, so check it says what the post says.</p>
        <ol role="list" className="mt-10 grid grid-cols-2 gap-5 cards:grid-cols-1">
          {TOOLS.map((t, i) => (
            <li key={t.id} className="rounded-3xl border-2 border-ink bg-card p-6">
              <p className="label text-faint">Tool {String(i + 1).padStart(2, '0')} · <code className="normal-case">{t.id}</code></p>
              <h3 className="mt-2 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">{t.name}</h3>
              <p className="mt-2 text-[1.0625rem] leading-[1.5] text-muted">&ldquo;{t.line}&rdquo;</p>
              <p className="mt-3 text-[0.9375rem]">From {ref(t.slug)}</p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection id="quotes" label="4 · Pull quotes" title="One line per entry." last>
        <p className="mt-5 max-w-[60ch] text-[1.0625rem] leading-[1.6] text-faint">
          Used on entry cards and share cards. Each should be the post&apos;s own words; the subtitle is shown for comparison.
        </p>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[1rem]">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="label w-[34%] py-3 pr-4 font-medium text-faint">Entry</th>
                <th scope="col" className="label py-3 pr-4 font-medium text-faint">Quote</th>
                <th scope="col" className="label w-[26%] py-3 font-medium text-faint">Subtitle</th>
              </tr>
            </thead>
            <tbody>
              {chs.flatMap((c) => c.entries).map((e) => (
                <tr key={e.post.slug} className="border-b border-hair align-top">
                  <td className="py-3 pr-4 font-medium">{ref(e.post.slug)}{e.post.draft && draft}</td>
                  <td className="py-3 pr-4 text-ink">{e.post.quote ?? <span className="text-red">No quote</span>}</td>
                  <td className="py-3 text-faint">{e.post.subtitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </>
  );
}
