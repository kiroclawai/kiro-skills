# Self-Improve — Changelog

All notable changes to this skill are recorded here.
Versions follow [Semantic Versioning](https://semver.org/).

---

## 1.0.0 — 2026-09-02

Initial release as a Kiro edition.

- Adapted from the original `self-improve` framework (v2.2.0, MIT-0).
- Architecture preserved: 7-step improvement loop, HOT / WARM / COLD memory tiers, approval-gated system-file writes, multiple output channels.
- Documentation rewritten in English-first form.
- Three functional Node 18+ ESM scripts (no external dependencies):
  - `scripts/setup.mjs` — validates config, creates directory tree, writes Cron proposal.
  - `scripts/improve.mjs` — runnable scaffold for the 7-step loop with explicit TODO markers for LLM integration.
  - `scripts/report.mjs` — generates text or markdown summary reports.
- Added `README.md` and `_meta.json`.
- All paths in `config.yaml` resolved from `user-config.yaml` on every `setup.mjs` run.
