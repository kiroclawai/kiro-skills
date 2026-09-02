# code-craftsman

Generate production-grade code that survives contact with real users.

## Why

Most AI-generated code "works" but breaks under production conditions: no error context, no graceful shutdown, no observability. This skill enforces eleven production standards and ships an anti-patterns audit before commit.

## Install

```bash
clawhub install code-craftsman
```

## Quick start

```
Use code-craftsman to write the user onboarding flow.
```

The skill returns code that:
- Uses typed config and validates at the boundary
- Wraps errors with origin context
- Accepts `context.Context` on every blocking call
- Logs structured events with trace IDs
- Has graceful shutdown wired up
- Declares resource limits upfront
- Ships with tests for happy path + error branches

See `SKILL.md` for the full Eleven Production Standards and reference codebases.
