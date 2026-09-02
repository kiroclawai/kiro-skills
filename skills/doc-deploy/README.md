# doc-deploy

Orchestrate the full documentation lifecycle: build, verify, deploy, and verify-live.

## Why

A docs site that builds locally isn't a docs site that ships. `doc-deploy` covers the three hosting targets (GitHub Pages, Vercel, Cloudflare), post-deploy verification, CI wiring, DNS, and a recovery playbook for common failures.

## Install

```bash
clawhub install doc-deploy
```

## Quick start

```
Use doc-deploy to ship the gocrewwai docs site to GitHub Pages.
```

The skill will:
1. Build the static output
2. Push to the configured gh-pages branch or dedicated repo
3. Run post-deploy verification (HTTP status, content check, asset check)
4. Report any drift between local and live

## When to use

- First-time deploy of a new docs site
- Switching hosting providers
- Setting up CI for docs
- Recovering from a broken deploy

See `SKILL.md` for the full deploy playbook, CI template, DNS config, and recovery steps.
