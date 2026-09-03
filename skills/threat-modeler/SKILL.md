---
name: threat-modeler
description: >
  STRIDE-style threat modeling for new workflows. Before connecting a
  system to a credential, opening a network egress, or granting an agent
  a new capability, enumerates Spoofing / Tampering / Repudiation /
  Information Disclosure / Denial / Elevation threats and proposes
  mitigations. Use when "what could go wrong" hasn't been asked yet.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/kiroclawai/kiro-skills
requirements:
  binaries: []
  env: []
tags:
  - meta
  - security
  - threat-modeling
  - stride
  - safety
---

# Threat Modeler

Ask "what could go wrong" *before* you wire something up. Threat Modeler runs STRIDE on any proposed workflow that touches credentials, network, or capability boundaries.

```bash
openclaw skills install threat-modeler
```

---

## What it does

For a proposed workflow, produces a STRIDE matrix with concrete threats and mitigations. Designed to be run *before* the workflow is enabled.

```bash
threat-modeler model \
  --workflow "GitHub PAT for kiroclawai, used by agent via exec" \
  --assets "[credential,repos,git-history,secrets-store]" \
  --boundaries "[agent-runtime,host-shell,network-egress]"
```

## STRIDE categories

| Category | Question it answers |
|----------|---------------------|
| **S**poofing | Could someone impersonate the principal? |
| **T**ampering | Could the data/code be modified by an unauthorized party? |
| **R**epudiation | Could an action be performed without audit trail? |
| **I**nformation Disclosure | Could sensitive data leak? |
| **D**enial of Service | Could legitimate use be blocked? |
| **E**levation of Privilege | Could someone gain higher capabilities than intended? |

## Output shape

```markdown
## Threat Model: <workflow name>

**Assets:** credential, repos, git-history, secrets-store
**Boundaries:** agent-runtime, host-shell, network-egress

### S — Spoofing
- **T1**: A different GitHub PAT (e.g., for `Ecook14`) could be silently used
  instead of the intended `kiroclawai` PAT
  - *Mitigation*: Always verify `GET /user` before any write; bind token to
    expected account; refuse to push if account mismatch

### T — Tampering
- **T2**: A malicious package installed by `npm install` could modify
  build artifacts
  - *Mitigation*: Lockfile (`package-lock.json`) committed; CI uses `npm ci`;
    Dependabot for security updates

### R — Repudiation
- **T3**: A subagent could perform a destructive action and the parent
  agent could deny responsibility
  - *Mitigation*: All tool calls logged with session id; subagent outputs
    attributed; claim-checker enforces evidence on outbound claims

### I — Information Disclosure
- **T4**: PAT could leak into chat transcript, log file, or env snapshot
  - *Mitigation*: Use `secrets:request` masked entry; never print token;
    secrets system auto-injects env sentinel; `insecure-storage` flag off

### D — Denial of Service
- **T5**: A runaway subagent could exhaust tool budget
  - *Mitigation*: tool-budget-guardian caps subagent spend; spawn limit
    per session

### E — Elevation of Privilege
- **T6**: OAuth App registration could grant broader scopes than declared
  - *Mitigation*: Request minimal scopes only; review `X-OAuth-Scopes`
    header after auth
```

## Real-world catches

The morning this skill was written, the author wired up a PAT thinking it was for `kiroclawai` and only discovered after multiple subagent spawns that the token belonged to `Ecook14`. Threat Modeler would have flagged this as T1 (Spoofing) and required an explicit `GET /user` verification step before any operation.

## When to invoke

- Before storing a new secret in the secrets store
- Before configuring a network egress policy
- Before granting an agent a new tool or capability
- Before opening a webhook, callback URL, or auth flow
- Whenever the words "should be fine" appear in a plan

## Philosophy

Threat modeling is not paranoia; it's plumbing. The cheapest threat to mitigate is the one you imagined before it became a real one.
