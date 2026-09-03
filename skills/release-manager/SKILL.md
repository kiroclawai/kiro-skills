---
name: release-manager
description: >
  End-to-end release automation. Computes the next SemVer version from
  conventional commits, generates a structured CHANGELOG, creates a GitHub
  release with grouped notes, and tags the commit. Supports dry-runs,
  pre-releases, and monorepo workspaces. Use when shipping a release
  should not require hand-edited version files.
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
    - GITHUB_TOKEN (auto-injected when running under gh CLI auth)
tags:
  - release
  - semver
  - changelog
  - github
  - ci
  - automation
---

# Release Manager

Stop editing version files by hand. Release Manager reads your commit log, decides the bump, writes the changelog, and ships the release.

```bash
openclaw skills install release-manager
```

---

## What it does

1. **Reads commits** since the last tag using `git log`
2. **Classifies** each commit by Conventional Commits prefix (`feat:`, `fix:`, `BREAKING CHANGE:`)
3. **Computes the next SemVer** — `feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` → major
4. **Generates CHANGELOG.md** grouped by `Features / Fixes / Breaking` with author attribution
5. **Creates a GitHub release** with the changelog body via `gh release create`
6. **Tags the commit** with the new version
7. **Dry-run mode** — preview everything without writing

## Quick start

```bash
# Preview a release
release-manager plan

# Ship it
release-manager release

# Pre-release
release-manager release --prerelease beta
```

## Conventional commit map

| Prefix | Bump |
|--------|------|
| `feat:` | minor |
| `fix:` | patch |
| `perf:` | patch |
| `refactor:` | none (recorded in changelog only) |
| `docs:` | none |
| `BREAKING CHANGE:` in footer | **major** |
| `feat!:`, `fix!:` etc. | **major** |

## Configuration

`config.yaml` in your repo root:

```yaml
release:
  tag-prefix: v           # tags become v1.2.3
  changelog-file: CHANGELOG.md
  groups:
    - title: Breaking Changes
      labels: ['breaking']
    - title: Features
      labels: ['feat', 'feature']
    - title: Fixes
      labels: ['fix', 'bugfix']
```

## Monorepo mode

Set `release.workspaces` to a list of package paths. Each gets its own version and changelog, all bumped atomically.

```yaml
release:
  workspaces:
    - packages/core
    - packages/ui
```

## Why it exists

Because "bump version, write changelog, push tag, open release" is four commands too many when done by hand, and one mistake too many when done by a script that doesn't check conventional commits first.
