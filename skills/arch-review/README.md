# arch-review

Review architecture decisions before they become bugs.

## Why

Most production disasters start as "we'll fix it later" decisions. arch-review is the explicit "later" — a structured review across five lenses (coupling, cohesion, failure modes, security, scalability) that catches the issues before they're load-bearing.

## Install

```bash
clawhub install arch-review
```

## Quick start

```
Use arch-review on the new payment flow.
```

The skill produces a Markdown review with severity-tagged findings and recommended actions.

See `SKILL.md` for the full five-lens methodology, severity scale, and common-findings library.
