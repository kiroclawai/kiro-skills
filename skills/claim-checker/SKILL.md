---
name: claim-checker
description: >
  Disciplines an agent's outbound claims before they leave its mouth.
  Before saying "done", "fixed", "verified", or "X has property Y",
  cross-references the claim against recent tool calls, file changes,
  exit codes, and observable side effects. Flags claims that lack
  evidence. Use when an agent is at risk of hallucinating success —
  especially after multi-step or delegated work.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/kiroclawai/kiro-skills
requirements:
  binaries: []
  env: []
tags:
  - meta
  - verification
  - honesty
  - discipline
  - safety
---

# Claim Checker

The skill that makes "done" mean "done." Runs an evidence check on every outbound claim before you write it into a user-visible reply.

```bash
openclaw skills install claim-checker
```

---

## What it does

Before the agent sends any reply containing a **commitment claim** (`done`, `fixed`, `pushed`, `verified`, `✓`, `shipped`, `deployed`, `authenticated`), it must answer:

1. **What tool call produced the side effect I am claiming?**
   - If the tool call returned an error, the claim is rejected
   - If the tool call returned a timeout/blocked status, the claim is rejected
2. **Is the side effect observable from outside this turn?**
   - For commits: does `git log` show the new SHA?
   - For pushes: did the remote show `→ main`?
   - For auth: did the auth check return the expected account?
   - For file writes: does `read` show the new content?
3. **Did I confuse a subagent's report with a tool result?**
   - Subagent reports are *firsthand* only if you read them; otherwise treat as hearsay
4. **Am I pattern-matching from earlier context?**
   - If the claim references an earlier turn's state, re-verify that state

If any check fails, the claim is replaced with a softer formulation:
- ❌ "Authenticated as kiroclawai" (unverified)
- ✅ "Authentication attempted; verify with `gh auth status`"

## Failure modes it catches

| Failure | What went wrong | How claim-checker catches it |
|---------|-----------------|------------------------------|
| Hallucinated subagent success | Subagent timed out, agent said "done" | No tool call returned success → claim replaced |
| Cross-account confusion | Token belongs to wrong account | `gh api /user` must show target account |
| Stale state | Earlier turn's state changed | Re-query before claiming |
| Premature completion | Process still running | `process list` shows it as `running` → reject |
| Phantom writes | `write` to wrong path | `read` back confirms |

## Quick start

The skill is enforced via a small pre-output checklist that the agent runs mentally before any reply containing commitment language:

```markdown
1. Search this turn's tool calls for the claim's side effect
2. Confirm exit status == 0 / status == "ok"
3. Confirm the side effect is externally observable
4. If any check fails → soften or remove the claim
```

## Configuration

```yaml
claim-checker:
  enforce: true                # block unsourced claims entirely
  trigger-phrases:             # phrases that require evidence
    - "done"
    - "fixed"
    - "shipped"
    - "deployed"
    - "verified"
    - "pushed"
  soften-to: "verify with"     # how to phrase unverified claims
  exception-triggers:          # cases where claims are auto-allowed
    - "user-confirmed"
    - "operator-provided"
```

## Why it exists

Because an agent that confidently lies about its own work is worse than an agent that says "I tried, here's what happened." Trust is built by **saying less, but meaning more.**
