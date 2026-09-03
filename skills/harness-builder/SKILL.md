---
name: harness-builder
description: >
  GitHub Actions harness generator. Given a project's stack (Node, Python,
  Go, Rust), produces a complete CI/CD harness: lint, test, build, cache,
  matrix, release, security scanning, and dependency review. Idempotent —
  safe to re-run on existing workflows.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/Pawclaw01/kiro-skills
requirements:
  binaries:
    - node (>= 18.0.0)
  env: []
tags:
  - ci
  - github-actions
  - harness
  - devops
  - automation
---

# Harness Builder

Stop hand-rolling GitHub Actions. Point Harness Builder at a repo, tell it the stack, and it produces a complete CI/CD harness.

```bash
openclaw skills install harness-builder
```

---

## What it does

Detects project stack from manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, etc.) and generates:

| Workflow | What it does |
|----------|--------------|
| `ci.yml` | Lint + test + build, matrix by OS and version, dependency cache |
| `release.yml` | Tagged releases, build artifacts, publish (npm/pypi/cargo) |
| `codeql.yml` | GitHub-native security scanning |
| `dependabot.yml` | Weekly dependency update PRs, grouped by ecosystem |
| `scorecard.yml` | OpenSSF Scorecard supply-chain checks |
| `labeler.yml` | Auto-label PRs by file path |
| `stale.yml` | Mark stale issues / PRs after 60 days |

## Quick start

```bash
# Generate all workflows for the current repo
harness-builder generate

# Just CI
harness-builder generate --only ci

# Dry-run preview
harness-builder generate --dry-run
```

## Detection rules

| Stack signal | Workflows generated |
|--------------|---------------------|
| `package.json` with `"build"` | ci, release, dependabot, codeql, labeler |
| `pyproject.toml` or `setup.py` | ci (Python matrix), release (pypi), dependabot, codeql |
| `Cargo.toml` | ci (Rust stable), release (cargo), dependabot, codeql |
| `go.mod` | ci (Go matrix), release, dependabot, codeql |
| `Dockerfile` | ci (container build), release (image push) |

## Config

```yaml
harness:
  node-versions: [18, 20, 22]
  python-versions: ['3.11', '3.12']
  os-matrix: [ubuntu-latest, macos-latest]
  cache: true
  codeql: true
  dependabot:
    schedule: weekly
    grouped: true
```

## Idempotency

Re-running `harness-builder generate` on a repo with existing workflows will:
- Update existing workflows if the *managed* header is present
- Leave custom workflows untouched
- Print a diff for any changes before writing

## Philosophy

A CI harness is infrastructure, not product code. It should be generated, reviewed once, and trusted. Hand-editing generated YAML is a smell.
