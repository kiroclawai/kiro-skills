# Self-Improve — System Documentation

> Version: 1.0.0 · Kiro edition
> A team's self-evolution operating system. Any agent reading this file knows everything.

---

## What this is

A pluggable, modular self-improvement framework. Agents learn from errors, corrections, and feedback; accumulate reusable experience rules; and continuously improve execution quality. Runs on a schedule (every 3 days by default) and only requires human confirmation when writing into system files.

---

## Core principles

1. **System files require approval** — see `approval.required_files` in `config.yaml`.
2. **Evidence first** — no inference from silence; three repetitions before a rule solidifies.
3. **Team-wide sharing** — what one agent learns benefits all agents.
4. **Infinitely extensible** — adding a module = creating a directory + writing a `MODULE.md` + registering it.
5. **Scheduled trigger** — runs on Cron, not in conversations.
6. **Fully automatic processing** — collection, classification, distillation are automatic.
7. **Self-determined format** — the language model decides how to organize language and which section to extend.
8. **Fault-tolerant continuation** — when a step fails, log the error and continue with subsequent steps.

### Runtime principles

9. **Progressive advancement** — each step only loads the previous step's output; no looking back.
10. **Handover record** — write a checkpoint after each step; resume from anywhere.
11. **Context control** — release corpus after extraction; do not keep it occupied.
12. **High-value revisit** — mark high-value items for later deep reading and distillation.
13. **Multiple output channels** — rule solidification, skill improvement, blog posts, methodologies.

---

## Directory structure

```
{installation_directory}/
├── SKILL.md                    # Discoverable top-level entry
├── SYSTEM.md                   # This file
├── RUNTIME.md                  # Execution flow
├── ENGINE.md                   # Trigger rules + classification
├── README.md                   # Quick start
├── _meta.json                  # Skill metadata
├── config.yaml                 # Module registry + switches + approval rules
├── user-config.yaml            # User template (paths, timezone, etc.)
├── checkpoint.json             # Handover record (current running state)
├── run-log.jsonl               # Progress log
├── changelog.md                # System upgrade log
│
├── modules/                    # Pluggable modules (each has MODULE.md)
│   ├── feedback-collector/     # Collect feedback
│   ├── distill-classifier/     # Distill + classify
│   ├── memory-layer/           # Tiered memory management
│   ├── proposer/               # Output routing + solidification proposals
│   ├── profiler/               # Capability profile
│   ├── reflector/              # Self-reflection
│   └── notify/                 # User notification
│
├── data/                       # Shared data for all modules
│   ├── hot.md                  # HOT layer: ≤100 lines of active rules
│   ├── corrections.md          # Correction log (most recent 50 entries)
│   ├── reflections.md          # Self-reflection log
│   ├── profile.md              # Team capability profile
│   │
│   ├── feedback/               # Structured feedback: YYYY-MM-DD.jsonl
│   ├── themes/                 # Theme classification
│   │   ├── behavior/           # Behavior norms
│   │   ├── communication/      # Communication preferences
│   │   ├── tools/              # Tool usage
│   │   ├── coding/             # Coding standards
│   │   ├── search/             # Search strategies
│   │   ├── writing/            # Writing style
│   │   ├── collaboration/      # Team collaboration
│   │   ├── preferences/        # Personal preferences
│   │   ├── professional/       # Professional capabilities
│   │   └── personality/        # Personality traits
│   │
│   ├── errors/                 # Error knowledge points (intermediate station)
│   ├── lessons/                # Experience lessons (intermediate station)
│   ├── high-value/             # High-value item records
│   ├── backup/                 # Pre-run backups
│   └── archive/                # Cold storage
│
├── proposals/
│   └── PENDING.md              # Pending modification proposals
│
├── drafts/                     # Blog drafts
│
└── scripts/                    # CLI tools
    ├── setup.mjs               # Validate config + create directory structure
    ├── improve.mjs             # Single-step improvement loop scaffold
    └── report.mjs              # Generate summary report
```

---

## How to use

### Daily work (passive recognition)

During normal operation, agents recognize learning signals and record them in `data/`:

| Event | Action |
|---|---|
| User corrected you | Append to `data/corrections.md` |
| User praised you | Record positive feedback |
| Completed important task | Append self-reflection to `data/reflections.md` |
| Discovered reusable rule | Record in `data/corrections.md` |
| Rule involves system files | Write a proposal to `proposals/PENDING.md` |

### Scheduled run (automatic)

Every 3 days at 04:00 (configurable), Cron triggers the full pipeline:

```
0. backup               → copy critical files to data/backup/
1. scan                 → feedback-collector extracts signals from memory logs
2. distill + classify   → three-level distillation + theme classification
3. elevate              → memory-layer updates hot.md
4. route                → proposer decides output channel
5. revisit              → deep read of high-value items (optional)
6. wrap-up              → reflect + profile + notify
```

The authoritative step-by-step flow is defined in `RUNTIME.md`.

### Active query

| Query | Action |
|---|---|
| "What did you learn?" | Show recent corrections + reflections |
| "Check improvement proposals" | Show `proposals/PENDING.md` |
| "Improvement statistics" | Run `scripts/report.mjs` |
| "Forget X" | Delete from all layers (after confirmation) |

### Manual trigger

```bash
# Single-step improvement (scaffold)
node scripts/improve.mjs --step scan --config user-config.yaml

# Generate summary report
node scripts/report.mjs --days 7

# Re-run setup (safe to repeat)
node scripts/setup.mjs --config user-config.yaml
```

---

## Module system

### Module standard

Each module lives under `modules/<name>/` and must contain a `MODULE.md` describing its responsibility, input, output, and dependencies.

### Core modules

| Module | Responsibility | Output |
|---|---|---|
| `feedback-collector` | Scan conversations, extract signals | `data/feedback/*.jsonl` |
| `distill-classifier` | Three-level distillation + classification | `data/themes/<theme>/*.md` |
| `memory-layer` | Tiered memory management | `data/hot.md`, promotion/demotion logs |
| `proposer` | Determine output channel | `proposals/PENDING.md`, `drafts/` |
| `reflector` | Self-reflection | `data/reflections.md` |
| `profiler` | Team capability profile | `data/profile.md` |
| `notify` | Notify user of pending proposals | channel-specific notification |

### Adding new modules

1. Create a directory under `modules/`
2. Write `MODULE.md`
3. Register in `config.yaml` under `modules`
4. Append to `changelog.md`

---

## Approval mechanism

`config.yaml` defines `approval.required_files`. Anything in that list **must** go through this gate:

1. Write the proposed change to `proposals/PENDING.md`
2. Notify the user
3. Execute only after the user confirms
4. Mark the proposal as completed once applied

### Files requiring confirmation

`AGENTS.md`, `TOOLS.md`, `MEMORY.md`, `SOUL.md`, `HEARTBEAT.md`, `openclaw.json`, `SKILL.md`

### Files written automatically

- `data/*` — internal improvement data
- `{knowledge_root}/*` — distilled knowledge (written by the knowledge archiver)

---

## Data tiers

| Tier | Location | Size limit | Behavior |
|---|---|---|---|
| **HOT** | `data/hot.md` | ≤100 lines | Always loaded |
| **WARM** | `data/themes/<theme>/` | ≤200 lines per file | Loaded on demand |
| **COLD** | `data/archive/` | unlimited | Loaded only on explicit query |

Promotion / demotion:

- Used 3+ times in 7 days → promote to **HOT**
- Unused 30 days → demote to **WARM**
- Unused 90 days → archive to **COLD**
- **Never** automatically deleted

---

## Learning signals

### Triggers learning

| Signal | Confidence | Action |
|---|---|---|
| User explicitly corrects you | high | Record immediately in `data/corrections.md` |
| User repeats the same point | high | Mark as repeated, raise priority |
| User explicitly states a preference | confirmed | Write directly to HOT |
| Same correction 3+ times | confirmed | Generate solidification proposal |
| Task failure / error | high | `data/corrections.md` + root cause |
| User praise | positive | Record success case (+1) |

### Does **not** trigger learning

- Silence
- Single one-off instructions
- Hypothetical discussion
- Third-party preferences
- Group chat (unless user explicitly confirms)

---

## Security boundaries

### Never store

- Passwords, API keys, tokens
- Financial information
- Medical information
- Third-party personal information
- Location patterns

### Transparency guarantees

- "What did you remember?" → full export on request
- Every rule is tagged with source and timestamp
- "Forget X" → delete from all tiers after confirmation

---

## Relationship with existing systems

```
memory/YYYY-MM-DD.md   →  fact records (what happened)
MEMORY.md              →  long-term memory (important people, events, decisions)
{knowledge_root}/      →  automatically distilled knowledge
self-improve/          →  execution improvement (how to do better)
```

All four complement each other. No overlap, no substitution.

---

## Installation

```bash
# 1. Configure paths
cp user-config.yaml my-config.yaml
$EDITOR my-config.yaml

# 2. Run setup
node scripts/setup.mjs --config my-config.yaml

# 3. Approve the Cron task written to proposals/PENDING.md

# 4. Add the Cron task to your OpenClaw configuration
```

The setup script:

- Validates `user-config.yaml`
- Creates the full directory tree
- Initializes empty data files (`hot.md`, `corrections.md`, `reflections.md`, `profile.md`)
- Writes a Cron proposal to `proposals/PENDING.md`

---

## Onboarding new agents

**Automated. No manual configuration required.**

On every Cron run, the framework scans memory directories under `workspace_root`. New agents are picked up automatically on their next scheduled run.

To make a new agent aware of the system, add this block to its `AGENTS.md`:

```markdown
## Self-Improvement

This team runs the self-improve framework.

### During daily work
- When user corrects you → append to `data/corrections.md`
- After an important task → write self-reflection to `data/reflections.md`
- When you discover a reusable rule → record it in `data/corrections.md`
- When a rule touches system files → write a proposal to `proposals/PENDING.md`
```

---

## Why this is **not** a normal skill

Self-improve is intentionally **not** installed under `~/.openclaw/skills/`:

- Skills are per-agent. Self-improve is shared by the entire team.
- Skills are triggered by session-startup matching. Self-improve is triggered by Cron.
- Skills are short, single-purpose loaders. Self-improve is a long-running framework with state, checkpoints, and an approval queue.

It is an **independently installed framework** that the agent ecosystem depends on, not a session-scoped capability.
