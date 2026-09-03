---
name: tool-budget-guardian
description: >
  Tool-call and subagent cost tracker. Records every tool invocation with
  cost metadata, deduplicates parallel work, refuses to re-spawn subagents
  for tasks already completed or in flight, and emits a per-session
  spend report. Use when an agent has burned cycles chasing a hallucinated
  state — or when budget is genuinely tight.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/kiroclawai/kiro-skills
requirements:
  binaries: []
  env: []
tags:
  - meta
  - cost
  - subagents
  - efficiency
  - safety
---

# Tool Budget Guardian

Stop burning tokens on the same problem twice. Tool Budget Guardian is the skill that notices "I've already tried this" and refuses to do it again.

```bash
openclaw skills install tool-budget-guardian
```

---

## What it does

1. **Records every tool call** with: name, args hash, status, runtime, cost (if available), result summary
2. **Deduplicates** — spawning two subagents for the same task produces a warning and a refusal to spawn the second
3. **Tracks subagent lifecycle** — refuses to spawn a subagent when an earlier one for the same task is still running
4. **Emits a session spend report** on demand
5. **Caps tool calls per task** — soft and hard limits prevent runaway execution
6. **Audits `list`/`history` calls** — repeated polling of the same endpoint is flagged

## Anti-patterns caught

| Pattern | Why it's wasteful | Guardian action |
|---------|-------------------|-----------------|
| Spawning a subagent to verify what another subagent already verified | Double the cost for same info | Refuse spawn, return cached |
| `process poll` in a tight loop | Burns tokens, no new info | Force `yieldMs` instead |
| Re-running the same `gh api` call "to be sure" | Same response twice | Return cached |
| Spawning 4 subagents for the same auth task (yes, this happened) | 4× the cost, 0 new info | Refuse 2nd, 3rd, 4th |
| Calling `secrets:list` repeatedly | Stable output | Return cached for the session |

## Quick start

```bash
# Show current session spend
tool-budget-guardian report

# Show subagent dedup state
tool-budget-guardian subagents

# Cap a task to N tool calls
tool-budget-guardian cap 20

# Pause on runaway
tool-budget-guardian stop-after 30
```

## Configuration

```yaml
tool-budget:
  soft-cap: 50           # warn at this many tool calls
  hard-cap: 100          # refuse new work at this many
  subagent-dedup: true   # refuse duplicate spawns
  cache-ttl: 600         # seconds to cache idempotent results
  cost-tracking:
    enabled: true
    fields: [tokens, runtime, subagent-spawn]
```

## Spend report shape

```markdown
## Session Spend Report

| Category | Count | Notes |
|----------|-------|-------|
| `exec` | 14 | 2 redundant (cached now) |
| `read` | 6 | OK |
| `write` | 11 | OK |
| `sessions_spawn` | 4 | 3 duplicates blocked |
| `secrets` | 3 | 2 cached |
| `process` | 8 | 6 polls deduped |

**Estimated tokens spent:** ~12,400
**Estimated tokens saved by dedup:** ~4,200
```

## Philosophy

Every tool call is money — the user's, the agent's, the planet's. Spend it once, cache the result, and never re-spawn a subagent for work that's already in flight.
