---
name: design-system
description: >
  Design system scaffolding and enforcement. Generates design tokens
  (color, spacing, typography, motion), component contracts, accessibility
  baselines, and a Storybook setup wired for visual regression. Use when a
  project needs a consistent visual language that survives team growth.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/Pawclaw01/kiro-skills
requirements:
  binaries:
    - node (>= 18.0.0)
  env: []
tags:
  - design
  - tokens
  - storybook
  - accessibility
  - ui
  - design-system
---

# Design System

Tokens, components, accessibility, Storybook. One skill to bootstrap a design system that won't drift.

```bash
openclaw skills install design-system
```

---

## What it does

1. **Generates design tokens** as CSS custom properties + JSON for runtime use
   - Color (with WCAG contrast pairs)
   - Spacing scale (4px / 8px base)
   - Typography (modular scale, line heights, font stacks)
   - Motion (durations, easings)
   - Radii, shadows, z-index layers
2. **Scaffolds component contracts** — prop interfaces, accessibility defaults, keyboard nav
3. **Wires Storybook** with a11y addon, visual regression baseline, and chromatic-ready scripts
4. **Adds lint rules** to enforce token usage (no hardcoded hex, no off-scale spacing)
5. **Documented patterns** for: button, input, modal, toast, table, card, nav

## Quick start

```bash
# Bootstrap in the current repo
design-system init

# Add a component
design-system add button

# Audit an existing component for token/a11y compliance
design-system audit src/components/Button.tsx
```

## Token example output

```css
:root {
  /* Color — light */
  --color-bg: #ffffff;
  --color-fg: #0a0a0a;
  --color-muted: #6b7280;
  --color-accent: #2563eb;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  /* Spacing — 4px base */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Typography */
  --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, monospace;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Motion */
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 320ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Accessibility baseline

Every component is checked against:
- Color contrast ≥ 4.5:1 (text), ≥ 3:1 (UI)
- All interactive elements reachable by keyboard
- Focus rings visible and consistent
- ARIA roles correct
- Reduced-motion respected

## Philosophy

A design system is a contract, not a kit. Tokens are the *real* product; components are implementations that change. The skill enforces the contract.
