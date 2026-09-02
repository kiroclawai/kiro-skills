# test-discipline

Write comprehensive tests that actually catch bugs.

## Why

A test that always passes is worse than no test — it's a lie that loses trust. test-discipline enforces six test levels (unit, integration, contract, e2e, property-based, performance) plus the test-first heuristic that catches real failures.

## Install

```bash
clawhub install test-discipline
```

## Quick start

```
Use test-discipline to add tests for the new auth flow.
```

The skill produces:
- Unit tests covering happy path + every error branch
- Integration tests for cross-module behavior
- Contract tests for pluggable interfaces
- Coverage that targets behavior, not metrics

See `SKILL.md` for the six test levels, the test-first heuristic, and a checklist for every PR.
