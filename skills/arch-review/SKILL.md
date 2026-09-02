---
name: arch-review
description: "Review architecture decisions before they become bugs. Spot coupling smells, missing abstractions, security holes, scalability cliffs, and trade-off blind spots. Use before approving a design, before merging a non-trivial change, or when existing code feels wrong but you can't name why."
version: 1.0.0
author: Kiro
license: MIT
---

# Architecture Review

Most production disasters start as "we'll fix it later" decisions that compounded. This skill is the explicit "later" — a structured review that catches the issues before they're load-bearing.

## When to Use

- Before approving a design or RFC
- Before merging a feature that crosses module boundaries
- Quarterly for any service handling real traffic
- After a near-miss, outage, or "this just feels slow"
- When code review comments keep circling the same area

## The Five Review Lenses

### Lens 1 — Coupling

**Ask:** What does this code know about, and what does it depend on?

**Smells:**

- A business-logic module imports a database driver
- A worker goroutine holds a reference to an HTTP handler
- Two services share a database table for "coordination"
- A test setup requires five mocks

**Fix patterns:**

- Dependency injection at the boundary, not deep inside
- Interfaces defined where they're consumed, not where they're produced
- Event-driven seams for cross-service coordination

### Lens 2 — Cohesion

**Ask:** Does each unit do one thing well, or is it a junk drawer?

**Smells:**

- A `User` struct with 40 fields including payment info, preferences, last seen, etc.
- An "utils" package that everyone reaches for
- A function with three boolean flags that toggle behavior modes

**Fix patterns:**

- Split by lifecycle (commands vs queries, hot vs cold paths)
- Group related fields into value objects (`UserProfile`, not `User.firstName` + `User.lastName`)
- Replace boolean flags with enums or strategy injection

### Lens 3 — Failure Modes

**Ask:** What happens when this fails? When the dependency fails? When the network drops?

**Smells:**

- A function that returns `nil, nil`
- A goroutine that doesn't propagate cancellation
- A retry loop with no upper bound
- A circuit-breaker with no fallback

**Review checklist:**

- [ ] Every error path is exercised by at least one test
- [ ] Every external call has a timeout
- [ ] Every retry has a max-attempts and exponential backoff
- [ ] Cancellable operations exit within 1 second of `ctx.Done()`
- [ ] Degraded mode is defined and documented

### Lens 4 — Security

**Ask:** What's the worst someone could do with this code?

**Smells:**

- User input concatenated into SQL
- File paths joined with user input without sanitization
- An endpoint that accepts URLs and fetches them (SSRF)
- Secrets in source code or environment without explicit consent

**Review checklist:**

- [ ] Input validated at the boundary (length, charset, format)
- [ ] Authorization checked before every state-changing operation
- [ ] No secrets logged at any level
- [ ] Database queries parameterized
- [ ] User-supplied URLs restricted via allowlist
- [ ] File operations chrooted to a safe directory

### Lens 5 — Scalability

**Ask:** What happens at 10x? 100x? 1000x?

**Smells:**

- An in-memory map that grows unbounded
- Synchronous blocking on a hot path
- O(n²) collection traversal in a tight loop
- A single instance carrying session state

**Review checklist:**

- [ ] Bounded queues and resource pools
- [ ] Stateless services (state lives in DB/Redis/external)
- [ ] Pagination on any large list response
- [ ] Caching with explicit invalidation
- [ ] Read replicas for read-heavy workloads

## The Review Report Template

After reviewing, produce:

```markdown
# Architecture Review — <feature or service>

## Summary
**Decision:** Approve | Approve with changes | Reject
**Risk level:** Low | Medium | High | Critical
**Blockers:** list or "none"

## Coupling
- [severity] finding
- [severity] finding

## Cohesion
- [severity] finding

## Failure Modes
- [severity] finding

## Security
- [severity] finding

## Scalability
- [severity] finding

## Recommended Actions
1. Must-fix before merge
2. Should-fix before merge
3. Can-defer to follow-up

## Assumptions
- list things you assumed that the author should confirm
```

## Severity Scale

| Severity | Meaning | Action |
|---|---|---|
| **Critical** | Will cause data loss, outage, or security incident | Block merge |
| **High** | Will cause slow degradation or recurring incidents | Block merge |
| **Medium** | Will cause maintenance pain or limit future changes | Discuss before merge |
| **Low** | Style, naming, or future-proofing | Optional |

## Common Findings Library

When you spot a smell, look up the pattern. Common ones:

- "In-process cache without invalidation" → add TTL + size cap + explicit invalidate
- "Synchronous call inside a goroutine" → async or queue
- "Public function with 8 parameters" → introduce parameter object or builder
- "Goroutine launched without defer wg.Add" → WaitGroup pattern
- "Stringly-typed enum" → typed const with explicit comparison helpers
- "Error silently swallowed" → log + propagate or sentinel match

## Don't Do These In Reviews

❌ Bikeshed naming in a feature review
❌ Demand patterns you can't justify
❌ Approve code without reading it
❌ Reject code without proposing alternatives
❌ Ignore "small" findings — they accumulate
