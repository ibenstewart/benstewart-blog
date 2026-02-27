import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import postgres from 'postgres';

export const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'allow'
});

const nextConfig: NextConfig = {
  pageExtensions: ['mdx', 'ts', 'tsx'],
  async redirects() {
    const staticRedirects = [
      {
        source: '/posts/thinking-engine',
        destination: '/posts/multi-agent-ai-strategy',
        permanent: true,
      },
    ];

    if (!process.env.POSTGRES_URL) {
      return staticRedirects;
    }

    let dbRedirects = await sql`
      SELECT source, destination, permanent
      FROM redirects;
    `;

    return [
      ...staticRedirects,
      ...dbRedirects.map(({ source, destination, permanent }) => ({
        source,
        destination,
        permanent: !!permanent
      })),
    ];
  },
  // Note: Using the Rust compiler means we cannot use
  // rehype or remark plugins. If you need them, remove
  // the `experimental.mdxRs` flag.
  experimental: {
    mdxRs: { mdxType: 'gfm' }
  }
 };

const withMDX = createMDX({});

export default withMDX(nextConfig);
