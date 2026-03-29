'use client';

import { useRef, type ReactNode } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Content constants
// ---------------------------------------------------------------------------

const TITLE_LINES = [
  'AI Made Writing Free.',
  'That Was Supposed',
  'to Be Good News.',
];

const SUBTITLE = 'The cost didn\u2019t disappear. It moved.';
const AUTHOR = 'Ben Stewart';
const DATE = '22 March 2026';

const OPENING = `Before AI, writing cost something. You didn\u2019t produce a two-thousand word document unless you really had to, because it took hours. That friction was a filter. Now it\u2019s gone. A polished, well-structured doc takes twenty minutes and most of that is prompting.`;

const THESIS = `The problem is the cost didn\u2019t disappear. It moved. From the writer\u2019s time to the reader\u2019s brain.`;

const ATTENTION_1 = `The reader\u2019s brain hasn\u2019t upgraded to match the writer\u2019s new throughput. Research on working memory puts the number of things you can genuinely hold and process at around four. Hard thinking all day causes a chemical buildup that makes your brain work worse. By 4pm people aren\u2019t lazy. They\u2019re spent.`;

const ATTENTION_2 = `So now everyone can produce more, faster, while nobody can consume any more than they could before. That\u2019s not a productivity win. That\u2019s a tax on attention disguised as efficiency.`;

const DEBT_1 = `I\u2019ve started calling this attention debt; the invisible cost you create every time you send something that\u2019s longer than it needs to be. Like meeting rooms becoming free after COVID, removing the friction didn\u2019t remove the cost. It just made us less aware of it.`;

const DEBT_2 = `That five-minute doc you sent to forty people? You just called a three-hour meeting that nobody agreed to attend.`;

const ACTION_INTRO = `\u201CClaude wrote most of this\u201D is not a quality control strategy. Your name is on it. That means you own the reader\u2019s time, not just the words.`;

const ACTION_LEAD = `Here are three prompts I use before I send anything long. They take thirty seconds and they\u2019ve stopped me from inflicting at least a dozen unnecessary essays on my team.`;

const PROMPTS = [
  {
    title: 'Cut it down',
    text: 'Paste your document below. Cut the total word count by 50% without losing any decisions, actions, or information someone needs to act on. Flag anything you removed that you think I should reconsider.',
  },
  {
    title: 'Find the real audience',
    text: 'Read this document and tell me: who actually needs to read all of it, who only needs the summary, and who probably doesn\u2019t need it at all. Then rewrite the opening so it\u2019s clear in the first two sentences who should keep reading.',
  },
  {
    title: 'Convert to the right format',
    text: 'Read this document and suggest whether it would be better communicated as a diagram, a short bullet list, a one-paragraph summary, or a decision with context. Then produce whichever format you recommend.',
  },
];

const CLOSING_1 = `The document itself is never the whole story. The question isn\u2019t \u201Cdid I write it clearly?\u201D It\u2019s \u201Cdoes this need to exist in this form at all?\u201D`;

const CLOSING_2 = `The discipline now isn\u2019t in the writing. It\u2019s in the not-sending. Or at least in the editing-before-sending. Use the same tools that made the mess to clean it up.`;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const heroContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const heroChild = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const heroMeta = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, delay: 1.1, ease: 'easeOut' },
  },
};

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------

function FullBleed({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: '100vw',
        position: 'relative',
        left: '50%',
        marginLeft: '-50vw',
      }}
    >
      {children}
    </div>
  );
}

function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PullQuoteBand({ children }: { children: ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <FullBleed className="bg-gray-50 dark:bg-gray-950">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -60 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        className="max-w-[85ch] mx-auto px-8 py-16 md:py-24"
      >
        <div className="border-l-4 border-amber-700 dark:border-amber-400 pl-6 md:pl-10">
          <p className="text-2xl md:text-4xl lg:text-5xl font-medium italic leading-tight text-gray-800 dark:text-gray-200">
            {children}
          </p>
        </div>
      </motion.div>
    </FullBleed>
  );
}

function BodySection({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[65ch] mx-auto w-full ${className}`}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MagazineDemo() {
  const { scrollYProgress } = useScroll();
  const statRef = useRef(null);
  const { scrollYProgress: statProgress } = useScroll({
    target: statRef,
    offset: ['start end', 'end start'],
  });
  const statScale = useTransform(statProgress, [0, 0.5], [0.8, 1]);
  const statOpacity = useTransform(statProgress, [0, 0.3], [0, 1]);

  return (
    <div className="-mt-4 md:-mt-16">
      {/* Reading progress bar */}
      <FullBleed>
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] bg-amber-700 dark:bg-amber-400 origin-left z-50"
          style={{ scaleX: scrollYProgress }}
        />
      </FullBleed>

      {/* ================================================================= */}
      {/* HERO                                                              */}
      {/* ================================================================= */}
      <FullBleed className="bg-gradient-to-b from-gray-100 via-white to-white dark:from-gray-950 dark:via-black dark:to-black">
        <div className="min-h-screen flex flex-col justify-center items-center px-8 py-20 relative">
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="text-center max-w-5xl"
          >
            {TITLE_LINES.map((line, i) => (
              <motion.div
                key={i}
                variants={heroChild}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight"
              >
                {line}
              </motion.div>
            ))}

            <motion.p
              variants={heroMeta}
              className="mt-8 md:mt-12 text-lg md:text-2xl font-medium text-gray-500 dark:text-gray-400"
            >
              {SUBTITLE}
            </motion.p>

            <motion.p
              variants={heroMeta}
              className="mt-6 text-sm md:text-base font-normal uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500"
            >
              {AUTHOR} &middot; {DATE}
            </motion.p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 dark:text-gray-600"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </div>
      </FullBleed>

      {/* ================================================================= */}
      {/* OPENING — drop cap                                                */}
      {/* ================================================================= */}
      <BodySection className="pt-16 md:pt-24">
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed first-letter:text-6xl md:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8] first-letter:text-amber-700 dark:first-letter:text-amber-400">
            {OPENING}
          </p>
        </ScrollReveal>
        <ScrollReveal>
          <p className="mt-6 text-lg md:text-xl leading-relaxed font-medium">
            {THESIS}
          </p>
        </ScrollReveal>
      </BodySection>

      {/* ================================================================= */}
      {/* PULL QUOTE 1                                                      */}
      {/* ================================================================= */}
      <div className="mt-16 md:mt-24">
        <PullQuoteBand>
          &ldquo;From the writer&rsquo;s time to the reader&rsquo;s brain.&rdquo;
        </PullQuoteBand>
      </div>

      {/* ================================================================= */}
      {/* ATTENTION DEBT                                                    */}
      {/* ================================================================= */}
      <BodySection className="mt-16 md:mt-24 space-y-6">
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed">{ATTENTION_1}</p>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed">{ATTENTION_2}</p>
        </ScrollReveal>
      </BodySection>

      {/* ================================================================= */}
      {/* GIANT STAT                                                        */}
      {/* ================================================================= */}
      <div className="mt-16 md:mt-24" ref={statRef}>
        <FullBleed className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-8">
            <motion.div
              style={{ scale: statScale, opacity: statOpacity }}
              className="text-[8rem] md:text-[12rem] lg:text-[14rem] font-bold leading-none text-amber-600/20 dark:text-amber-400/20 select-none"
            >
              4
            </motion.div>
            <ScrollReveal className="-mt-6 md:-mt-10 text-center">
              <p className="text-lg md:text-2xl font-medium text-gray-600 dark:text-gray-400">
                Around four things. That&rsquo;s your working memory.
              </p>
              <p className="mt-2 text-sm md:text-base text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                By 4pm, even that is gone
              </p>
            </ScrollReveal>
          </div>
        </FullBleed>
      </div>

      {/* ================================================================= */}
      {/* ATTENTION DEBT SECTION                                            */}
      {/* ================================================================= */}
      <BodySection className="mt-16 md:mt-24 space-y-6">
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed">{DEBT_1}</p>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed font-medium">
            {DEBT_2}
          </p>
        </ScrollReveal>
      </BodySection>

      {/* ================================================================= */}
      {/* PULL QUOTE 2                                                      */}
      {/* ================================================================= */}
      <div className="mt-16 md:mt-24">
        <PullQuoteBand>
          &ldquo;A tax on attention disguised as efficiency.&rdquo;
        </PullQuoteBand>
      </div>

      {/* ================================================================= */}
      {/* ACTION SECTION                                                    */}
      {/* ================================================================= */}
      <BodySection className="mt-16 md:mt-24">
        <ScrollReveal>
          <h2 className="text-xl md:text-3xl font-semibold mb-6">
            What you actually do about it
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed">{ACTION_INTRO}</p>
        </ScrollReveal>
        <ScrollReveal>
          <p className="mt-6 text-lg md:text-xl leading-relaxed">
            {ACTION_LEAD}
          </p>
        </ScrollReveal>

        <div className="mt-10 space-y-6">
          {PROMPTS.map((prompt, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h3 className="text-base md:text-lg font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
                  {prompt.title}
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400 font-mono">
                  {prompt.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </BodySection>

      {/* ================================================================= */}
      {/* PULL QUOTE 3                                                      */}
      {/* ================================================================= */}
      <div className="mt-16 md:mt-24">
        <PullQuoteBand>
          &ldquo;Every long doc you send is a meeting you didn&rsquo;t
          schedule.&rdquo;
        </PullQuoteBand>
      </div>

      {/* ================================================================= */}
      {/* CLOSING                                                           */}
      {/* ================================================================= */}
      <BodySection className="mt-16 md:mt-24 space-y-6">
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed">{CLOSING_1}</p>
        </ScrollReveal>
        <ScrollReveal>
          <p className="text-lg md:text-xl leading-relaxed">{CLOSING_2}</p>
        </ScrollReveal>
      </BodySection>

      {/* ================================================================= */}
      {/* FINAL PULL QUOTE                                                  */}
      {/* ================================================================= */}
      <div className="mt-16 md:mt-24">
        <FullBleed className="bg-gray-900 dark:bg-gray-100">
          <ScrollReveal className="max-w-[85ch] mx-auto px-8 py-20 md:py-32 text-center">
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-white dark:text-black">
              AI made writing free.
              <br />
              It didn&rsquo;t make reading free.
            </p>
          </ScrollReveal>
        </FullBleed>
      </div>

      {/* ================================================================= */}
      {/* FOOTER LINK                                                       */}
      {/* ================================================================= */}
      <div className="mt-16 md:mt-24 mb-8 text-center">
        <ScrollReveal>
          <p className="text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Read the full post
          </p>
          <Link
            href="/posts/ai-made-writing-free"
            className="text-lg md:text-xl underline decoration-amber-700 dark:decoration-amber-400 underline-offset-4 hover:decoration-2 transition-all"
          >
            AI Made Writing Free. That Was Supposed to Be Good News.
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
