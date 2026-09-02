---
name: self-improve
description: >
  A pluggable self-improvement framework for AI agents. Automatically learns
  from mistakes, corrections, and feedback to continuously improve execution
  quality. Runs every 3 days via Cron, extracts reusable experience rules from
  memory logs, and proposes system-file changes behind an approval gate.
  Includes a 3-tier memory system (HOT / WARM / COLD) and runnable Node.js
  scripts for setup, improvement, and reporting. Use when an agent needs to
  compound its own capabilities over time without manual rule editing.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/Pawclaw01/kiro-skills
requirements:
  binaries:
    - node (>= 18.0.0)
  env: []
tags:
  - self-improvement
  - learning
  - cron
  - memory
  - feedback
  - approval-gated
---

# Self-Improve Framework

A pluggable self-improvement framework that turns an agent's mistakes, corrections, and feedback into reusable rules — automatically.

```bash
openclaw skills install self-improve
# or from source
git clone https://github.com/Pawclaw01/kiro-skills.git
```

---

## What it does

Self-Improve runs on a schedule (every 3 days by default) and:

1. **Scans** memory logs and feedback for learning signals
2. **Distills** them into reusable rules (three-level distillation)
3. **Classifies** rules by theme (behavior, tools, communication, ...)
4. **Elevates** frequently-used rules to a fast HOT layer
5. **Proposes** system-file changes through `proposals/PENDING.md` (approval-gated)
6. **Reports** what changed and what needs review

System files (AGENTS.md, TOOLS.md, SKILL.md, ...) **never** change without explicit human approval. Everything else is automatic.

---

## When to use

- **Scheduled** — Default cron: `0 4 */3 * *` (every 3 days at 04:00)
- **After a hard correction** — When the user tells you something you should remember
- **After a major failure** — To convert a root cause into a reusable rule
- **Periodic audit** — To review accumulated rules and prune noise

---

## Quick start

### 1. Configure paths

Copy and edit `user-config.yaml`:

```yaml
storage:
  root: "/path/to/self-improve"
  knowledge_root: "/path/to/learned"
  workspace_root: "/path/to/agents"

owner:
  name: "YourName"
  timezone: "UTC"
```

### 2. Run setup

```bash
node scripts/setup.mjs --config user-config.yaml
```

This validates the config and creates the directory tree:

```
self-improve/
├── data/
│   ├── hot.md          # HOT layer: ≤100 active rules
│   ├── themes/         # WARM layer: theme-classified rules
│   └── archive/        # COLD layer: archived rules
├── proposals/
│   └── PENDING.md      # Approval queue
├── drafts/             # Blog drafts
└── scripts/            # setup / improve / report
```

### 3. Approve the cron task

`setup.mjs` writes a Cron proposal to `proposals/PENDING.md`. Approve it in your OpenClaw configuration to enable scheduled runs.

---

## The three memory tiers

| Tier | Location | Size | Behavior |
|---|---|---|---|
| **HOT** | `data/hot.md` | ≤100 lines | Loaded into every context |
| **WARM** | `data/themes/{name}/` | ≤200 lines each | Loaded on demand |
| **COLD** | `data/archive/` | unlimited | Loaded only on explicit query |

Promotion / demotion is automatic:

- Used 3+ times in 7 days → promote to **HOT**
- Unused 30 days → demote to **WARM**
- Unused 90 days → archive to **COLD**

Nothing is ever automatically deleted.

---

## The 7-step improvement loop

```
backup → scan → distill → elevate → route → reflect → notify
```

Defined in detail in [`RUNTIME.md`](./RUNTIME.md). Trigger rules and module dependencies in [`ENGINE.md`](./ENGINE.md). Full system docs in [`SYSTEM.md`](./SYSTEM.md).

---

## Scripts

| Script | Purpose |
|---|---|
| `scripts/setup.mjs` | Validate config, create directories |
| `scripts/improve.mjs` | Main improvement loop (single-step scaffold) |
| `scripts/report.mjs` | Generate summary report from data files |

All scripts are pure Node 18+ ESM. No external dependencies. Run with `--help` for usage.

---

## Security boundary

**Never stored:** passwords, API keys, tokens, financial or medical data, third-party personal info, location patterns.

**Always approval-gated:** AGENTS.md, SOUL.md, TOOLS.md, MEMORY.md, HEARTBEAT.md, openclaw.json, SKILL.md.

---

## Full documentation

- [`SYSTEM.md`](./SYSTEM.md) — architecture, modules, approval mechanism, learning signals
- [`RUNTIME.md`](./RUNTIME.md) — step-by-step execution flow, checkpoint format, recovery
- [`ENGINE.md`](./ENGINE.md) — trigger rules, classification mapping, module lifecycle

---

*Self-Improve v1.0.0 by Kiro.*
*Built on the belief that the best agents are the ones that get better every week.*
