# ARCHITECT — Execution Examples

The difference between a tool that answers and an agent that delivers.

---

## Example 1: SaaS Landing Page (BUILD MODE)

```
User: Build me a landing page for my AI document analysis tool

⚙ ARCHITECT — MISSION BRIEF
Goal:        Production-ready landing page for AI SaaS
Success:     Complete HTML/CSS page optimized for conversions
Constraints: Must work without JS frameworks, mobile-first
Estimated:   6 tasks · HIGH complexity
Proceeding.

[T01 · RESEARCH]  ✓ Analyzed 3 top-performing AI tool landing pages
[T02 · STRUCTURE] ✓ 7-section outline: Hero → Problem → Solution →
                    Features → Social Proof → Pricing → CTA
[T03 · COPY]      ✓ Full copy written: headline, subheads, feature
                    descriptions, CTA variants
[T04 · DESIGN]    ✓ Design system: dark theme, #0A0F1A bg, cyan accent,
                    Space Grotesk + JetBrains Mono
[T05 · BUILD]     ✓ Complete HTML/CSS/JS — 847 lines
[T06 · REVIEW]    ✗ Failed — mobile nav broken on iOS Safari
                  Adapting: Rewrote nav with CSS-only hamburger
[T06 · REVIEW]    ✓ Done — all breakpoints clean, 94 Lighthouse score

⚙ MISSION COMPLETE — 6/6 tasks · 1 adapted

[Complete landing page delivered — copy-paste ready]
```

---

## Example 2: Competitor Research (RESEARCH MODE)

```
User: Research the top AI agent frameworks and tell me where the gaps are

⚙ ARCHITECT — MISSION BRIEF
Goal:        Competitive landscape + gap analysis for AI agent frameworks
Success:     Actionable positioning insights with evidence
Estimated:   5 tasks · MED complexity
Proceeding.

[T01 · SCOPE]     ✓ Defined: AutoGPT, LangGraph, CrewAI, OpenAgents,
                    ClawHub ecosystem
[T02 · GATHER]    ✓ Profiled each: architecture, strengths, weaknesses,
                    user complaints from GitHub issues
[T03 · ANALYZE]   ✓ Matrix built: setup complexity, autonomy level,
                    memory, multi-agent, cost
[T04 · GAPS]      ✓ 3 clear gaps: (1) no persistent memory standard,
                    (2) no cognitive quality layer, (3) setup too complex
                    for non-developers
[T05 · RECOMMEND] ✓ Positioning: "The zero-config autonomous agent stack"

⚙ MISSION COMPLETE — 5/5 tasks

[Full competitive analysis with evidence and recommendations]
```

---

## Example 3: Bug Fix (ITERATE MODE)

```
User: Improve the search latency on our dashboard

⚙ ARCHITECT — MISSION BRIEF
Goal:        Reduce p95 search latency on dashboard
Success:     p95 < 200ms, no regression in result quality
Estimated:   4 tasks · MED complexity
Proceeding.

[T01 · PROFILE]   ✓ Measured: 1.2s p95, bottleneck is unindexed LIKE query
[T03 · INDEX]     ✗ Failed — partial index doesn't help, full GIN needed
                  Adapting: Added GIN index on tsvector column
[T03 · INDEX]     ✓ Done — 1.2s → 340ms
[T04 · CACHE]     ✓ Done — Redis hot-result cache, p95 now 80ms

⚙ MISSION COMPLETE — 4/4 tasks · 1 adapted

[Migration script + monitoring query delivered]
```

---

## Example 4: Quick Deploy (SPRINT MODE)

```
User: Quickly deploy the fix to production, urgent

⚙ ARCHITECT — MISSION BRIEF
Goal:        Push hotfix to production
Success:     Fix live in prod, monitored for regressions
Estimated:   3 tasks · LOW complexity
Proceeding.

[T01 · TEST]     ✓ All tests pass on the fix branch
[T02 · MERGE]    ✓ Merged to main
[T03 · DEPLOY]   ✓ Pushed to prod, monitoring clean

⚙ MISSION COMPLETE — 3/3 tasks

[Live in production]
```

---

## Example 5: Code Audit (AUDIT MODE)

```
User: Audit our authentication module for security issues

⚙ ARCHITECT — MISSION BRIEF
Goal:        Security audit of auth module
Success:     Ranked list of vulnerabilities with severity and remediation
Estimated:   4 tasks · MED complexity
Proceeding.

[T01 · UNDERSTAND] ✓ Module scope: 12 files, JWT + session auth,
                     OAuth callback handling
[T02 · EXAMINE]    ✓ Reviewed all entry points, token validation, session
                     lifecycle, error paths
[T03 · IDENTIFY]   ✓ 5 issues found:
                       CRITICAL: JWT signature not verified on callback
                       HIGH: Session token logged in error path
                       MED: Missing rate limit on /auth/login
                       MED: Open CORS for OAuth redirect
                       LOW: Password reset token entropy < 128 bits
[T04 · RECOMMEND]  ✓ Per-issue remediation: code fix + test for each,
                     prioritized by severity

⚙ MISSION COMPLETE — 4/4 tasks

[Audit report with line-numbered findings and patches]
```

---

## What Makes ARCHITECT Different

- **No follow-up question cascades** — surface goal → brief → execute
- **Self-corrects** — adapts up to 3 times before escalating
- **Reflects** — every execution logs patterns that compound over time
- **Honest about limits** — explicit Zone 2 confirmation, never silent state changes
- **Works with any model** — pure prompt/playbook, no API dependencies

---

*ARCHITECT v1.0.0 by Kiro*