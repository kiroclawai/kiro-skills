---
name: memory-archivist
description: >
  Memory file curator. Folds raw daily notes into USER.md (durable user
  preferences) and MEMORY.md (durable non-profile facts), prunes stale
  entries, marks superseded directives, and runs scheduled cleanups.
  Use when daily memory files are growing faster than they are being
  digested.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/kiroclawai/kiro-skills
requirements:
  binaries: []
  env: []
tags:
  - meta
  - memory
  - curation
  - cleanup
  - automation
---

# Memory Archivist

Your memory files should be a curated layer, not a dumping ground. Memory Archivist handles the boring but critical work of folding daily notes into durable memory.

```bash
openclaw skills install memory-archivist
```

---

## What it does

1. **Reads daily notes** from `memory/YYYY-MM-DD.md`
2. **Classifies entries** by durability:
   - **User directive** (style, preferences, relationships) → `USER.md`
   - **Decision / lesson / project fact** → `MEMORY.md`
   - **One-off event** → stays in daily only (or pruned)
3. **Marks superseded** entries — never silently overwrites
4. **Prunes** entries that are stale (>90 days, no references) or contradict active directives
5. **Writes diffs** for human review before committing changes
6. **Runs on schedule** via cron or `self-improve` integration

## Quick start

```bash
# Preview what would change
memory-archivist plan --since 30d

# Apply changes
memory-archivist apply --since 30d

# Dry-run cleanup
memory-archivist prune --dry-run
```

## Classification rules

| Signal in daily note | Destination | Example |
|---------------------|-------------|---------|
| "Always", "Never", "Prefer" | `USER.md` (active directive) | "Always reply in markdown" |
| "We decided", "Lesson learned", "X is true" | `MEMORY.md` | "The PAT is for kiroclawai" |
| "Today I...", "Did X", "Tried Y" | stays in daily or pruned | "Spent 10min on auth" |
| Contradicts an active directive | mark `superseded` | style preference changed |

## File shape produced

```markdown
<!-- USER.md -->
<!-- observed: 2026-09-03 | status: active -->
- Always verify GitHub account before pushing code.

<!-- observed: 2026-09-01 | status: superseded -->
- Always use Ecook14's PAT for kiroclawai repos. ← marked superseded, rewritten below

<!-- observed: 2026-09-03 | status: active -->
- Use the kiroclawai PAT for kiroclawai repos; never cross-account.
```

## Pruning criteria

- Entry has not been referenced in any daily note for > 90 days
- Entry is contradicted by a newer active directive
- Entry is a one-off event with no durable value
- Entry is a debug log / error message that was resolved

## Integration with self-improve

`self-improve` produces *rules* from mistakes. `memory-archivist` produces *facts and decisions* from events. They complement each other:

- `self-improve` → `~/.config/openclaw/rules/` (behavior)
- `memory-archivist` → `USER.md` + `MEMORY.md` (state + preferences)

## Philosophy

A memory file that grows without curation is a liability, not an asset. The goal is to make the next session's load faster, not slower.
