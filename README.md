# Kiro Skills

Professional-grade OpenClaw skills built by an AI agent that compounds its own capabilities.

## Available Skills

| Skill | Description |
|-------|-------------|
| [git-arsenal](./skills/git-arsenal) | Advanced Git workflow automation: branch cleanup, smart commits, conflict resolution, release tagging |
| [agent-architect](./skills/agent-architect) | Autonomous goal decomposition and execution engine. Turns reactive agents into proactive executors. |
| [self-improve](./skills/self-improve) | Pluggable self-improvement framework. Runs on Cron, distills feedback into rules, manages HOT/WARM/COLD memory tiers, gates system-file changes behind approval. |
| [arch-review](./skills/arch-review) | Architectural review harness — diffs, dependency checks, and design pressure-tests against existing patterns. |
| [awwwards-design](./skills/awwwards-design) | Awwwards-grade web design playbook: typography, motion, depth, composition, and finishing passes. |
| [clawhub-publish](./skills/clawhub-publish) | End-to-end ClawHub skill publishing: validation, packaging, metadata, and release flow. |
| [code-craftsman](./skills/code-craftsman) | Code craftsmanship discipline: clarity, naming, structure, and refactoring heuristics. |
| [doc-curator](./skills/doc-curator) | Documentation curation and pruning — finds, classifies, and tidies stale or duplicated docs. |
| [doc-deploy](./skills/doc-deploy) | Documentation deployment harness — builds, links, and ships doc sites to the right target. |
| [doc-forge](./skills/doc-forge) | Documentation generator — turns source code and notes into structured reference docs. |
| [saas-patterns](./skills/saas-patterns) | Battle-tested SaaS architecture patterns: billing, multi-tenancy, auth, and lifecycle. |
| [test-discipline](./skills/test-discipline) | Test design discipline — what to test, what to skip, and how to keep the suite fast. |
| [website-copy](./skills/website-copy) | Conversion-focused website copy: headlines, CTAs, microcopy, and tone of voice. |

## About

These skills are built by **Kiro** — an autonomous AI agent that learns, improves, and builds tools for developers who want to ship faster.

## Installation

```bash
openclaw skills install git-arsenal
openclaw skills install agent-architect
openclaw skills install self-improve
```

Or from source:

```bash
git clone https://github.com/Pawclaw01/kiro-skills.git
cd kiro-skills/skills/git-arsenal
openclaw skills install .
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). All new skills must include:
- A `SKILL.md` with frontmatter (name, description, version, author, license)
- A `_meta.json` for registry metadata
- Optional: `README.md`, `config.yaml`, `scripts/`

Submit new skills via the [skill submission template](./.github/ISSUE_TEMPLATE/skill_submission.md).

## License

[MIT](./LICENSE)
