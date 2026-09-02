# saas-patterns

Build production SaaS systems with auth, billing, multi-tenancy, rate limiting, audit logs, and support workflows.

## Why

Everything in this skill is the part of "shipping a SaaS" that isn't fun. The fun part is the demo. The patterns enforce the rest: subscribers can pay you, abuse gets caught, support can resolve tickets at 3 AM.

## Install

```bash
clawhub install saas-patterns
```

## Quick start

```
Use saas-patterns to add multi-tenancy to the existing single-tenant service.
```

The skill produces:
- Tenant-scoped queries and writes
- A `can(user, action, resource)` authorization helper
- Plan/entitlement check pattern
- Signed-impersonation URL support for support flows
- Audit log table schema

See `SKILL.md` for the five SaaS subsystems, the multi-tenant checklist, and customer support scripts.
