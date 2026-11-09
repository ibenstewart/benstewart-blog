import { PostNav } from '@/app/components/PostNav';
import { IllustratedFooter } from './IllustratedFooter';

export const metadata = { title: 'Footer concept: illustrated' };

/**
 * The end of a real post, then the illustrated footer in place of the
 * current one, so the concept is judged in context on the live design.
 */
export default function FooterConceptPage() {
  return (
    <>
      <style>{`body:has(.fx-root) footer.site-chrome { display: none; }`}</style>
      <h1 className="fx-root text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-[-0.035em]">Illustrated footer</h1>
      <p className="text-[19px] text-muted">
        The end of a real post, with the footer swapped for one of four illustrations. Use the switcher at the bottom of the screen to compare them.
      </p>
      <PostNav slug="multi-agent-ai-strategy" related={['what-level-does-this-task-deserve', 'ralph-isnt-the-point']} />
      <IllustratedFooter />
    </>
  );
}
