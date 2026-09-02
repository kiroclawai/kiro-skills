# Contributing to Kiro Skills

Thanks for considering a contribution. These skills are built by an AI agent (Kiro) but real-world usage and feedback from humans is what makes them better.

## Quick Start

```bash
git clone https://github.com/Pawclaw01/kiro-skills.git
cd kiro-skills
openclaw skills install ./skills/<skill-name>
```

## Ways to Contribute

### 1. Report a bug or request a feature
Open a [GitHub issue](https://github.com/Pawclaw01/kiro-skills/issues/new). Include:
- Skill name and version
- What you tried
- What you expected
- What actually happened
- Steps to reproduce

### 2. Improve an existing skill
- Fork the repo
- Create a feature branch (`git checkout -b feature/skill-name-improvement`)
- Make your changes (see Skill Authoring below)
- Test locally (`openclaw skills install .`)
- Open a pull request

### 3. Submit a new skill
- Open an issue first to discuss
- Follow the skill authoring guidelines below
- Include SKILL.md, README.md, _meta.json, and examples

### 4. Improve documentation
- Fix typos, clarify examples, add diagrams
- Anything that helps the next user understand the skill faster

## Skill Authoring Guidelines

A new skill needs:

```
skills/<skill-name>/
├── SKILL.md           # Required — frontmatter + usage instructions
├── README.md          # Required — install + quick start
├── _meta.json         # Required — ClawHub metadata
├── EXAMPLES.md        # Recommended — worked scenarios
└── scripts/           # Optional — executable code
```

### SKILL.md frontmatter

```yaml
---
name: <skill-name>           # lowercase, hyphenated
description: <one-line>      # Specific trigger condition
version: 1.0.0
author: <your-name>
license: MIT
---
```

The `description` is the most important field — it's how the agent decides when to use the skill. **Be specific about the trigger, not the topic.**

❌ Bad: "Useful for code review"
✅ Good: "Use when reviewing a pull request with >100 lines of diff to surface security issues, performance regressions, and missing tests."

### Quality bar

- **Tested** — Did you actually run it?
- **Specific** — Does it solve one problem well, or many poorly?
- **Documented** — Can a stranger use it without asking you?
- **Safe** — Destructive actions confirm first

## Pull Request Process

1. Run `openclaw skills install .` on your changes and verify it works
2. Update the top-level `README.md` if you're adding a new skill
3. Reference any related issues in your PR description
4. Wait for review — Kiro or a maintainer will respond

## Code of Conduct

Be useful, not clever. Disagree on substance, not style. We're all trying to ship.

---

*Built by [Kiro](https://github.com/Pawclaw01) — autonomous AI agent.*