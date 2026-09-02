---
name: doc-curator
description: "Maintain documentation quality across a docs site. Detect broken links, stale references, missing pages, dead anchors, and consistency drift. Use after docs changes, before releases, or on a recurring schedule."
version: 1.0.0
author: Kiro
license: MIT
---

# Doc Curator

Documentation ages fast. `doc-curator` runs scheduled and on-demand checks that catch rot before users do.

## When to Use

- After any doc changes, before merging
- Before cutting a release
- Weekly or monthly scheduled audits
- After renaming packages or restructuring repos
- When a user reports a 404 or broken example

## The Five Audit Categories

### 1. Link Integrity

Every internal link must resolve to a real file or anchor.

```bash
# Extract all internal links
grep -rohE '\]\([^)]+\)' docs/ src/app/docs/ 2>/dev/null | \
  grep -oE '\([^)]+\)' | \
  sed 's/^(//;s/)$//' | \
  grep -v '^http' | \
  grep -v '^mailto' | \
  sort -u > /tmp/internal-links.txt

# Verify each
while read link; do
  case "$link" in
    /*) path="public$link" ;;      # Next.js public
    \#*) path="docs/$CURRENT_PAGE$link" ;;
    *)   path="docs/$link" ;;
  esac
  [ -f "$path" ] || echo "BROKEN: $link (looked at $path)"
done < /tmp/internal-links.txt
```

### 2. Cross-Reference Validity

For docs that cite source code paths, verify the paths still exist:

```bash
# Extract pkg/, cmd/, internal/ references
grep -rohE 'pkg/[a-z][a-zA-Z_/]*' docs/ | sort -u > /tmp/pkg-refs.txt

while read ref; do
  [ -d "$ref" ] || echo "STALE: $ref no longer exists"
done < /tmp/pkg-refs.txt
```

### 3. Code Example Compilation

Sample-test that code blocks still compile:

```bash
# Extract all fenced code blocks with language hints
awk '/^```go$/,/^```$/' docs/**/*.md > /tmp/code-samples.go
cd /tmp && cat > go.mod <<EOF
module sample
go 1.22
EOF
go vet /tmp/code-samples.go 2>&1
```

For Python: extract and `python3 -m py_compile`.
For JSX/TSX: extract and `tsc --noEmit`.

### 4. Anchor Verification

For docs with `<a name="...">` anchors, ensure each anchor is referenced by at least one link, and that no link points to a non-existent anchor:

```bash
# Find declared anchors
grep -rohE '<a name="[^"]+"' docs/ | sed 's/<a name="//;s/"//' | sort -u > /tmp/anchors.txt

# Find referenced anchors
grep -rohE '\]\([^)]*#[^)]+\)' docs/ | grep -oE '#[^)]+' | sed 's/^#//' | sort -u > /tmp/ref-anchors.txt

# Orphan anchors (declared but never referenced)
comm -23 /tmp/anchors.txt /tmp/ref-anchors.txt
# Dangling references (referenced but never declared)
comm -13 /tmp/anchors.txt /tmp/ref-anchors.txt
```

### 5. Consistency Drift

Catch subtle inconsistencies that accumulate over time:

```bash
# Check for mixed casing in product names
grep -rohE '[Gg]ocrewwai|[Gg]ocrewWAI|[Gg]ocrew AI' docs/ | sort | uniq -c

# Verify table column consistency
for table in $(grep -l "^|" docs/*.md); do
  cols=$(grep "^|" "$table" | head -1 | tr -cd '|' | wc -c)
  echo "$table: $cols columns in header"
  # verify all rows match
done

# Find pages with no incoming links (orphans)
grep -rohE '\]\([^)]+\.md\)' docs/ | sort -u > /tmp/linked.txt
for f in docs/*.md; do
  base=$(basename "$f")
  grep -q "$base" /tmp/linked.txt || echo "ORPHAN: $f"
done
```

## Reporting

Run all five checks and produce a single report:

```markdown
# Documentation Audit Report
Date: YYYY-MM-DD

## Summary
- Total internal links: X
- Broken: Y
- Stale source refs: Z
- Code samples tested: N
- Orphan pages: M

## Broken Links
| Source | Target | Status |
|---|---|---|
| agents.md | pkg/sandbox/old | DELETED |

## Stale References
| Doc page | Referenced path | Status |
|---|---|---|
| custom-tools.md | pkg/tools/deprecated.go | DELETED |

## Orphan Pages
- [translations.md]
- [archive/2024.md]

## Code Sample Failures
- quickstart.md line 42: undefined: NewFoo

## Recommended Actions
1. Fix broken links: sed -i 's/old/new/g' docs/
2. Mark orphaned pages with `> [DEPRECATED]` banner
3. Update code samples or remove if obsolete
```

## Automation

For recurring audits, wire into a scheduled automation:

```yaml
# automations/doc-audit.yaml
schedule:
  kind: cron
  expr: "0 6 * * 1"   # every Monday at 06:00 UTC
payload:
  kind: agentTurn
  message: "Run doc-curator audit on docs/. Report any broken links, stale references, or orphan pages. File issues for any critical problems but do not auto-fix."
delivery:
  mode: announce
```

## Don't Auto-Fix Without Review

The audit should report problems, not silently rewrite docs. Why:

- A "broken" link might be intentional (documenting legacy behavior)
- A "stale" reference might be a planned rename in progress
- An "orphan" page might be a deliberate landing page

Always surface the report and let a human decide.
