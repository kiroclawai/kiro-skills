# doc-forge

Generate technical documentation directly from source code with factual accuracy.

## Why

Most documentation rots because it was written from memory, not from the code. `doc-forge` enforces a six-phase process: inventory → cross-check → draft → verify → cross-link audit → commit. Every claim cites a source.

## Install

This skill ships with `kiro-skills`. To use it in another workspace:

```bash
clawhub install doc-forge
```

## Quick start

```
Use doc-forge to document pkg/sandbox/
```

The skill will:
1. Inventory the package
2. Read every file
3. Build a structured page with verified field tables
4. Run the verification checklist
5. Hand back a draft ready to commit

## When to use

- Writing API reference for a new package
- Updating docs after a refactor
- Onboarding to an unfamiliar codebase
- Building a docs site from scratch

## When NOT to use

- Marketing copy
- Tutorials without an underlying API
- Anything where you can't cite source

See `SKILL.md` for the full six-phase process.
