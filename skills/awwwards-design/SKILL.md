---
name: awwwards-design
description: "Design websites at Awwwards-winner quality. Typography, motion, color, spacing, and micro-interaction craft that separates portfolio-tier work from template-tier work. Use when designing a landing page, marketing site, or product UI that needs to feel premium."
version: 1.0.0
author: Kiro
license: MIT
---

# Awwwards Design

Awwwards winners share a small number of habits. This skill encodes them so you can apply them without the years.

## When to Use

- Designing a landing page, marketing site, or product hero
- Rewriting an existing UI that "looks fine but doesn't feel premium"
- Preparing a portfolio piece, conference talk page, or product launch
- Building any surface where first impressions matter
- When the user explicitly says "make it beautiful" or "make it memorable"

## The Eight Design Disciplines

### 1. Typography Is the Whole Game

**Pick a typographic scale and stick to it.**

| Token | Use | Size |
|---|---|---|
| `display` | Hero headlines | clamp(3rem, 8vw, 7rem) |
| `h1` | Page titles | clamp(2.25rem, 5vw, 4rem) |
| `h2` | Section titles | clamp(1.75rem, 3vw, 2.5rem) |
| `h3` | Card titles | 1.25rem |
| `body` | Default | 1rem |
| `small` | Captions | 0.8125rem |
| `mono` | Code, tags | 0.875rem |

**Letter-spacing is not decoration.** Tight on display, neutral on body, slightly open on uppercase labels.

```css
/* Display */
font-size: clamp(3rem, 8vw, 7rem);
font-weight: 600;
letter-spacing: -0.04em;
line-height: 0.95;

/* Body */
font-size: 1rem;
line-height: 1.6;
letter-spacing: -0.011em;

/* Uppercase label */
font-size: 0.75rem;
font-weight: 500;
letter-spacing: 0.08em;
text-transform: uppercase;
```

**Two font families max.** A serif/sans pairing or a single sans with weight contrast. No three-font systems.

### 2. Color Is Restraint

**The 60-30-10 rule:**
- 60% neutral (background, surface)
- 30% secondary text/border
- 10% accent (one color, used sparingly)

**Define semantic tokens, not hex codes:**

```css
:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --text: #171717;
  --text-muted: #525252;
  --border: #e5e5e5;
  --accent: #000000; /* or one bold color */
}

.dark {
  --bg: #0a0a0a;
  --surface: #171717;
  --text: #fafafa;
  --text-muted: #a3a3a3;
  --border: #262626;
  --accent: #ffffff;
}
```

**Contrast is non-negotiable.** WCAG AA minimum (4.5:1 for body, 3:1 for large text). Test with Stark or Polypane.

### 3. Spacing Is Rhythm

**Use a 4px scale.** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

**Generous whitespace is premium.** Most Awwwards winners have at least `py-32` (128px) between sections.

**The first fold should breathe.** Top padding ≥ 96px on desktop.

```tsx
<section className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20">
  {/* hero content */}
</section>
```

### 4. Motion Is Meaning

**Three rules:**
1. **Durations under 300ms** for micro-interactions (hover, focus, tap)
2. **Durations 300-700ms** for transitions (page changes, modal open)
3. **Durations over 700ms** only for cinematic moments (intro, hero)

**Easing curves carry meaning:**
- `ease-out` for entrances (things arriving)
- `ease-in` for exits (things leaving)
- `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard) for everything else
- Avoid `linear` for anything except progress indicators

**The 12 principle of motion: stagger.**

```css
.fade-in { animation: fadeIn 600ms cubic-bezier(0.4, 0, 0.2, 1) backwards; }
.slide-up { animation: slideUp 500ms cubic-bezier(0.4, 0, 0.2, 1) backwards; }

.stagger-1 { animation-delay: 100ms; }
.stagger-2 { animation-delay: 200ms; }
.stagger-3 { animation-delay: 300ms; }
```

**Reduced motion:** always provide a fallback.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. The Hover State Is the Soul

Most interactive elements live 90% of their life in a hover state. Design it first.

```css
.link {
  position: relative;
  color: var(--text);
  text-decoration: none;
}
.link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 1px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

The underline "draws in from the left on hover, draws out to the right on leave." This is the kind of detail that separates premium from template.

### 6. Imagery Is the Differentiator

**Custom over stock. Always.** A few options:

- **Geometric SVG patterns** — generated, simple, on-brand
- **Hand-drawn illustrations** — personality, warmth
- **Product photography** — when you have the product
- **Abstract gradient meshes** — modern, generative feel
- **Code-as-art** — show real output (terminal screenshots, generated output)

**Never:**
- Generic 3D renders from a free library
- Stock photos of people in suits
- The same SaaS-y gradient every startup uses
- Icon libraries beyond a single, chosen set

### 7. Layout Is a Choice

**Default to a grid, then break it once per page.**

- 12-column grid with 24px gutter
- Content in 8 of 12 columns, side gutters breathe
- Break the grid with: oversized headline that bleeds left, an image that overlaps two columns, a quote that fills 10 columns

**Asymmetric layouts feel premium.** Symmetric feels corporate.

```tsx
<main>
  <section className="grid grid-cols-12 gap-6">
    <div className="col-span-7 col-start-2">
      {/* main content - asymmetric: starts at col 2 */}
    </div>
    <aside className="col-span-3 col-start-10">
      {/* sidebar */}
    </aside>
  </section>
</main>
```

### 8. Performance Is Design

A 4-second page load is ugly no matter how it looks. Awwwards winners ship Lighthouse 95+.

**Targets:**
- First Contentful Paint < 1.0s
- Largest Contentful Paint < 1.5s
- Cumulative Layout Shift < 0.05
- Total page weight < 200 KB

**Practices:**
- System fonts when possible (zero load time)
- Subset custom fonts (`unicode-range: U+0020-007F`)
- `font-display: swap` always
- Inline critical CSS
- Lazy-load below-the-fold images
- Preconnect to required origins

## The Page Composition Template

Most Awwwards sites follow this rhythm:

```
1. HERO (full viewport)
   - Big typographic statement
   - One clear CTA
   - Optional: subtle ambient animation

2. SOCIAL PROOF STRIP
   - Logo bar, one-liner stats, or testimonial
   - Should fit in 1/4 of a viewport

3. THE PROBLEM / WHY
   - 2-3 sentences max
   - Use the user's pain words back to them

4. THE PRODUCT
   - 3-5 features, each with: title + 1 sentence + visual
   - Don't list all 30 features, lead with the 3 that matter

5. PROOF IN DETAIL
   - One detailed screenshot or video walkthrough
   - Captions that explain what's happening

6. PRICING OR NEXT STEP
   - 3 tiers max, one highlighted
   - CTA below the fold

7. FOOTER
   - Minimal: logo, links, copyright
   - Maybe one final CTA
```

## The "Premium" Checklist

Before declaring a design done:

- [ ] Letter-spacing is tuned at every size
- [ ] Line-height is 1.5-1.75 on body text
- [ ] Spacing follows a single 4px scale
- [ ] Color contrast passes WCAG AA
- [ ] Hover states have a deliberate transition
- [ ] Reduced-motion users aren't punished
- [ ] Mobile is a real design, not a shrunken desktop
- [ ] Dark and light themes both feel intentional
- [ ] Lighthouse score is 90+ on all categories
- [ ] No two sections feel identical
- [ ] There's one moment that surprises

## Anti-Patterns

❌ Three font families
❌ "Center everything" layout
❌ Hero with a stock photo of two people pointing at a screen
❌ Generic gradient (purple to pink to blue)
❌ "AI-powered, blazing-fast, enterprise-grade" copy
❌ Modal that opens before the user asks
❌ Animation on every interaction (animation fatigue)
❌ Same button style on 12 surfaces
❌ Mobile that hides content
❌ A grid that you can see through the design

## Reference Sites Worth Studying

- [linear.app](https://linear.app) — typography + restraint
- [rauno.me](https://rauno.me) — minimal motion
- [vercel.com](https://vercel.com) — typographic hierarchy
- [stripe.com](https://stripe.com) — gradient + content density
- [arc.net](https://arc.net) — color + product photography
- [rauchg.com](https://rauchg.com) — single-author voice
