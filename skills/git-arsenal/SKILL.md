---
name: git-arsenal
description: "Advanced Git workflow automation: interactive branch cleanup, smart commit messages, conflict resolution assistance, release tagging, and changelog generation. Use when managing complex git operations, preparing releases, or cleaning up repositories."
version: 1.0.0
author: Kiro
license: MIT
---

# Git Arsenal

Professional-grade Git workflow automation. Not git basics — the stuff you actually need.

## When to Use

- **Branch cleanup** — Interactive cleanup of merged/stale branches
- **Smart commits** — Generate conventional commit messages from diff analysis
- **Release prep** — Tag, changelog, and release notes in one command
- **Conflict assist** — AI-powered merge conflict resolution suggestions
- **Repo health** — Audit repo for issues (large files, secrets, broken refs)

## Commands

### git-arsenal clean

Interactive branch cleanup with safety checks.

```bash
# Preview what would be deleted
git-arsenal clean --dry-run

# Clean merged branches (safe)
git-arsenal clean --merged

# Clean stale branches (not updated in 30+ days)
git-arsenal clean --stale --older-than 30d

# Force clean specific pattern
git-arsenal clean --pattern "feature/*" --force
```

**Safety features:**
- Never deletes the branch you're on
- Checks for unpushed commits
- Confirms before deletion
- Maintains cleanup log

### git-arsenal commit

Generate conventional commit messages from staged changes.

```bash
# Analyze staged changes and generate message
git-arsenal commit

# Generate and commit in one step
git-arsenal commit --execute

# Specify commit type
git-arsenal commit --type feat --scope api
```

**Output format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

### git-arsenal release

Prepare a release with tag, changelog, and notes.

```bash
# Create patch release (0.0.x)
git-arsenal release patch

# Create minor release (0.x.0)
git-arsenal release minor

# Create major release (x.0.0)
git-arsenal release major

# Preview without creating
git-arsenal release patch --dry-run
```

**What it does:**
1. Analyzes commits since last tag
2. Generates changelog
3. Creates annotated tag
4. Generates release notes
5. Optionally pushes tag

### git-arsenal conflicts

AI-assisted merge conflict resolution.

```bash
# Scan for conflicts and suggest resolutions
git-arsenal conflicts

# Apply suggested resolution
git-arsenal conflicts --apply

# Choose resolution strategy
git-arsenal conflicts --strategy ours|theirs|merge
```

**Resolution suggestions:**
- Analyzes both sides of conflict
- Suggests semantically correct merge
- Explains reasoning
- Preserves both changes when appropriate

### git-arsenal doctor

Audit repository health.

```bash
# Run all checks
git-arsenal doctor

# Fix auto-fixable issues
git-arsenal doctor --fix
```

**Checks:**
- Large files (>1MB)
- Secrets/credentials in history
- Broken refs
- Unoptimized pack files
- Stale remote branches
- Missing .gitignore entries

## Workflow Example

```bash
# Start feature branch
git checkout -b feature/auth

# ... make changes ...

# Generate smart commit
git-arsenal commit --execute

# ... more work, merge main, resolve conflicts ...

# Get help with conflicts
git-arsenal conflicts

# Finish feature, merge to main

# Prepare release
git-arsenal release minor

# Clean up merged branches
git-arsenal clean --merged
```

## Installation

```bash
# Requires git 2.0+
# No additional dependencies

# Add to PATH
export PATH="$PATH:/path/to/git-arsenal"
```

## Configuration

Create `.gitarsenal.yaml` in repo root:

```yaml
clean:
  protected:
    - main
    - master
    - production
  stale_days: 30

commit:
  max_subject_length: 72
  sign_off: true

release:
  changelog_file: CHANGELOG.md
  push_tag: true
```

## Notes

- All destructive operations require confirmation
- Dry-run available for preview
- Logs stored in `.git/git-arsenal.log`
- Works with any git remote (GitHub, GitLab, Bitbucket)
