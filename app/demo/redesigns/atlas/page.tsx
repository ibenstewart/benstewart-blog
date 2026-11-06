import { getConceptPosts, THEMES } from '../_lib/data';
import { AtlasView } from './AtlasView';

export const metadata = { title: 'Concept A: Atlas' };

export default async function AtlasPage() {
  const posts = await getConceptPosts();
  return <AtlasView posts={posts} themes={[...THEMES]} />;
}
