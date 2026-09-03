---
name: context-curator
description: >
  Context window budget manager. Plans token spend across a multi-step
  task, defers large reads, summarizes verbose tool outputs, and refuses
  to re-load the same data twice. Use when a task spans many tool calls
  and the agent risks exhausting context mid-workflow.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/kiroclawai/kiro-skills
requirements:
  binaries: []
  env: []
tags:
  - meta
  - context-management
  - efficiency
  - budgeting
---

# Context Curator

Spend tokens on the work, not the chat log. Context Curator is the discipline that keeps a long session from collapsing under its own transcript.

```bash
openclaw skills install context-curator
```

---

## What it does

1. **Plans token spend** before starting multi-step work
   - Estimates budget per phase (explore, plan, execute, verify)
   - Flags phases that would consume >30% of remaining context
2. **Defers large reads** — files > 500 lines are read with `limit`/`offset` and summarized
3. **Caches repeated reads** — same file read twice in a turn = cached result
4. **Summarizes verbose outputs** — long `exec`/`process` outputs are condensed to first/last N lines + status
5. **Refuses redundant tool calls** — same `gh api` hit twice in a session = return cached
6. **Prefers targeted reads over full listings** — `git log --oneline -10` over `--stat -100`

## Budget planning

```yaml
context-budget:
  total: 200000          # available tokens
  reserve-pct: 15        # held back for user reply
  phases:
    - name: explore
      budget-pct: 20
      strategy: targeted-reads
    - name: plan
      budget-pct: 5
      strategy: in-memory
    - name: execute
      budget-pct: 45
      strategy: parallelize
    - name: verify
      budget-pct: 15
      strategy: external-checks
```

## Read strategies

| File type | Default strategy |
|-----------|-------------------|
| Source code | First 100 lines + targeted reads on demand |
| Markdown | First 50 lines + targeted reads |
| Logs | `head -20` + `tail -20`, grep for keywords |
| JSON / API output | `jq` extract only the fields needed |
| Long transcripts | Summarize to bullets before quoting |

## Anti-patterns it catches

- **Reading the same file three times** — should be cached after first read
- **`ls -la` on a 5000-file directory** — use `find ... -maxdepth` or `tree -L`
- **`cat *.json` to inspect a config** — `jq '.field'` instead
- **`git log` with no flags** — `--oneline -20` is usually enough
- **Re-running an expensive command "just to be sure"** — check if the result is already in this turn

## When to invoke

- At the start of any task with > 5 expected tool calls
- After every `exec` that returns > 2000 lines
- Before spawning a subagent (estimate subagent's context budget)
- When context feels "heavy" — usually a sign of accumulated verbose reads

## Philosophy

A context window is a budget, not a buffet. Spend it on the parts of the task that *change the outcome*. Reading a 4000-line log twice is theft from the steps that actually need the budget.
