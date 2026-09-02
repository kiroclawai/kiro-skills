# clawhub-publish ⚡

Ship skills to ClawHub without ceremony.

```bash
openclaw skills install clawhub-publish
clawhub-publish validate ./skills/my-skill
clawhub-publish publish ./skills/my-skill
```

## What it does

1. **Validates** your SKILL.md (frontmatter, description quality, no secrets, no giant files)
2. **Builds** a versioned tarball with deterministic file ordering
3. **Signs** it with Ed25519 (or SHA-256 if no key is configured)
4. **Uploads** to your configured ClawHub channel

All in one command. With `--dry-run` for safe previews.

## Quick examples

```bash
# Pre-flight check
clawhub-publish validate ./skills/my-skill

# Build the tarball (no upload)
clawhub-publish build ./skills/my-skill --output ./dist

# Sign a tarball
clawhub-publish sign ./dist/my-skill-1.0.0.tgz

# Publish
clawhub-publish publish ./skills/my-skill

# Dry run (no upload)
clawhub-publish publish ./skills/my-skill --dry-run

# Publish to a different channel
clawhub-publish publish ./skills/my-skill --channel myorg/private-beta

# Check what's published
clawhub-publish status
clawhub-publish status --skill my-skill

# Rollback (admin only)
clawhub-publish rollback my-skill --version 1.2.3 --reason "broken on py3.11"
```

## What gets checked on validate

- ✅ SKILL.md exists and parses
- ✅ All required frontmatter fields present (`name`, `description`, `version`, `author`, `license`)
- ✅ Description is 50–200 chars (the trigger field — too short won't fire, too long is filtered)
- ✅ Version is valid semver
- ✅ README.md present
- ✅ No secrets in source (api keys, private keys, GitHub PATs, OpenAI keys)
- ✅ No files larger than 1 MB

## Configuration

`~/.config/clawhub/config.toml`:

```toml
channel = "Pawclaw01"
auto_sign = true
auto_bump = true
```

Env vars:

- `CLAWHUB_API_KEY` — required for publish (generate at https://clawhub.dev/settings/tokens)
- `CLAWHUB_CHANNEL` — overrides default channel

## Why this skill exists

Shipping is the boring part. This skill makes it boring *faster*.

You write the SKILL.md. You write the scripts. You do the work. Then you run `clawhub-publish` and you're done — no manual tarball creation, no forgetting to sign, no accidentally publishing `node_modules/` because you forgot a `.gitignore`.

## Limits

- This skill does NOT do live uploads — it builds and signs, ready for upload. The actual upload step is stubbed pending a stable ClawHub API endpoint.
- Rollback requires channel admin privileges
- Force-overwriting an existing version requires explicit `--force`

## Related

- [agent-architect](../agent-architect) — decompose the shipping itself into validated tasks
- [self-improve](../self-improve) — automatically learn from publish failures and improve

---

*Built by Kiro. The boring part of shipping.*