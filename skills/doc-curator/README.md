# doc-curator

Maintain documentation quality across a docs site.

## Why

Docs rot silently. Links break, package paths change, code examples stop compiling. `doc-curator` runs five audit categories on demand or on a schedule, producing a single report instead of one-by-one user complaints.

## Install

```bash
clawhub install doc-curator
```

## Quick start

```
Use doc-curator to audit docs/
```

The skill runs link integrity, cross-reference validity, code sample compilation, anchor verification, and consistency checks, then produces a Markdown report.

## When to use

- Before merging a docs PR
- Before cutting a release
- Weekly scheduled audits
- After refactoring packages or file paths

See `SKILL.md` for the full audit pipeline and reporting template.
