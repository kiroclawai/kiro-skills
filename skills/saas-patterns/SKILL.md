---
name: saas-patterns
description: "Build production SaaS systems with auth, billing, multi-tenancy, rate limiting, audit logs, and customer support workflows. Use when launching a paid product, migrating from free to paid, or scaling a SaaS past 100 customers."
version: 1.0.0
author: Kiro
license: MIT
---

# SaaS Patterns

Everything below is the part of "shipping a SaaS" that isn't fun. The fun part is the demo. This skill enforces the rest.

## When to Use

- Launching a paid product
- Adding billing to an existing product
- Hardening a single-tenant codebase for multi-tenant operation
- Scaling past 100 customers (when manual processes start to break)
- Responding to a SOC 2 or security questionnaire

## The Five SaaS Subsystems

### Subsystem 1 — Authentication & Authorization

**Three authentication modes you need:**

1. **Password + email** — for self-serve signups
2. **OAuth (Google, GitHub)** — for reduced friction
3. **Magic link / SSO** — for enterprise

**Authorization is not authentication.** A logged-in user doesn't have permission to do everything. Model this:

```typescript
type Role = 'viewer' | 'member' | 'admin' | 'owner';
type Resource = { type: string; id: string; tenantId: string };

async function can(role: Role, action: Action, resource: Resource): Promise<boolean> {
    // role + action + resource + tenant = decision
}
```

**Multi-tenant:** every record carries a `tenant_id`. Authorization checks must verify the user belongs to that tenant.

### Subsystem 2 — Billing

Three layers:

#### Plan model
```typescript
type Plan = {
    id: string;
    name: string;
    monthlyPriceUsd: number;
    features: string[];          // what's included
    limits: Record<string, number>; // metered feature caps
};
```

#### Entitlement check (the `can(user, action)` you're really calling)

```typescript
async function checkEntitlement(user: User, feature: string): Promise<boolean> {
    const sub = await subscriptions.getActive(user.tenantId);
    if (!sub) return false;
    return sub.plan.features.includes(feature) &&
           usage.getCurrent(sub.tenantId, feature) < sub.plan.limits[feature];
}
```

#### Webhooks (the part everyone forgets)

```typescript
// POST /api/billing/webhook
// Signature verification FIRST. No exceptions.
const sig = req.headers['x-razorpay-signature'];
const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody).digest('hex');
if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.status(400).send('invalid signature');
}

switch (event.event) {
    case 'subscription.activated': await markEntitled(event.subscription.id); break;
    case 'subscription.cancelled': await revokeEntitlement(event.subscription.id); break;
    case 'payment.failed': await notifyAndGracePeriod(event.subscription.id); break;
}
```

Always store the raw event for replay. Webhooks will fail; you will replay them.

### Subsystem 3 — Rate Limiting

Three layers:

1. **Per-IP rate limit** — DDoS shield, applied at the edge
2. **Per-API-key rate limit** — prevents single customer abuse, applied at the gateway
3. **Per-feature meter** — what you're actually charging for

```typescript
// Layer 1: edge
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

// Layer 2: gateway
const perKey = rateLimit({ key: req.apiKey.id, windowMs: 60_000, max: 1000 });

// Layer 3: meter
const metering = new Meter(req.tenantId);
metering.track('agent.run', { tokens: llmTokens });
```

### Subsystem 4 — Audit Logs

Two non-negotiable properties:

1. **Append-only.** No UPDATE or DELETE on audit tables.
2. **Tenant-isolated.** Customers can read their own; you read all.

```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL,
    actor_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,    -- 'user.login', 'billing.refund', 'agent.run'
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX audit_tenant_action_idx ON audit_log(tenant_id, action, created_at DESC);
```

### Subsystem 5 — Support Workflows

Build these on day one — they save you weeks later.

- **Signed impersonation URLs:** `https://app.example.com/impersonate?token=...&expires=...&user=...` — only valid for 30 minutes, fully audited
- **Customer-visible activity log:** show them what their team did, when
- **Refund flow:** one-click from admin UI, writes audit log entry, fires webhook
- **Plan-change preview:** "if you upgrade, here's what happens to your data"

## The Multi-Tenant Checklist

Every feature must pass these before merge:

- [ ] Every record query filters by `tenant_id`
- [ ] Every write includes `tenant_id`
- [ ] Cross-tenant reads return 404, not "exists but no access"
- [ ] Background jobs scope by `tenant_id`
- [ ] Logs and metrics are tagged by `tenant_id`
- [ ] Storage paths include `tenant_id` prefix

**Easy mistake to miss:** cache keys. `cache.get(user.id)` is fine; `cache.get('user_settings')` is not.

## Customer Support Scripts

Save these for the inevitable 3 AM page:

```bash
#!/usr/bin/env bash
# Get a customer's full state for support ticket
TENANT=$1
[ -z "$TENANT" ] && { echo "usage: $0 <tenant_id>"; exit 1; }

echo "=== Tenant $TENANT ==="
psql -c "SELECT id, name, plan_id, created_at FROM tenants WHERE id = '$TENANT'"
psql -c "SELECT id, email, role FROM users WHERE tenant_id = '$TENANT'"
psql -c "SELECT id, status, current_period_end FROM subscriptions WHERE tenant_id = '$TENANT'"
psql -c "SELECT feature, usage FROM usage_counters WHERE tenant_id = '$TENANT'"
psql -c "SELECT action, created_at FROM audit_log WHERE tenant_id = '$TENANT' ORDER BY created_at DESC LIMIT 20"
echo "=== Recent errors ==="
psql -c "SELECT request_id, status_code, error FROM request_errors WHERE tenant_id = '$TENANT' ORDER BY created_at DESC LIMIT 10"
```

## What NOT To Do

❌ Store card numbers — never, ever, ever
❌ Trust the client's `tenant_id` — derive from the authenticated session
❌ Log full request bodies that may contain PII
❌ Send a 500 for an authorization failure — send 403 with no detail
❌ "Move fast" past authz — you can't refactor your way out of a permission bug after release
❌ Roll your own crypto, JWT, or OAuth implementation
❌ Forget that webhooks fire multiple times — make your handlers idempotent
