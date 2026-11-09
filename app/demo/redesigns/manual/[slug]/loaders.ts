import type { ComponentType } from 'react';

/**
 * One loader per post, so the Field manual entry page can render any post's
 * real MDX with its own components. Regenerate when posts are added.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MdxModule = { default: ComponentType<any> };

export const LOADERS: Record<string, () => Promise<MdxModule>> = {
  'a-prompt-to-your-leadership-style': () => import('@/app/posts/a-prompt-to-your-leadership-style/page.mdx'),
  'ai-made-writing-free': () => import('@/app/posts/ai-made-writing-free/page.mdx'),
  'am-i-jealous-of-my-team': () => import('@/app/posts/am-i-jealous-of-my-team/page.mdx'),
  'am-i-technically-dangerous': () => import('@/app/posts/am-i-technically-dangerous/page.mdx'),
  'end-of-year-manager-checklist': () => import('@/app/posts/end-of-year-manager-checklist/page.mdx'),
  'i-built-this-blog-with-claude-code': () => import('@/app/posts/i-built-this-blog-with-claude-code/page.mdx'),
  'leaders-dont-lie': () => import('@/app/posts/leaders-dont-lie/page.mdx'),
  'leadership-as-a-service': () => import('@/app/posts/leadership-as-a-service/page.mdx'),
  'managing-up-up-down-down-left-right': () => import('@/app/posts/managing-up-up-down-down-left-right/page.mdx'),
  'meeting-rooms-are-now-free': () => import('@/app/posts/meeting-rooms-are-now-free/page.mdx'),
  'multi-agent-ai-strategy': () => import('@/app/posts/multi-agent-ai-strategy/page.mdx'),
  'practical-postmortems': () => import('@/app/posts/practical-postmortems/page.mdx'),
  'ralph-isnt-the-point': () => import('@/app/posts/ralph-isnt-the-point/page.mdx'),
  'reading-list': () => import('@/app/posts/reading-list/page.mdx'),
  'shared-documents-are-not-shared-understanding': () => import('@/app/posts/shared-documents-are-not-shared-understanding/page.mdx'),
  'so-i-think-i-burned-out': () => import('@/app/posts/so-i-think-i-burned-out/page.mdx'),
  'sustainable': () => import('@/app/posts/sustainable/page.mdx'),
  'the-basic-boss-formula': () => import('@/app/posts/the-basic-boss-formula/page.mdx'),
  'the-ideal-senior-engineer': () => import('@/app/posts/the-ideal-senior-engineer/page.mdx'),
  'the-invisible-manager': () => import('@/app/posts/the-invisible-manager/page.mdx'),
  'the-three-pound-question': () => import('@/app/posts/the-three-pound-question/page.mdx'),
  'the-truth-about-authentic-leadership': () => import('@/app/posts/the-truth-about-authentic-leadership/page.mdx'),
  'waist': () => import('@/app/posts/waist/page.mdx'),
  'what-level-does-this-task-deserve': () => import('@/app/posts/what-level-does-this-task-deserve/page.mdx'),
  'you-cant-hum-while-holding-your-nose': () => import('@/app/posts/you-cant-hum-while-holding-your-nose/page.mdx'),
};
