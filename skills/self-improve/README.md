# Self-Improve 🧠

**Your agent runs the same loop every day.**
**Self-Improve makes it get better every week.**

```bash
openclaw skills install self-improve
# or from source
git clone https://github.com/Pawclaw01/kiro-skills.git
cd kiro-skills/skills/self-improve
```

---

## What it is

A pluggable self-improvement framework for AI agents. It runs on a schedule (every 3 days by default), reads your agent's memory logs, and **distills the mistakes, corrections, and feedback into reusable rules** — automatically.

System files (AGENTS.md, TOOLS.md, SKILL.md, ...) **never** change without explicit human approval. Everything else is automatic.

---

## Without Self-Improve

```
Day 1:  User corrects you on tone. You remember for this session.
Day 2:  Same correction. You remember again for this session.
Day 3:  Same correction. You feel like a broken record.
Day 4:  Same correction. Nothing in your AGENTS.md reflects it.
Day 5:  New agent joins. Makes the same mistake from Day 1.
```

## With Self-Improve

```
Day 1:  User corrects you on tone.
Day 3:  Cron runs. Self-Improve scans memory, finds the correction.
Day 3:  Three-level distillation turns it into: "Use direct, factual tone."
Day 3:  After 3 corrections, a solidification proposal lands in PENDING.md.
Day 4:  User approves. The rule is now part of every agent's AGENTS.md.
Day 5:  New agent joins. Already knows the tone rule.
```

---

## How it works

```
┌─────────────────────────────────────────────────────────┐
│  7-step improvement loop                                │
│                                                         │
│  backup → scan → distill → elevate → route → reflect    │
│                                            ↓            │
│                                       profile → notify  │
└─────────────────────────────────────────────────────────┘
```

| Step | What happens |
|---|---|
| **backup** | Snapshot critical files to `data/backup/<run_id>/` |
| **scan** | Read memory logs; extract signals into `data/feedback/*.jsonl` |
| **distill** | Three-level distillation + theme classification into `data/themes/` |
| **elevate** | Promote / demote rules between HOT / WARM / COLD |
| **route** | Decide output channel; write proposals to `proposals/PENDING.md` |
| **reflect** | Append self-reflection to `data/reflections.md` |
| **profile** | Update team capability profile (`data/profile.md`, every 3rd run) |
| **notify** | Inform owner of pending proposals |

Full flow with failure semantics: [`RUNTIME.md`](./RUNTIME.md)
Trigger rules + module lifecycle: [`ENGINE.md`](./ENGINE.md)
Full system architecture: [`SYSTEM.md`](./SYSTEM.md)

---

## The three memory tiers

| Tier | Location | Size | Behavior |
|---|---|---|---|
| **HOT** | `data/hot.md` | ≤100 lines | Loaded into every context |
| **WARM** | `data/themes/<theme>/` | ≤200 lines each | Loaded on demand |
| **COLD** | `data/archive/` | unlimited | Loaded only on explicit query |

Promotion / demotion is automatic:

- Used 3+ times in 7 days → promote to **HOT**
- Unused 30 days → demote to **WARM**
- Unused 90 days → archive to **COLD**
- **Never** automatically deleted

---

## Quick start

### 1. Configure paths

```bash
cp user-config.yaml my-config.yaml
$EDITOR my-config.yaml
```

### 2. Run setup

```bash
node scripts/setup.mjs --config my-config.yaml
```

This validates your config, creates the directory tree, and writes a Cron proposal to `proposals/PENDING.md`.

### 3. Approve the Cron task

Open `proposals/PENDING.md`, copy the JSON block into your OpenClaw `cron` configuration. Done.

---

## Scripts

| Script | Purpose |
|---|---|
| `scripts/setup.mjs` | Validate config; create directory tree; write Cron proposal |
| `scripts/improve.mjs` | Single-step or full improvement loop |
| `scripts/report.mjs` | Generate summary report (text or markdown) |

All scripts are pure Node 18+ ESM. **No external dependencies.** Run with `--help` for usage.

```bash
node scripts/setup.mjs --help
node scripts/improve.mjs --help
node scripts/report.mjs --help
```

---

## Approval boundary

**Never stored:** passwords, API keys, tokens, financial / medical data, third-party personal info, location patterns.

**Always approval-gated:** `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `MEMORY.md`, `HEARTBEAT.md`, `openclaw.json`, `SKILL.md`.

Everything else (the data directory, the knowledge root, drafts) is written automatically.

---

## Why this is **not** a normal skill

Self-improve is intentionally **not** installed under `~/.openclaw/skills/`:

- Skills are per-agent. Self-improve is shared by the entire team.
- Skills are triggered by session-startup matching. Self-improve is triggered by Cron.
- Skills are short, single-purpose loaders. Self-improve is a long-running framework with state, checkpoints, and an approval queue.

It's a **framework your agent ecosystem depends on**, not a session-scoped capability.

---

## Requirements

- **Node.js** ≥ 18.0.0
- **OpenClaw** ≥ 2026.3.0 (for Cron integration)
- Writable paths for `storage.root`, `storage.knowledge_root`, and `storage.workspace_root`

---

## License

MIT — see [LICENSE](../../LICENSE).

---

*Self-Improve v1.0.0 by Kiro.*
*Built on the belief that the best agents are the ones that get better every week.*
