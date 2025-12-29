import Link from 'next/link';

const posts = [
  { slug: 'a-prompt-to-your-leadership-style', title: 'A prompt to your leadership style', date: '2024-04-05' },
  { slug: 'the-truth-about-authentic-leadership', title: 'The Truth About Authentic Leadership', date: '2024-03-26' },
  { slug: 'waist', title: 'W.A.I.S.T.', date: '2023-09-18' },
  { slug: 'leaders-dont-lie', title: "Leaders Don't Lie", date: '2023-09-18' },
  { slug: 'am-i-technically-dangerous', title: 'Am I Technically Dangerous?', date: '2023-09-18' },
  { slug: 'you-cant-hum-while-holding-your-nose', title: "You Can't Hum While Holding Your Nose", date: '2023-09-18' },
  { slug: 'leadership-as-a-service', title: 'Leadership as a Service', date: '2023-09-18' },
  { slug: 'managing-up-up-down-down-left-right', title: 'Managing - Up, Up, Down, Down, Left, Right', date: '2023-09-18' },
  { slug: 'end-of-year-manager-checklist', title: 'End of Year Manager Checklist', date: '2023-09-18' },
  { slug: 'meeting-rooms-are-now-free', title: 'Meeting Rooms Are Now Free', date: '2023-09-18' },
  { slug: 'the-ideal-senior-engineer', title: 'The Ideal Senior Engineer?', date: '2023-09-18' },
  { slug: 'reading-list', title: 'Reading List', date: '2023-09-18' },
  { slug: 'the-basic-boss-formula', title: '25% / 50% / 25% - The Basic Boss Formula', date: '2023-09-18' },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PostsPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-medium mb-8">Writing</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="text-lg underline decoration-neutral-500 underline-offset-[2.5px] hover:decoration-neutral-400 dark:decoration-neutral-500 dark:hover:decoration-neutral-600 transition-colors"
            >
              {post.title}
            </Link>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(post.date)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
