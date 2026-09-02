---
name: doc-forge
description: "Generate detailed technical documentation directly from source code with cross-references and factual accuracy. Use when writing API references, architecture docs, feature guides, or any docs that must stay aligned with the actual implementation."
version: 1.0.0
author: Kiro
license: MIT
---

# Doc Forge

Generate technical documentation that is **grounded in source code**, not in assumptions. Every fact, every field name, every package path must trace back to a file you read.

## Core Principle

**Never invent. Always cite.** Every claim in the doc must be backed by a source file path and line number. If you can't cite it, don't write it.

## When to Use

- API reference docs (every field, every method, every package)
- Architecture overviews (with real package layouts)
- Feature guides (with real code examples that compile)
- Migration guides (with before/after from actual code)
- Tutorial docs (with verified imports and constructors)

## When NOT to Use

- Marketing copy, blog posts, opinion essays
- Docs without an underlying codebase to reference
- Highly speculative or forward-looking content

## The Six-Phase Process

### Phase 1 — Inventory

Before writing anything, build a complete inventory of the surface you are documenting.

```bash
# Discover the structure
ls -la <repo>
find <repo>/pkg -name "*.go" -o -name "*.py" -o -name "*.ts" 2>&1
grep -l "func New" <repo>/pkg/**/*.go 2>&1
```

**Output:** A flat list of every package, every exported type, every constructor. This becomes your index.

### Phase 2 — Cross-Check

For each item in the inventory, read the source. Record:

| Field | Value |
|---|---|
| File path | `pkg/agents/agent.go` |
| Line range | `42–87` |
| Type signature | `func NewAgent(cfg AgentConfig) *Agent` |
| Field count | 17 fields |
| Last modified | 2026-08-14 |

**Rule:** Never state a field exists without grep-confirming it.

### Phase 3 — Draft

Write each doc section using:
- **Real code examples** copied (with edits for clarity) from `examples/` or test files
- **Tables** for fields, methods, parameters — always with type + description
- **Code blocks** with the actual import path users would write
- **Cross-links** to related pages (don't orphan concepts)

### Phase 4 — Verify

Before committing, run these checks:

```bash
# 1. Every package path mentioned must exist
grep -r "pkg/foo/bar" docs/ && [ ! -d pkg/foo/bar ] && echo "BOGUS REFERENCE"

# 2. Every constructor mentioned must be exported
grep -rE "New[A-Z][a-zA-Z]+" docs/ | while read line; do
  ctor=$(echo "$line" | grep -oE "New[A-Z][a-zA-Z]+" | head -1)
  grep -rq "func $ctor(" pkg/ || echo "MISSING: $ctor"
done

# 3. Every field name in tables must exist in the struct
grep -rE "^\| [A-Z][a-zA-Z]+ \|" docs/ | while read row; do
  # extract field name and verify
done

# 4. Code blocks must compile (sample test)
node -e "$(grep -A 50 '^```go' docs/foo.md | head -50)"
```

### Phase 5 — Cross-Link Audit

Internal links between pages must resolve:

```bash
# Find all internal links
grep -rohE "\[[^\]]+\]\([^)]+\)" docs/ | grep -oE "\([^)]+\)" | sort -u

# Check each target exists
while read link; do
  target=$(echo "$link" | sed 's/^(//;s/)$//')
  [ -f "docs/$target" ] || [ -f "docs/$target.md" ] || echo "BROKEN: $link"
done
```

### Phase 6 — Commit

```bash
git add docs/
git commit -m "docs: <scope>

- Added: <list of new pages>
- Updated: <list of updated pages>
- Cross-checked against: <commit SHA or branch>

Verified:
- [ ] All package paths exist
- [ ] All constructors are exported
- [ ] All field tables match structs
- [ ] All code blocks compile (sampled)
- [ ] All internal links resolve"
```

## Output Template

Every doc page should follow this Jobsian-style template:

```markdown
# Page Title

<one-sentence summary of what this is>

<package path in monospace>

## What it does

<2-3 sentences>

## How to use it

<code block>

## Reference

<table of fields/methods/options>

## See also

<links to related pages>
```

## Anti-Patterns

❌ **Inventing field names** — if you can't grep it, don't write it
❌ **Vague descriptions** — "various options" or "many features" tells nothing
❌ **Stale examples** — code that doesn't match current SDK
❌ **Orphan concepts** — pages with no incoming or outgoing links
❌ **Marketing tone** — "blazing fast", "elite tier", emojis in technical docs

## Verification Checklist

Before declaring a doc page complete:

- [ ] Package paths cited and verified via `ls`
- [ ] Every constructor name verified via `grep -rn "func New"`
- [ ] Code examples copied from working samples or test files
- [ ] Tables have type + description columns
- [ ] Cross-links to at least one related page
- [ ] No marketing adjectives in technical descriptions
- [ ] Build (if applicable) succeeds without errors

## Example: Documenting a New Package

**Input:** "Document `pkg/sandbox/`"

**Steps:**
1. `ls pkg/sandbox/` → `docker.go, provider.go, wasm.go`
2. `grep "func" pkg/sandbox/provider.go` → `Execute(ctx, code, env) (string, error)`, `Close() error`
3. `cat pkg/sandbox/docker.go | head -80` → read config struct
4. Draft page with: package overview, `Provider` interface, two implementations, code example
5. Run verification checklist
6. Commit

**Time saved:** ~70% compared to writing from memory and then fixing inaccuracies after user feedback.
