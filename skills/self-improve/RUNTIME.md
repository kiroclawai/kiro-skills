# Self-Improve — Runtime Mechanism

> Ensures the system can recover and continue working after context explosion, crash, or compression.
> Core principles: **progressive advancement, handover record, high-value revisit, multiple output channels.**

---

## I. Progressive advancement flow

### Flow design

```
┌─────────────────────────────────────────────────────────┐
│ Step 0: backup              → snapshot critical files   │
├─────────────────────────────────────────────────────────┤
│ Step 1: scan                → extract signals → feedback│
├─────────────────────────────────────────────────────────┤
│ Step 2: distill + classify  → three-level → themes/     │
├─────────────────────────────────────────────────────────┤
│ Step 3: elevate             → manage hot.md             │
├─────────────────────────────────────────────────────────┤
│ Step 4: route               → multi-channel routing     │
├─────────────────────────────────────────────────────────┤
│ Step 5: reflect             → write reflections.md      │
├─────────────────────────────────────────────────────────┤
│ Step 6: profile             → update profile.md (every 3│
├─────────────────────────────────────────────────────────┤
│ Step 7: notify              → notify user               │
└─────────────────────────────────────────────────────────┘
```

### Context control

| Principle | Description |
|---|---|
| Load only the previous step's output | Don't reread the original corpus unless it's a high-value revisit |
| Index first | Read the directory index, load files on demand |
| Checkpoint after each step | Record progress; resume from any step |

---

## II. Handover record (`checkpoint.json`)

```json
{
  "run_id": "2026-09-02T04:00:00+00:00",
  "current_step": "classify",
  "status": "in_progress",
  "completed_steps": [
    { "step": "backup", "status": "success", "output": "data/backup/2026-09-02", "duration_ms": 124 },
    { "step": "scan",   "status": "success", "output": "data/feedback/2026-09-02.jsonl", "count": 12 },
    { "step": "distill","status": "in_progress", "output": null }
  ],
  "pending_steps": ["elevate", "route", "reflect", "profile", "notify"],
  "high_value_items": [
    {
      "source": "feedback#4",
      "reason": "Distillable into a methodology: error→fix→prevent pattern",
      "potential": ["methodology", "blog"]
    }
  ],
  "last_update": "2026-09-02T04:03:42+00:00"
}
```

After every step:

1. Update `checkpoint.json`
2. Append a progress record to `run-log.jsonl`

---

## III. Cold-start recovery

### Steps

```
1. Read checkpoint.json
   ├─ incomplete run exists → resume from current_step
   └─ none                  → start a new run

2. Load the previous step's output
   └─ do not start from scratch

3. Continue execution
   └─ from current_step; do not repeat completed work

4. Cleanup on completion
   ├─ set status: "completed"
   └─ update last_success_ts in config.yaml
```

### Context size budget

| Stage | Content loaded | Size |
|---|---|---|
| Recovery state | `checkpoint.json` | ~1 KB |
| Step input | previous step's output | ~5-20 KB |
| Current execution | processing data | dynamic |

**Total per recovery: ~10-30 KB. Will not explode context.**

---

## IV. High-value revisit

### Identifying high-value items

The `proposer` module considers content in `hot.md` and `themes/` holistically and marks `high_value` based on:

- **High repetition count** — rule appears many times in `hot.md`
- **Wide impact** — applies to multiple agents or is system-level
- **High distillability** — can become a universal methodology or blog post
- **High information density** — large payload condensed across multiple conversations

Marked items go into `data/high-value/`.

### Revisit flow

```
After step 4 (route) completes:
  ├─ check high_value_items
  │    ├─ empty → skip
  │    └─ non-empty → step 4.5 (revisit)
  └─ revisit:
       ├─ deep read of original corpus (only now look back)
       ├─ deep distillation
       └─ write to corresponding output channel
```

Revisit is **optional**. It runs only when high-value items are detected.

---

## V. Multiple output channels

The `proposer` module routes material to the right destination:

| Output form | Target location | Decision basis |
|---|---|---|
| Rule solidification | `proposals/PENDING.md` | Behavior norm; appears 3+ times |
| Skill improvement | `data/themes/skill-improvements/` | Skill usage issue |
| Blog post | `drafts/blog-<topic>.md` | Universal value; shareable |
| Methodology | `{knowledge_root}/methodologies/` | Reusable thinking framework |
| Knowledge point | `data/errors/` or `data/lessons/` | Specific factual point |
| Business insight | `{knowledge_root}/business/` | Business-related |
| System improvement | `proposals/PENDING.md` (system-upgrade) | System design issue |

### Blog output flow

```
1. proposer determines "can become article"
2. write to drafts/blog-{topic}.md (draft)
3. polished later by an agent
4. published to a blog platform when ready
```

### Draft format

```markdown
# {Title}

> Status: draft · pending polish
> Source: self-improve run {run_id}
> Generated: {timestamp}

## Core points

{Distilled core points}

## Body

{Article body}

## Pending polish

- [ ] Title optimization
- [ ] Opening hook
- [ ] Stronger ending
- [ ] Case supplementation
```

---

## VI. Data flow

```
Original corpus (memory logs)
       │ scan + extract
       ▼
feedback/*.jsonl
       │ evaluate
       ▼
Evaluation results
       │ classify by theme
       ▼
themes/<theme>/*.md
       │ elevate / demote
       ▼
hot.md  (HOT)
       │
       │ holistic consideration in step 4
       ▼
┌──────────────┬──────────────┬──────────────┐
↓              ↓              ↓              ↓
PENDING.md   methodologies/ drafts/      errors/ + lessons/
(rule solid)  (knowledge)   (blog)       (intermediate)
                                  │
                                  └─ next round: proposer revisit
                                     discover commonalities → upgrade to rule/methodology
```

**Closed loop:** `errors/` and `lessons/` are both output destinations and input sources for the next round.

---

## VII. Checkpoint format reference

```
/path/to/self-improve/
├── checkpoint.json          # Current run state
├── run-log.jsonl            # Historical progress
├── config.yaml              # Includes last_success_ts
│
├── data/
│   ├── feedback/            # Step 1 output
│   ├── themes/              # Step 2 output
│   ├── hot.md               # Step 3 output
│   ├── errors/              # Intermediate
│   ├── lessons/             # Intermediate
│   └── high-value/          # High-value item records
│
├── proposals/
│   └── PENDING.md           # Rule solidification proposals
│
└── drafts/                  # Blog drafts
    └── blog-<topic>.md

{knowledge_root}/                # Independent output directory
├── methodologies/
├── business/
├── innovations/
└── articles/
```

---

## VIII. Relationship with existing mechanisms

| Existing mechanism | New mechanism | Relationship |
|---|---|---|
| `run-log.jsonl` | `checkpoint.json` | run-log records history; checkpoint records current state |
| `cron-trigger.md` | progressive advancement flow | Cron becomes step-by-step execution |
| `feedback-collector` | step 1 | unchanged, but must write checkpoint after completion |
| `proposer` | step 4 | expanded output judgment capability |
| `{knowledge_root}/` | one output channel | methodologies, business insights, innovations |

---

## IX. Failure semantics

| Failure | Behavior |
|---|---|
| Single step fails | Log error to `run-log.jsonl`; mark step `failed` in checkpoint; continue to next step |
| Step 0 (backup) fails | Abort run; do not modify any data |
| Step 1 (scan) finds nothing | Mark `no_signals`; skip steps 2-4; still run step 5 (reflect) and step 7 (notify with "no work") |
| Step 4 (route) produces >50 proposals | Truncate to top 50 by confidence; warn in `run-log.jsonl` |
| Any step exceeds 10 minutes | Mark `timeout`; record partial output; abort run |

The final run status is one of: `success`, `partial`, `failed`, `no_signals`.
