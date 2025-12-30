import Link from 'next/link';

const posts = [
  { slug: 'i-built-this-blog-with-claude-code', title: 'I Built This Blog With Claude Code' },
  { slug: 'sustainable', title: 'Sustainable Pace Just Got Faster' },
  { slug: 'a-prompt-to-your-leadership-style', title: 'A prompt to your leadership style' },
  { slug: 'the-truth-about-authentic-leadership', title: 'The Truth About Authentic Leadership' },
  { slug: 'waist', title: 'W.A.I.S.T.' },
  { slug: 'leaders-dont-lie', title: "Leaders Don't Lie" },
  { slug: 'am-i-technically-dangerous', title: 'Am I Technically Dangerous?' },
  { slug: 'you-cant-hum-while-holding-your-nose', title: "You Can't Hum While Holding Your Nose" },
  { slug: 'leadership-as-a-service', title: 'Leadership as a Service' },
  { slug: 'managing-up-up-down-down-left-right', title: 'Managing - Up, Up, Down, Down, Left, Right' },
  { slug: 'end-of-year-manager-checklist', title: 'End of Year Manager Checklist' },
  { slug: 'meeting-rooms-are-now-free', title: 'Meeting Rooms Are Now Free' },
  { slug: 'the-ideal-senior-engineer', title: 'The Ideal Senior Engineer?' },
  { slug: 'reading-list', title: 'Reading List' },
  { slug: 'the-basic-boss-formula', title: '25% / 50% / 25% - The Basic Boss Formula' },
];

export default function PostsPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-medium mb-8">Writing</h1>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="text-lg underline decoration-neutral-500 underline-offset-[2.5px] hover:decoration-neutral-400 dark:decoration-neutral-500 dark:hover:decoration-neutral-600 transition-colors"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
