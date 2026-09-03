---
name: skill-forge
description: >
  Meta-skill for creating new OpenClaw skills. Scaffolds a complete skill
  directory with validated SKILL.md frontmatter, _meta.json, README.md
  template, and pre-flight checks for naming, scope creep, and trigger
  phrase clarity. Use when an agent needs a new capability that none of
  the existing skills cover.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/kiroclawai/kiro-skills
requirements:
  binaries:
    - node (>= 18.0.0)
  env: []
tags:
  - meta
  - scaffolding
  - skill-creation
  - automation
---

# Skill Forge

Make new skills the right way, fast. Six files, validated frontmatter, zero boilerplate drift.

```bash
openclaw skills install skill-forge
```

---

## What it does

1. **Prompts for skill metadata** — name, description, version, author, license, repo, runtime, requirements, tags
2. **Scaffolds the directory** with the right file layout
3. **Validates frontmatter** against the OpenClaw schema before writing
4. **Checks name uniqueness** against the local skills registry
5. **Warns on scope creep** — descriptions that try to do too much trigger a "split this skill" prompt
6. **Checks trigger phrase quality** — descriptions with vague verbs ("useful for many things") are rejected
7. **Generates README.md** from a template populated with the skill's metadata
8. **Pre-fills a smoke-test command** so the skill can be installed and run end-to-end before publish

## Quick start

```bash
# Interactive
skill-forge new

# Non-interactive (CI-friendly)
skill-forge new --name api-tester \
  --description "REST API contract testing with snapshot diffs and OpenAPI validation" \
  --runtime node --tags "api,testing,contracts"
```

## File layout produced

```
skills/api-tester/
├── SKILL.md           # frontmatter + body
├── _meta.json         # registry metadata
├── README.md          # human install + usage
├── config.yaml        # optional defaults
└── scripts/           # placeholder for runnable code
    └── example.sh
```

## Validation rules

| Rule | Why |
|------|-----|
| `name` matches `^[a-z][a-z0-9-]*$` | directory name + registry id |
| `description` ≥ 40 chars | "useful for many things" triggers nothing |
| `description` ≤ 200 chars | fit in registry listings |
| `version` is semver | publish pipeline requires it |
| `requirements.binaries` is array | consistent shape |
| `tags` 3-8 items | discoverability without noise |

## Anti-patterns caught

- **Too-broad description** — "general-purpose utility for various tasks"
- **Hidden dependencies** — binaries listed under `requirements` must be checked
- **Destructive defaults** — anything that writes/touches user data must declare confirmation
- **Bundled secrets** — refuses to scaffold a skill whose config example contains a credential

## Philosophy

Every skill should be one focused capability with a clear trigger. If you can't write a one-line description that names *when* to use it, the skill is doing too much.
