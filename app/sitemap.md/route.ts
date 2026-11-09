import { getAllPosts } from '@/lib/posts';
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

export async function GET() {
  const posts = await getAllPosts();

  const markdown = `# Sitemap

## About This Site

Ben Stewart's blog, laid out as a field manual for leading engineering teams through AI. ${SITE_DESCRIPTION}

## Main Pages

- [Home](${SITE_URL}/) - Reading orders by situation, six named tools and five chapters
- [Posts](${SITE_URL}/posts) - Every post by date, newest first
- [Bio](${SITE_URL}/bio) - Career timeline and a short bio for organisers
- [Speaking](${SITE_URL}/speaking) - Talks, podcasts, videos and articles

## Blog Posts

${posts.map((post) => `- [${post.title}](${SITE_URL}/posts/${post.slug})${post.date ? ` (${post.date})` : ''}${post.description ? ` - ${post.description}` : ''}`).join('\n')}

## Contact

- Email: ben@benstewart.ai
- GitHub: [ibenstewart](https://github.com/ibenstewart)
`;

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
