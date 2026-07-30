---
title: Never run next build while the dev server is running
date: 2026-07-30
category: workflow-issues
module: development-environment
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "Running npm run build (or CI-style gates) locally while npm run dev is serving"
  - "A previously healthy dev server suddenly returns 500s after a build"
symptoms:
  - "ENOENT: no such file or directory, open '.next/server/pages/_app/build-manifest.json'"
  - "Dev server returns 500 on pages that built fine moments earlier"
tags: [nextjs, dev-server, build, dot-next, cache-corruption]
---

# Never run next build while the dev server is running

## Context

While verifying work with the full gate run (`npm test && npm run validate-posts && npm run build`), the dev server was left running for live testing. Both `next dev` and `next build` write to the same `.next` directory, and the production build clobbered the dev server's manifests mid-flight.

## Guidance

Do not run `npm run build` while `npm run dev` is serving. Stop the dev server first, or accept that it needs a reset afterwards. Recovery when it happens:

```bash
pkill -f "next dev"   # stop the wedged server
rm -rf .next          # clear the corrupted shared build dir
npm run dev           # restart clean
```

## Why This Matters

The failure is confusing because the build succeeds and the code is fine: the dev server 500s with `ENOENT ... build-manifest.json` while `git status` is clean and `next build` reports success. Without knowing the cause, it reads like a code regression and can burn real debugging time; with it, recovery is under a minute.

## When to Apply

- Any local verification loop that runs build gates while a dev server is up for visual testing.
- Diagnosing a dev server that was healthy, then started returning 500s right after a build ran in the same checkout.

## Examples

Observed in this repo during the editorial redesign (PR #17): the dev server served `/posts/ralph-isnt-the-point` fine, the gate run executed `npm run build`, and the next request to the same page returned 500 with the ENOENT above. `rm -rf .next` plus a dev-server restart fixed it with no code change.

## Related

- docs/solutions/workflow-issues/git-push-wrong-gh-account-System-20260322.md (same category: environment gotchas that masquerade as code problems)
