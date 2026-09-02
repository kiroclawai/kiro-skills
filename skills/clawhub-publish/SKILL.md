---
name: clawhub-publish
description: >
  Publish an OpenClaw skill to ClawHub from the command line. Validates SKILL.md
  frontmatter, runs lint checks, generates a versioned tarball, signs it, and
  uploads via the configured channel. Use when shipping a new skill, releasing
  an update, or cutting a versioned release for an existing skill.
version: 1.0.0
author: Kiro
license: MIT
requirements:
  binaries: ["gh"]
  env: ["CLAWHUB_API_KEY", "CLAWHUB_CHANNEL"]
---

# clawhub-publish

One command from `git status` to "live on ClawHub." Validates, builds, signs, uploads.

## When to Use

- Shipping a new skill to your ClawHub channel
- Cutting a new version of an existing skill
- Pre-flight check before publishing (dry-run)

## When NOT to Use

- Publishing to npm, PyPI, or other package registries (use their CLIs)
- Distributing private / proprietary skills to specific users (use signed tarballs + manual distribution)
- One-off scripts (just share the file)

## Commands

### clawhub-publish validate

Check that the skill is ready to ship.

```bash
clawhub-publish validate ./skills/my-skill
```

**Checks:**
- SKILL.md exists and parses
- Frontmatter has required fields (name, description, version, author, license)
- Description is between 50–200 characters and specific about triggers
- Version is valid semver
- README.md exists
- `_meta.json` exists if ClawHub is configured to require it
- No secrets in source (`grep` for common patterns)
- LICENSE present (unless inheriting from repo)
- No large binary files (>1 MB)

**Exit codes:**
- 0 — clean
- 1 — validation errors (printed, fix and retry)
- 2 — critical issue (missing SKILL.md, invalid frontmatter)

### clawhub-publish build

Create a versioned tarball ready to upload.

```bash
# Build for the current skill directory
clawhub-publish build ./skills/my-skill

# Output: dist/my-skill-1.2.3.tgz
# Includes: SKILL.md, README.md, _meta.json, scripts/, examples/
# Excludes: .git, node_modules, __pycache__, *.pyc, .DS_Store
```

The tarball name uses the skill name and version from `_meta.json` or frontmatter. Both must agree.

### clawhub-publish sign

Generate a checksum signature for the tarball.

```bash
clawhub-publish sign ./dist/my-skill-1.2.3.tgz

# Output:
#   SHA-256: <hash>
#   Signature written to: ./dist/my-skill-1.2.3.tgz.sig
```

Uses Ed25519 key from `~/.config/clawhub/sign.key`. If the key doesn't exist, generates a new one and prints a one-time backup reminder.

### clawhub-publish publish

Validate, build, sign, and upload.

```bash
# Dry run
clawhub-publish publish ./skills/my-skill --dry-run

# Publish for real
clawhub-publish publish ./skills/my-skill

# Publish with channel override
clawhub-publish publish ./skills/my-skill --channel my-org/private-beta

# Skip validation (you've already validated)
clawhub-publish publish ./skills/my-skill --skip-validate

# Publish without signing (not recommended for production)
clawhub-publish publish ./skills/my-skill --no-sign
```

**Process:**
1. Validates (unless `--skip-validate`)
2. Bumps version (interactive prompt: patch / minor / major)
3. Builds tarball
4. Signs
5. Uploads to ClawHub
6. Prints public URL on success

**Safety:**
- Always shows the version bump before applying
- Always shows the channel before uploading
- Never overwrites an existing version (use `--force` for hotfixes)
- Asks for explicit `--yes` if publishing to a channel you don't administrate

### clawhub-publish status

Check what's currently published on your channel.

```bash
clawhub-publish status
clawhub-publish status --skill my-skill
```

Shows: published versions, current latest, downloads (if public), last update.

### clawhub-publish rollback

Unpublish a version (only for paid channels with admin rights).

```bash
clawhub-publish rollback my-skill --version 1.2.3
clawhub-publish rollback my-skill --version 1.2.3 --reason "broken on Python 3.11"
```

Logs the rollback in the channel audit trail.

## Configuration

`~/.config/clawhub/config.toml`:

```toml
# Default channel (organization or username)
channel = "Pawclaw01"

# API key for uploads
# Required env: CLAWHUB_API_KEY
# Generate at: https://clawhub.dev/settings/tokens

# Auto-sign on publish (recommended)
auto_sign = true

# Auto-bump version on missing version flag
auto_bump = true

# Pre-publish hook (run before upload)
pre_publish_hook = "npm test"

# Post-publish hook (run after success)
post_publish_hook = "echo 'Published!'"
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLAWHUB_API_KEY` | yes | API token for uploads |
| `CLAWHUB_CHANNEL` | no | Override default channel |
| `CLAWHUB_DRY_RUN` | no | Set to `1` for dry-run mode |

## Safety

- ✅ Always previews version bump and channel before uploading
- ✅ Requires `--force` to overwrite an existing version
- ✅ Validates SKILL.md before every publish
- ✅ Signs tarballs by default (Ed25519)
- ❌ Will not silently overwrite a published version
- ❌ Will not publish without explicit channel confirmation

## Notes

- Tarballs use the standard ClawHub format: `gzip` of `tar` with deterministic file ordering
- Signatures use Ed25519, public key registered with your channel
- Channel-level access controls determine who can install (public, members-only, paid)
- This skill is itself a ClawHub skill — install with `clawhub install clawhub-publish`

---

*Built by Kiro. The boring part of shipping.*