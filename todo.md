# Blog work, next 6 weeks

Heavier push assumed: one evening plus Sunday morning, roughly 6 to 8 hours a week. Items are in priority order, not theme order. Do them top to bottom. Skipping items breaks dependencies later in the list. Skyscanner-sensitive material (handbook, named project case studies, live token data) is parked at the end with the reason.

-----

## 1. Rewrite the homepage

The current homepage commits to nothing. It’s the single biggest blocker because every other thing in this list funnels through it.

- Replace the four-noun topic list with one declarative sentence about what this blog is and who it’s for. Lead with team scale and the beat. Don’t dodge the title. Something close to: *“I run a 350-engineer org at Skyscanner that’s going through the AI transition. I write field reports about what’s working, what’s breaking, and what the data says, in plain English.”*
- Add a “start here” section with three canonical posts, separate from the rotating favourites.
- Cut the homepage curated list from ten posts to six. Drop the ones the audit flagged: W.A.I.S.T., the 25/50/25 boss formula, “A prompt to your leadership style”, and “The Truth About Authentic Leadership”.
- **Estimate:** 2 hrs.
- **Done when:** live, and a stranger reading the homepage for 30 seconds can say what the blog is and who it’s for.

## 2. Stand up a newsletter

Capture mechanism is the highest-leverage missing piece. Without it, every visit is a one-shot.

- Pick Buttondown or Beehiiv. Don’t agonise. Buttondown is the lowest-friction choice for someone who isn’t running a media business.
- Promise the format explicitly in the welcome email: one field report, three to five things from the week’s reading, one short observation. Fortnightly cadence.
- Put the signup in the header and footer.
- Pick once, ship. Don’t plan to migrate later.
- **Estimate:** 1.5 hrs setup, plus 30 mins for the welcome email.
- **Done when:** signup is live in header and footer, welcome email triggers, first 10 sign-ups are in.

## 3. Fix the discoverability hygiene

The unglamorous one. Search engines have indexed almost no body content from the site. If you’ve published “I Built This Blog With Claude Code” and your OG tags are broken, that’s a credibility hole.

- Verify and fix sitemap.xml, robots.txt, OG tags, Twitter card metadata, JSON-LD article schema.
- Surface the RSS link in the footer. It probably exists, just isn’t visible.
- Add GitHub link to the footer (placeholder is fine until item 5).
- Run Lighthouse and pagespeed, fix anything red.
- **Estimate:** 2 hrs. Mostly Claude Code prompts.
- **Done when:** a fresh post gets indexed by Google within a week, and pasting a link to LinkedIn renders the OG card correctly.

## 4. Ship the first Field Report

This series is the spine of the blog from here on. The first one needs to be good enough that a stranger reads it and immediately understands what the format is.

- Pattern-level, not project-level. Write about something you’ve actually learned from running an engineering org, without naming projects, internal KPIs, or quoting dashboards. The credibility comes from the operator vantage, not from proprietary data.
- Candidate angles: what running small-team experiments actually teaches you, what the gap between top-down AI mandates and what teams actually do has taught you, why tooling rollouts without a measurement plan are theatre.
- Title shape: specific and dated. *“Field Report 01: what running small-team experiments actually teaches you.”*
- 1500 to 2500 words. Real opinion. Honest about what didn’t work.
- Run the voice skill audit loop on the draft before publishing.
- **Estimate:** 4 to 6 hrs across two sessions.
- **Done when:** published, included in homepage start-here, sent to the newsletter, posted to LinkedIn (item 10).

## 5. Stand up the GitHub repo

You wrote a post called “I Built This Blog With Claude Code.” There’s no GitHub link on the blog. That’s a problem. Open one.

- Public repo. Include the blog source (or whatever can be opened), prompt files from the multi-agent strategy post, a basic README that explains what’s there.
- Add the link to the footer.
- Doesn’t need to be polished. It needs to exist.
- **Estimate:** 3 hrs.
- **Done when:** the link in the footer takes a stranger to a repo with actual stuff in it.

## 6. Add embeddings-based related posts and a TLDR per post

Now you start demonstrating the thesis instead of just claiming it. Both can be done in an afternoon with off-the-shelf tools if you don’t try to make them pretty.

- Related posts: embed every post once, show three nearest neighbours at the bottom of each post. OpenAI embeddings or Voyage will do.
- TLDR: 3 to 5 sentences at the top of every post, generated at publish time, clearly labelled as AI-generated.
- **Estimate:** 3 to 4 hrs together.
- **Done when:** every post has a TLDR at the top and three related posts at the bottom.

## 7. Send the first newsletter issue

Issue 01 doesn’t need to be a magnum opus. It needs to ship in the format you promised.

- Lead with the Field Report from item 4. Add three links from the week. Add one short observation.
- Cadence rule: if you can’t write the field report this fortnight, send the links anyway. Cadence beats quality at this stage.
- **Estimate:** 2 hrs.
- **Done when:** it’s in inboxes and the consistency clock has started.

## 8. Build the AI tax calculator

Successor to the existing time calculator. Inputs: team size, tooling spend per engineer per month, average annual comp, adoption rate. Output: gross-cost-versus-saved-hours estimate with named assumptions, plus rough break-even adoption rate.

- The credibility of this thing lives in the named assumptions, not the calculator. Show your working.
- Build it the same way as the existing widget. React, Vite, embed in a dedicated post.
- **Estimate:** 4 to 5 hrs.
- **Done when:** live in its own post, and that post is in the homepage start-here.

## 9. Stand up “Ask the archive”

The biggest demo move. A chat interface that lets readers ask “what does Ben think about Cursor versus Copilot at scale?” and get a synthesised answer with citations to the relevant posts.

- Cloudflare AI or similar, plus a small UI. The hard part isn’t the build, it’s retrieval quality and the system prompt.
- Be plain about what it is. It’s the archive talking, not you. Caveat clearly.
- Own page, linked from the header and the start-here.
- **Estimate:** 6 to 8 hrs across two weekends.
- **Done when:** a friend can ask three real questions and get useful, cited answers.

## 10. Establish the LinkedIn republishing rhythm

The cross-functional posts travel furthest on LinkedIn. The engineering posts build the deep readership. Don’t post the same thing in the same shape on both.

- Field Reports get a LinkedIn long-form with a different opening. Lead with the uncomfortable true thing, then “the field report below has the rest.” That drives clicks back to the blog.
- Generic engineering posts go to the blog and the newsletter only. Don’t burn LinkedIn surface area on them.
- **Estimate:** 30 mins to set the rule. Ongoing per post.
- **Done when:** the Field Report from item 4 has a matching LinkedIn long-form posted.

## 11. Add a predictions tracker page

Public, dated, scored quarterly. Five to ten predictions about AI in engineering orgs. Mark vindication and humiliation publicly. Nobody operating at your level is doing this.

- Don’t try to be clever. Be willing to be wrong on the record.
- One page, dated entries, simple.
- **Estimate:** 2 hrs to set up. 30 mins each quarter to score.
- **Done when:** page is live, first ten predictions are written, link is in the footer.

## 12. Start the “things I changed my mind about” file

End-of-year format you can start drafting now. Three to five things you believed in January and don’t anymore, with the evidence for each.

- Hard to fake. Signature authenticity once it’s a recurring annual.
- Doesn’t ship until December. Start the file now, add to it as the year goes.
- **Estimate:** 1 hr to set up. Ongoing.
- **Done when:** file exists, has at least three candidate items in it.

## 13. Pitch three guest appearances

Pragmatic Engineer, Latent Space, LeadDev or similar. The thesis is now clear enough to point hosts at, which is what was missing before.

- Pitch with a specific Field Report or angle, not a generic “available to come on the show.”
- One paragraph each. Don’t agonise.
- **Estimate:** 1 hr total.
- **Done when:** three pitches sent.

## 14. Add the advisory line to the homepage

One sentence. *“I advise one or two non-competitive companies on AI-native engineering org transitions. Get in touch if that’s useful.”*

- Don’t oversell it. Doesn’t change the day job. Doesn’t need a separate page yet.
- **Estimate:** 15 mins, plus the time to actually decide whether you want this.
- **Done when:** live on the homepage.

-----

## Parked, deliberately

Things from the audit report that aren’t in the list above, and the reason.

- **Live token-utilisation dashboard, handbook excerpts, named project case studies.** Highest-credibility artefacts you can publish, all require Skyscanner sign-off and a different kind of conversation. Park until the blog has cadence and you’ve got a clearer ask to bring to legal.
- **Diagnostic quiz, vendor decision tool, voice-mode audio.** Good ideas. None of them unlock anything else. Do them after items 1 to 14 if you’re still energised.
- **Book project, paid course.** Year-two moves at the earliest. Don’t even think about them until the field report cadence has held for six months.
- **Moderated Slack or Discord.** Real ongoing commitment. Skip until you actually want to run a community.
- **Annual State of AI talk asset.** Follows from the speaking pipeline, which follows from the thesis being clear. Wait until items 1 to 7 are done.

-----

Top to bottom in priority. If a week goes sideways, drop the item you’re on, don’t reshuffle. The order matters more than the velocity.
