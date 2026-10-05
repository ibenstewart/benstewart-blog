import { getAllPosts } from '@/lib/posts';
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

export async function GET() {
  const posts = await getAllPosts();

  const markdown = `# Sitemap

## About This Site

Ben Stewart's personal blog. ${SITE_DESCRIPTION}

## Main Pages

- [Home](${SITE_URL}/) - Introduction and featured writing
- [Bio](${SITE_URL}/bio) - Career timeline and background
- [Posts](${SITE_URL}/posts) - All blog posts
- [Speaking](${SITE_URL}/speaking) - Conference talks, podcasts, and articles

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
