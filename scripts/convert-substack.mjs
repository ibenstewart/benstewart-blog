import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import https from 'https';
import http from 'http';

const POSTS_DIR = './lCf48k5oRJSmk6GRdyH3uQ/posts';
const OUTPUT_DIR = './app/posts';
const IMAGES_DIR = './public/images/posts';

// Post metadata from CSV (excluding unpublished "how to use substack editor")
const posts = [
  { file: '143293597.a-prompt-to-your-leadership-style.html', slug: 'a-prompt-to-your-leadership-style', title: 'A prompt to your leadership style', date: '2024-04-05', subtitle: 'Hey ChatGPT, give me some pointers to make me better at my job?' },
  { file: '142881498.the-truth-about-authentic-leadership.html', slug: 'the-truth-about-authentic-leadership', title: 'The Truth About Authentic Leadership', date: '2024-03-26', subtitle: '' },
  { file: '137157899.waist.html', slug: 'waist', title: 'W.A.I.S.T.', date: '2023-09-18', subtitle: '' },
  { file: '137157866.leaders-dont-lie.html', slug: 'leaders-dont-lie', title: "Leaders Don't Lie", date: '2023-09-18', subtitle: '' },
  { file: '137157779.am-i-technically-dangerous.html', slug: 'am-i-technically-dangerous', title: 'Am I Technically Dangerous?', date: '2023-09-18', subtitle: '' },
  { file: '137157760.you-cant-hum-while-holding-your-nose.html', slug: 'you-cant-hum-while-holding-your-nose', title: "You Can't Hum While Holding Your Nose", date: '2023-09-18', subtitle: '' },
  { file: '137157737.leadership-as-a-service.html', slug: 'leadership-as-a-service', title: 'Leadership as a Service', date: '2023-09-18', subtitle: '' },
  { file: '137157702.managing-up-up-down-down-left-right.html', slug: 'managing-up-up-down-down-left-right', title: 'Managing - Up, Up, Down, Down, Left, Right', date: '2023-09-18', subtitle: '' },
  { file: '137157619.end-of-year-manager-checklist.html', slug: 'end-of-year-manager-checklist', title: 'End of Year Manager Checklist', date: '2023-09-18', subtitle: '' },
  { file: '137157531.meeting-rooms-are-now-free.html', slug: 'meeting-rooms-are-now-free', title: 'Meeting Rooms Are Now Free', date: '2023-09-18', subtitle: '' },
  { file: '137157469.the-ideal-senior-engineer.html', slug: 'the-ideal-senior-engineer', title: 'The Ideal Senior Engineer?', date: '2023-09-18', subtitle: '' },
  { file: '137157398.reading-list.html', slug: 'reading-list', title: 'Reading List', date: '2023-09-18', subtitle: "I don't have a big enough ego to tell you that the following books will change your life." },
  { file: '137157131.25-50-25-the-basic-boss-formula.html', slug: 'the-basic-boss-formula', title: '25% / 50% / 25% - The Basic Boss Formula', date: '2023-09-18', subtitle: '' },
];

// Download image from URL
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Clean up the URL - remove the $s_!IeVk! pattern
    let cleanUrl = url.replace(/\$s_!IeVk!,?/g, '');

    // If it's a substack CDN URL, try to get the original
    if (cleanUrl.includes('substackcdn.com/image/fetch')) {
      // Extract the original S3 URL
      const match = cleanUrl.match(/https%3A%2F%2Fsubstack-post-media\.s3\.amazonaws\.com[^"'\s]+/);
      if (match) {
        cleanUrl = decodeURIComponent(match[0]);
      }
    }

    const protocol = cleanUrl.startsWith('https') ? https : http;

    protocol.get(cleanUrl, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        writeFileSync(filepath, buffer);
        resolve(filepath);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Convert HTML to MDX
function htmlToMdx(html, slug) {
  let content = html;
  const images = [];

  // Remove Substack subscribe buttons
  content = content.replace(/<p class="button-wrapper"[^>]*>[\s\S]*?<\/p>/g, '');

  // Remove captioned-image-container divs but keep the image
  content = content.replace(/<div class="captioned-image-container">[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/div><\/a><\/figure><\/div>/g, (match, src) => {
    return `<img src="${src}" />`;
  });

  // Extract and replace images
  let imageIndex = 0;
  content = content.replace(/<img[^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
    // Get the original image URL from S3
    let originalUrl = src;
    if (src.includes('substackcdn.com') || src.includes('substack-post-media')) {
      const s3Match = src.match(/substack-post-media\.s3\.amazonaws\.com[^"'\s\)]+/);
      if (s3Match) {
        originalUrl = 'https://' + s3Match[0].replace(/%2F/g, '/').replace(/%3A/g, ':');
      }
    }

    // Determine extension
    const ext = originalUrl.includes('.png') ? 'png' : originalUrl.includes('.gif') ? 'gif' : 'jpg';
    const filename = `${slug}-${imageIndex}.${ext}`;
    imageIndex++;

    images.push({ url: originalUrl, filename });
    return `![](/images/posts/${filename})`;
  });

  // Convert HTML elements to Markdown
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '\n# $1\n');
  content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '\n## $1\n');
  content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, '\n### $1\n');
  content = content.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**');
  content = content.replace(/<em>([\s\S]*?)<\/em>/g, '*$1*');
  content = content.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, '\n> $1\n');
  content = content.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, '[$2]($1)');
  content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, '\n$1\n');
  content = content.replace(/<br\s*\/?>/g, '\n');
  content = content.replace(/<hr\s*\/?>/g, '\n---\n');
  content = content.replace(/<div><hr><\/div>/g, '\n---\n');
  content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, '- $1');
  content = content.replace(/<\/?ul[^>]*>/g, '\n');
  content = content.replace(/<\/?ol[^>]*>/g, '\n');
  content = content.replace(/<\/?div[^>]*>/g, '');

  // Clean up HTML entities
  content = content.replace(/&nbsp;/g, ' ');
  content = content.replace(/&amp;/g, '&');
  content = content.replace(/&lt;/g, '<');
  content = content.replace(/&gt;/g, '>');
  content = content.replace(/&quot;/g, '"');
  content = content.replace(/&#39;/g, "'");

  // Clean up extra whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.trim();

  return { content, images };
}

async function convertPost(post) {
  console.log(`Converting: ${post.title}`);

  const htmlPath = join(POSTS_DIR, post.file);
  const html = readFileSync(htmlPath, 'utf-8');

  const { content, images } = htmlToMdx(html, post.slug);

  // Download images
  for (const img of images) {
    const imgPath = join(IMAGES_DIR, img.filename);
    try {
      console.log(`  Downloading: ${img.filename}`);
      await downloadImage(img.url, imgPath);
    } catch (err) {
      console.error(`  Failed to download ${img.url}: ${err.message}`);
    }
  }

  // Create MDX content with metadata export
  const mdx = `export const metadata = {
  title: "${post.title.replace(/"/g, '\\"')}",
  date: "${post.date}",
  subtitle: "${post.subtitle.replace(/"/g, '\\"')}"
};

# ${post.title}

${content}
`;

  // Write MDX file
  const outputDir = join(OUTPUT_DIR, post.slug);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'page.mdx'), mdx);

  console.log(`  Created: ${post.slug}/page.mdx`);
}

async function main() {
  console.log('Converting Substack posts to MDX...\n');

  for (const post of posts) {
    await convertPost(post);
  }

  console.log('\nDone!');
}

main().catch(console.error);
