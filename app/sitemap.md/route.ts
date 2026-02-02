import { promises as fs } from 'fs';
import path from 'path';

const SITE_URL = 'https://www.benstewart.ai';

type PostMeta = {
  slug: string;
  title: string;
  description: string;
};

async function getPostsMetadata(dir: string): Promise<PostMeta[]> {
  const entries = await fs.readdir(dir, {
    recursive: true,
    withFileTypes: true
  });

  const posts = entries
    .filter((entry) => entry.isFile() && entry.name === 'page.mdx')
    .map((entry) => {
      const relativePath = path.relative(
        dir,
        path.join(entry.parentPath, entry.name)
      );
      return {
        slug: path.dirname(relativePath).replace(/\\/g, '/'),
        filePath: path.join(entry.parentPath, entry.name)
      };
    })
    .filter((post) => post.slug !== '.');

  const postsWithMeta: PostMeta[] = await Promise.all(
    posts.map(async (post) => {
      try {
        const content = await fs.readFile(post.filePath, 'utf-8');
        const titleMatch = content.match(/title:\s*["'](.+?)["']/);
        const descMatch = content.match(/description:\s*["'](.+?)["']/);
        return {
          slug: post.slug,
          title: titleMatch ? titleMatch[1] : post.slug,
          description: descMatch ? descMatch[1] : ''
        };
      } catch {
        return { slug: post.slug, title: post.slug, description: '' };
      }
    })
  );

  return postsWithMeta;
}

export async function GET() {
  const postsDirectory = path.join(process.cwd(), 'app', 'posts');
  const posts = await getPostsMetadata(postsDirectory);

  const markdown = `# Sitemap

## About This Site

Ben Stewart's personal blog. Engineer turned leader at Skyscanner. Writing about software engineering, leadership, and how teams actually ship.

## Main Pages

- [Home](${SITE_URL}/) - Introduction and featured writing
- [Bio](${SITE_URL}/bio) - Career timeline and background
- [Posts](${SITE_URL}/posts) - All blog posts
- [Speaking](${SITE_URL}/speaking) - Conference talks, podcasts, and articles

## Blog Posts

${posts.map((post) => `- [${post.title}](${SITE_URL}/posts/${post.slug})${post.description ? ` - ${post.description}` : ''}`).join('\n')}

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
