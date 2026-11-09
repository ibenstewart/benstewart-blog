import { getConceptPosts, THEMES } from '../_lib/data';
import { ManualView } from './ManualView';

export const metadata = { title: 'Concept C: Field manual' };

export default async function ManualPage() {
  const posts = await getConceptPosts({ includeDrafts: true });
  return <ManualView posts={posts} themes={[...THEMES]} />;
}
