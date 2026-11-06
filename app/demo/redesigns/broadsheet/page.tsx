import { Fraunces, Source_Serif_4 } from 'next/font/google';
import { getConceptPosts, THEMES } from '../_lib/data';
import { BroadsheetView } from './BroadsheetView';

export const metadata = { title: 'Concept B: Broadsheet' };
export const revalidate = 86400;

const fraunces = Fraunces({ subsets: ['latin'], axes: ['opsz', 'SOFT'], variable: '--font-fraunces' });
const serif = Source_Serif_4({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--font-bs-serif' });

export default async function BroadsheetPage() {
  const posts = await getConceptPosts();
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London',
  });
  return (
    <div className={`rd-root ${fraunces.variable} ${serif.variable}`}>
      <BroadsheetView posts={posts} themes={[...THEMES]} today={today} />
    </div>
  );
}
