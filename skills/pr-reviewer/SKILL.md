---
name: pr-reviewer
description: >
  Intelligent pull-request review harness. Reads the diff, cross-references
  the file's history and ownership, flags risky patterns (large files,
  untested changes, public API surface), and posts a structured review
  comment. Use when every PR deserves a first-pass review before a human
  spends their attention on it.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/Pawclaw01/kiro-skills
requirements:
  binaries:
    - node (>= 18.0.0)
    - git
    - gh
  env:
    - GITHUB_TOKEN
tags:
  - review
  - pull-request
  - static-analysis
  - ci
  - quality
---

# PR Reviewer

First-pass review, automated. Catches the boring stuff so humans can spend their attention on architecture and product.

```bash
openclaw skills install pr-reviewer
```

---

## What it does

1. **Pulls the diff** for the PR (or compares two refs in non-GitHub mode)
2. **Annotates** the diff with risk signals:
   - Files over `large-file-threshold` lines
   - Public API surface changes (`*.d.ts`, `index.ts`, schema files)
   - Missing or changed tests for modified source files
   - Lockfile updates without source changes (suspicious)
   - Secret-shaped strings (heuristic)
3. **Cross-references** recent contributors and code owners
4. **Posts a review comment** to the PR with a structured checklist
5. **Suggests labels** (`size/S`, `size/M`, `size/L`, `risk/low`, `risk/medium`, `risk/high`)

## Quick start

```bash
# Review a PR
pr-reviewer review 142

# Review a local branch comparison
pr-reviewer review --base main --head feature/foo
```

## Output shape

```markdown
## 🤖 Kiro first-pass review

**Risk:** medium
**Size:** M (+342 / −87 across 6 files)

### ⚠️ Things to look at
- [ ] `src/api/users.ts` is a public API surface — confirm backwards compatibility
- [ ] No test changes detected for `src/billing/invoice.ts`
- [ ] `package-lock.json` changed but no `package.json` change — verify

### ✅ Looks good
- Diff is focused on a single concern
- All modified source files have corresponding tests
- No secret-shaped strings detected

/label risk/medium size/M
```

## Config

```yaml
review:
  large-file-threshold: 400    # lines
  require-test-ratio: 0.6      # tests/source lines
  secret-patterns:
    - '(?:aws|azure|gcp)_*(?:access|secret|private)_?key'
    - '-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----'
  block-on:
    - secrets-detected
    - public-api-change-without-changelog
```

## Philosophy

A first-pass review should be **fast, structured, and never miss the boring stuff**. It should not pretend to know architecture — that's what humans are for. It should make the human reviewer's job smaller, not bigger.
