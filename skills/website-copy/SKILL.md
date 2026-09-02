---
name: website-copy
description: "Write high-converting, brand-consistent website copy. Headlines, subheadlines, body, CTAs, and microcopy that turns visitors into customers. Use when launching a product, redesigning a site, or rewriting copy that 'doesn't quite land.'"
version: 1.0.0
author: Kiro
license: MIT
---

# Website Copy

Every word on your site either earns its place or it gets ignored. This skill enforces the craft that turns "looks nice" into "makes money."

## When to Use

- Writing headlines for a hero section
- Rewriting copy that "doesn't quite land"
- Creating product pages, pricing pages, or feature descriptions
- Building email sequences, onboarding flows, or in-app copy
- Establishing brand voice for a new product
- Translating technical jargon into human language

## The Voice Triangle

Every page needs three registers:

| Register | Where | Example |
|---|---|---|
| **Bold** | Hero, headlines, CTAs | "Ship agents that don't wake you up." |
| **Clear** | Subheads, value props, body | "Type-safe AI orchestration for Go." |
| **Conversational** | Footer, about, support | "Built by a small team in [city]. Patches welcome." |

The mistake most sites make: **all bold** (marketing-y, not trustworthy) or **all clear** (forgettable, no personality). Alternate.

## The Headline Formula

A great headline does three things:

1. **Names the outcome** (what changes for the user)
2. **Implies effortlessness** (how easy it is)
3. **Creates specificity** (why this, not that)

### Templates that work

```
[Verb] [object] [without the bad thing].
```

> "Ship agents that don't wake you up."
> "Orchestrate AI crews without the orchestration tax."
> "Launch a SaaS without rebuilding billing."

```
[Outcome], not [cost].
```

> "Type-safe responses, not schema drift."
> "Goroutine parallelism, not GIL bottlenecks."

```
The [adjective] [category] for [audience].
```

> "The strict-typed orchestration framework for production Go."

### Headlines to never write

❌ "Welcome to the future of [category]" — vague
❌ "Revolutionary AI-powered [thing]" — buzzword
❌ "Your one-stop solution for [thing]" — salesy
❌ "[Verb] [noun] like never before" — empty

## The Subheadline Job

The subheadline expands on the headline without repeating it. It answers "yes, but what is it really?"

```tsx
<h1>Ship agents that don't wake you up.</h1>
<p className="subtle">
  Strictly-typed AI orchestration for Go. Type-safe responses,
  native goroutines, single-binary deploy.
</p>
```

**Three rules:**
1. Add specificity the headline lacked
2. Lead with the user's problem language
3. End with the differentiator

## The CTA Hierarchy

Every page has three CTAs, layered:

1. **Primary** — the conversion action (Start free, Get started, Buy)
2. **Secondary** — the lower-commitment alternative (Read docs, See examples)
3. **Tertiary** — passive (link in footer, contact email)

```tsx
<div className="flex gap-3">
  <a className="btn btn-primary">Start free</a>           {/* Primary */}
  <a className="btn btn-secondary">Read the docs</a>     {/* Secondary */}
</div>
```

**CTA copy rules:**

- **Start with a verb.** "Start free" not "Free signup."
- **Be specific about what happens next.** "Deploy to Vercel" not "Continue."
- **Match the commitment.** "Buy now" for paid, "Try free" for free trial.
- **Avoid anxiety words.** Don't say "Submit" — say what they're submitting.
- **One CTA per section.** Multiple CTAs compete and dilute.

## The Body Copy Pattern

For long-form sections, alternate:

```
[SECTION HEADER]
[2-3 sentences: the problem in user's words]

[VISUAL: product shot, diagram, or video]

[2-3 sentences: how you solve it, concretely]
[bullet list of 3-5 capabilities — short, parallel structure]

[CTA]
```

**Bullet lists use parallel structure:**

✅ "Type-safe responses. Native goroutines. Single-binary deploy."
❌ "You get type-safe responses. Goroutines are native. Deploys are single-binary."

## The Voice Audit

Before publishing, run this audit:

```bash
# 1. Buzzwords: kill them
grep -iE "(revolutionary|game-changing|cutting-edge|next-gen|state-of-the-art|world-class|industry-leading|robust|leverage|seamless|empower|holistic)" *.md

# 2. Weasel words: kill them too
grep -iE "(very|really|quite|just|simply|merely|basically|essentially|literally)" *.md

# 3. Passive voice: convert to active
grep -E "(was|were|been|being|is|are|be) [a-z]+ed by" *.md

# 4. Jargon the user doesn't use
grep -iE "(synergy|paradigm|disrupt|ecosystem|play|tooling|stack)" *.md

# 5. Sentence length: aim for < 20 words
# Visual inspection. Long sentences signal lazy thinking.
```

## Microcopy Matters More Than Hero

In-app copy (tooltips, empty states, error messages, button labels) is where users actually spend time.

### Empty states

```tsx
// ❌ Bad
<p>No items found.</p>

// ✅ Good
<div>
  <h3>No agents yet</h3>
  <p>Create your first agent to get started. Takes 30 seconds.</p>
  <button>Create agent</button>
</div>
```

### Error messages

```tsx
// ❌ Bad
"Error: invalid input"

// ✅ Good (specific + actionable)
"We couldn't connect to your LLM provider. Check that OPENAI_API_KEY
is set and has access to gpt-4o."
```

### Confirmations

```tsx
// ❌ Bad
"Success"

// ✅ Good
"Agent created. Ready to assign tasks."
```

## The Pricing Page Pattern

Pricing pages convert when they make comparison easy.

```tsx
<div className="grid grid-cols-3 gap-6">
  {plans.map(plan => (
    <div className={plan.featured ? 'card highlighted' : 'card'}>
      <h3>{plan.name}</h3>
      <p className="price">{plan.price}<span>/mo</span></p>
      <ul>
        {plan.features.map(f => <li>— {f}</li>)}
      </ul>
      <button>{plan.cta}</button>
    </div>
  ))}
</div>
```

**Rules:**
- 3 tiers max (decision paralysis beyond that)
- Highlight one tier (your "most popular" — be honest)
- Price is huge. Features are bullets. CTA at the bottom.
- Show what happens when limits are exceeded

## The Footer Pattern

Most sites waste the footer. The best sites use it for:

- **One final CTA** (newsletter, contact, or pricing)
- **Three to five link groups** (Product, Resources, Company, Legal)
- **Brand signoff** (one line, not a paragraph)
- **Status indicator** if applicable

```tsx
<footer>
  <h3>Try gocrewwai today.</h3>
  <p>Open source. Production ready. MIT licensed.</p>
  <button>Get started</button>

  <div className="grid grid-cols-4">
    <div>
      <h4>Product</h4>
      <a>Features</a><a>Pricing</a><a>Changelog</a>
    </div>
    {/* ... */}
  </div>

  <p>© gocrewwai. Built by a small team.</p>
</footer>
```

## The "Sounds Like a Human" Test

Read the page aloud. If it sounds like a press release, rewrite. If it sounds like a human explaining something they care about, ship.

**Voice signals to add:**

- "we" and "you" (not "users" or "customers")
- Specific numbers ("30 seconds" not "fast")
- One mild opinion ("we like Postgres")
- One moment of self-deprecation or honesty
- The occasional em-dash — they make prose breathe

**Voice signals to remove:**

- "Solution" (anything that's a "solution" is rarely one)
- "Robust" (means nothing)
- "Best-in-class" (everyone says this)
- "Unlock" (you don't unlock software)
- "Ecosystem" (you don't have an ecosystem if you have one product)

## The Conversion Checklist

Before publishing copy:

- [ ] Hero headline names the outcome
- [ ] Subhead adds specificity without repeating
- [ ] One primary CTA per section
- [ ] All CTA copy starts with a verb
- [ ] No buzzwords (revolutionary, cutting-edge, etc.)
- [ ] No weasel words (very, really, just, simply)
- [ ] Bullet lists use parallel structure
- [ ] Error messages are specific + actionable
- [ ] Empty states explain what to do next
- [ ] Pricing page has max 3 tiers
- [ ] Footer has one final CTA
- [ ] Read aloud test: sounds like a human

## What Not To Do

❌ Write copy you wouldn't say out loud
❌ Stack adjectives: "powerful, flexible, scalable, secure platform"
❌ Hide the price behind "Contact us" unless you're enterprise-only
❌ Use "we" in error messages (the user doesn't care whose fault it is)
❌ Promise features that ship next quarter
❌ Let legal copy leak into marketing copy
❌ Treat testimonials as decoration — make them verifiable
