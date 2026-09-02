---
name: doc-deploy
description: "Orchestrate the full documentation lifecycle — build, verify, deploy to GitHub Pages, Vercel, or Cloudflare Pages, and verify the live site. Use when publishing a docs site, setting up CI for docs, or recovering from a failed deploy."
version: 1.0.0
author: Kiro
license: MIT
---

# Doc Deploy

Take a docs site from local build to live URL with verified deployment.

## When to Use

- First-time deploy of a new docs site
- Setting up CI/CD for documentation
- Switching hosting providers (Vercel → Pages, etc.)
- Recovering from a failed or broken deploy
- Verifying a live site is actually serving the latest version

## Three Deployment Targets

### Target 1 — GitHub Pages

Best for: open-source project docs, version-pinned content, no auth needed.

```bash
# Step 1: Build static output
cd docs-site
npm run build
# Output: ./out or ./.next/export

# Step 2: Push to a dedicated gh-pages repo or branch
# Option A: same repo, gh-pages branch
git checkout --orphan gh-pages
git --work-tree=out add --all
git --work-tree=out commit -m "Deploy docs $(date +%Y-%m-%d)"
git push origin HEAD:gh-pages --force

# Option B: dedicated repo (e.g. kiroclawai/gocrewwai-docs)
cd out
git init
git remote add origin git@github.com:org/docs-repo.git
git add .
git commit -m "Deploy docs"
git push -u origin main --force

# Step 3: Configure GitHub Pages in repo settings
# Source: gh-pages branch (or main if dedicated repo)
# Custom domain: optional
```

### Target 2 — Vercel

Best for: docs that share infrastructure with the main app, preview deploys.

```bash
# Step 1: Install Vercel CLI
npm i -g vercel

# Step 2: Link project
cd docs-site
vercel link

# Step 3: Set environment variables
vercel env add RAZORPAY_KEY_ID production
vercel env add RAZORPAY_SECRET production

# Step 4: Deploy
vercel --prod

# Step 5: Configure custom domain in Vercel dashboard
# https://docs.example.com → add domain, set DNS
```

### Target 3 — Cloudflare Pages

Best for: fast global CDN, simple Git-based deploys.

```bash
# Step 1: Connect repo at https://pages.cloudflare.com
# Build command: npm run build
# Output directory: out or .next/export

# Step 2: Set environment variables in Cloudflare dashboard

# Step 3: Configure custom domain
# DNS: CNAME docs → <project>.pages.dev
```

## Post-Deploy Verification

**Never assume a deploy worked. Always verify.**

```bash
# 1. Check the live URL responds
URL="https://docs.example.com"
curl -sI "$URL" | head -3
# Expect: HTTP/2 200

# 2. Check key pages exist
for path in "" "docs/introduction" "docs/installation" "docs/quickstart"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$URL/$path")
  echo "$path → $status"
done
# Expect: all 200

# 3. Check the latest version is live (compare build SHA)
LIVE_SHA=$(curl -s "$URL" | grep -oE 'sha-[a-f0-9]{12}' | head -1)
LOCAL_SHA=$(git rev-parse --short HEAD)
[ "$LIVE_SHA" = "$LOCAL_SHA" ] || echo "MISMATCH: live=$LIVE_SHA local=$LOCAL_SHA"

# 4. Check assets load (CSS, JS, fonts)
for asset in $(curl -s "$URL" | grep -oE 'src="[^"]+\.js"' | sed 's/src="//;s/"//' | head -3); do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$URL/$asset")
  echo "$asset → $status"
done
```

## CI Workflow for Docs

Wire the build → verify → deploy pipeline into GitHub Actions:

```yaml
# .github/workflows/docs.yml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - 'docs-site/**'
      - 'docs-site/src/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        working-directory: docs-site
        run: npm ci

      - name: Build static site
        working-directory: docs-site
        run: npm run build

      - name: Verify build
        working-directory: docs-site
        run: |
          # Sanity check: index exists
          test -f out/index.html || test -f .next/server/app/index.html
          # Spot-check: docs index exists
          test -f out/docs/index.html || test -f .next/server/app/docs/index.html

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-site/out
          cname: docs.example.com
```

## DNS Configuration

For a custom domain on GitHub Pages:

```
# Apex domain (example.com → docs)
A   @   185.199.108.153
A   @   185.199.109.153
A   @   185.199.110.153
A   @   185.199.111.153

# Subdomain (docs.example.com)
CNAME   docs   <org>.github.io.
```

For Vercel or Cloudflare, the dashboard provides exact DNS records to add.

## Recovery Playbook

### Site shows old content

1. Check the build SHA on the live site vs your local HEAD
2. If different: redeploy
3. If same: check CDN cache (Cloudflare → purge, Vercel → automatic on new deploy)

### 404 on a page that exists locally

1. Check `trailingSlash` config in `next.config.mjs`
2. Check if the path uses dynamic params — ensure `generateStaticParams` covers all values
3. Check for case-sensitivity mismatch (Linux serves case-sensitive, macOS dev may not)

### CSS/JS missing

1. Check `basePath` in `next.config.mjs` matches the deployed path
2. Check absolute vs relative paths in CSS imports
3. Check CSP headers if any

### Build succeeds but deploy fails

1. Check repo permissions for the deploy action
2. Check branch protection rules on the deploy target
3. Check storage limits (GitHub Pages: 1 GB repo size, 100 GB bandwidth/month)

## Anti-Patterns

❌ **No `cname` file** — without it, GitHub Pages won't recognize the custom domain
❌ **Deploy from `main` directly** — use a build artifact, not the source tree
❌ **Skip post-deploy verification** — broken deploys that "look fine" cost users trust
❌ **No rollback plan** — always know which previous commit to redeploy

## Re-Deploy Last Good Version

```bash
# Find the last working commit
git log --oneline -- docs-site/ | head -10

# Revert to it
git revert --no-commit HEAD~5..HEAD
git commit -m "Revert docs to last known good"

# Or force-redeploy a specific commit
git checkout <good-commit-sha> -- docs-site/
git commit -m "Redeploy docs from <short-sha>"
git push
```

## See Also

- `doc-forge` — generate the docs
- `doc-curator` — audit the docs
- `doc-deploy` — ship them (this skill)
