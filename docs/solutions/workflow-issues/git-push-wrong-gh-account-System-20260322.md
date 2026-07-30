---
module: System
date: 2026-03-22
problem_type: workflow_issue
component: development_workflow
symptoms:
  - "fatal: could not read Password for 'https://ibenstewart@github.com': Device not configured"
  - "git push origin main fails on auth despite gh being logged in"
root_cause: config_error
resolution_type: workflow_improvement
severity: medium
tags: [github, auth, gh-cli, push, deploy]
---

# Troubleshooting: Git Push Fails Due to Wrong GitHub Account Active

## Problem
`git push origin main` fails with a password error because the `gh` CLI has the wrong GitHub account set as active. The repo remote uses `ibenstewart` but `benstewartskyscanner` was the active account.

## Environment
- Module: System (Git/GitHub configuration)
- Repo: ibenstewart/benstewart-blog
- Remote: `https://ibenstewart@github.com/ibenstewart/benstewart-blog.git`
- Date: 2026-03-22

## Symptoms
- `git push origin main` returns: `fatal: could not read Password for 'https://ibenstewart@github.com': Device not configured`
- Push appears to hang or fail silently before the error
- `gh auth status` shows two accounts logged in, with the wrong one (`benstewartskyscanner`) active

## What Didn't Work

**Direct solution:** The problem was identified and fixed on the first attempt after checking `gh auth status`.

## Solution

**Commands run:**
```bash
# Check which account is active
gh auth status

# Output showed:
# ✓ Logged in to github.com account benstewartskyscanner (keyring)
#   - Active account: true
# ✓ Logged in to github.com account ibenstewart (keyring)
#   - Active account: false

# Switch to the correct account
gh auth switch --user ibenstewart

# Now push works
git push origin main
```

## Why This Works

The `gh` CLI manages multiple GitHub accounts via `gh auth login`. When `git push` uses HTTPS, it delegates credential lookup to `gh auth`. If the active account doesn't have access to the repo (or the remote URL embeds a different username), the push fails with a misleading "Device not configured" error.

Switching the active account to `ibenstewart` — which owns the repo — resolves the credential mismatch.

## Prevention

- **RULE: Always use `ibenstewart` for this repo. Never use `benstewartskyscanner`.**
- Before pushing, verify: `gh auth status` shows `ibenstewart` as active
- If switching accounts frequently, consider running `gh auth switch --user ibenstewart` at the start of each session on this repo
- This is also saved in Claude memory (`MEMORY.md`) to prevent recurrence in AI-assisted sessions

## Related Issues

No related issues documented yet.
