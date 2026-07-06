# Deployment Guide

This document describes the deployment process for the Chassis ecosystem.

## 🌐 Deployment Environments

### Production
- **Branch:** `main`
- **URL:** `chassis-ui.com`
- **Trigger:** Push to `main` branch or manual deployment

### Staging
- **Branch:** `staging`  
- **URL:** `staging.chassis-ui.com`
- **Trigger:** Push to `staging` branch

Each Chassis project (css, tokens, assets, icons, figma) has its own staging and production deployments.

## 🏗 Deployment Architecture

### Main Website (chassis-website)

**Repository:** `chassis-ui/website`  
**Hosting:** Vercel  
**Build Command:** `pnpm site:build` (per `vercel.json` — runs `build/build-site.js` then `pnpm site:pagefind`; the plain `pnpm build` script does the same site build plus a vendor-asset sync and is meant for local/manual full builds)  
**Output Directory:** `_site`  

**Production:**
- URL: `chassis-ui.com`
- Vercel Project: `chassis-website`
- Deployment URL: `chassis-website.vercel.app`

**Staging:**
- URL: `staging.chassis-ui.com`
- Vercel Project: Same (different branch)
- Deployment URL: `chassis-website-git-staging.vercel.app`

### Project Sites

Each Chassis project deploys independently:

| Project | Production URL | Staging URL |
|---------|---------------|-------------|
| chassis-css | `chassis-css.vercel.app` | `chassis-css-staging.vercel.app` |
| chassis-tokens | `chassis-tokens.vercel.app` | `chassis-tokens-staging.vercel.app` |
| chassis-assets | `chassis-assets.vercel.app` | `chassis-assets-staging.vercel.app` |
| chassis-icons | `chassis-icons.vercel.app` | `chassis-icons-staging.vercel.app` |
| chassis-figma | `chassis-figma.vercel.app` | `chassis-figma-staging.vercel.app` |

### Unified Routing

The main website (`chassis-ui.com`) proxies requests to project sites via Vercel rewrites:

```
/css/*           → chassis-css.vercel.app
/tokens/*        → chassis-tokens.vercel.app
/assets/*        → chassis-assets.vercel.app
/icons/*         → chassis-icons.vercel.app
/figma/*         → chassis-figma.vercel.app
```

See [VERCEL_CONFIG.md](VERCEL_CONFIG.md) for details on request routing.

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

#### For chassis-website:

**To Staging:**
```bash
git checkout staging
git merge feature-branch
git push origin staging
# → Automatically deploys to staging.chassis-ui.com
```

**To Production:**
```bash
git checkout main
git merge staging
git push origin main
# → Automatically deploys to chassis-ui.com
```

#### For Other Projects:

Each project follows the same pattern:
```bash
# Staging
git push origin staging

# Production
git push origin main
```

### Manual Deployment

If you need to trigger a manual deployment:

```bash
# Using Vercel CLI
vercel --prod              # Deploy to production
vercel                     # Deploy to preview
```

## 📋 GitHub Actions

**Deploys are triggered directly by Vercel's git integration** — Vercel watches the `main` and `staging` branches and builds automatically on push. No Actions workflow performs the actual deploy.

This repo's `.github/workflows/` currently has three workflows, none of which deploy:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | PRs against `main`/`staging`, pushes to `staging` | ESLint, Stylelint, Prettier, `astro check` (both `packages/website` and `packages/docs`), `pnpm audit` |
| `lighthouse.yml` | `deployment_status` events (or manual `workflow_dispatch`) | Runs Lighthouse CI against the resulting production or staging URL, using `lighthouse.json` thresholds |
| `publish-packages.yml` | Push to `main` | Detects a version bump in `packages/docs/package.json` and publishes `@chassis-ui/docs` to npm automatically |

Submodule syncing (`vendor/assets`) is handled by `build/sync-submodules.js`, invoked via `pnpm sync-submodules` (part of `pnpm dev` and `pnpm build`) — not a scheduled or triggered GitHub Action.

## 🔧 Vercel Configuration

### vercel.json

The main site's `vercel.json` handles:
- Build configuration
- Rewrite rules for project proxying
- Environment-specific routing
- Headers and redirects

Example:
```json
{
  "buildCommand": "pnpm site:build",
  "outputDirectory": "_site",
  "trailingSlash": true,
  "headers": [
    {
      "source": "/(.*)",
      "has": [
        { "type": "header", "key": "host", "value": "staging.chassis-ui.com" }
      ],
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/css/(.*)",
      "has": [
        { "type": "header", "key": "host", "value": "staging.chassis-ui.com" }
      ],
      "destination": "https://chassis-css-staging.vercel.app/css/$1"
    },
    {
      "source": "/css/(.*)",
      "destination": "https://chassis-css.vercel.app/css/$1"
    }
  ]
}
```

See [VERCEL_CONFIG.md](VERCEL_CONFIG.md) for the full rewrite set (including `/static/*` referer-based rules) and [INDEXING.md](INDEXING.md) for the full indexing strategy.

### Environment Detection

Vercel automatically sets environment variables:
- `VERCEL_ENV`: `production`, `preview`, or `development`
- `VERCEL_URL`: Deployment URL
- `VERCEL_GIT_COMMIT_REF`: Branch name

## 🔄 Deployment Workflow

### Typical Development Cycle

1. **Feature Development**
   ```bash
   git checkout -b feature/new-component
   # Make changes
   git commit -m "feat: add new component"
   git push origin feature/new-component
   # → Creates preview deployment on Vercel
   ```

2. **Staging Deployment**
   ```bash
   git checkout staging
   git merge feature/new-component
   git push origin staging
   # → Deploys to staging.chassis-ui.com
   # Test on staging
   ```

3. **Production Deployment**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   # → Deploys to chassis-ui.com
   ```

### Version Coordination

When deploying changes that affect multiple projects:

1. **Update @chassis-ui/docs** (if shared components changed) — run from the repo root:
   ```bash
   node build/change-version.js --patch   # or --minor / --major, or: node build/change-version.js <old> <new>
   git commit -m "feat(docs): update shared component"
   git push origin main
   # → .github/workflows/publish-packages.yml detects the version bump and publishes to npm automatically
   ```

2. **Update dependent projects**
   ```bash
   # In chassis-css, chassis-tokens, etc.
   pnpm add @chassis-ui/docs@latest
   git commit -m "chore: update @chassis-ui/docs"
   git push
   ```

3. **Deploy in order** (optional, or just deploy all simultaneously)

> `@chassis-ui/css` and `@chassis-ui/tokens` share the same MINOR version number.

## 🧪 Pre-Deployment Checklist

Before merging to `main`:

- [ ] Code passes linting: `pnpm site:lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Preview deployment works correctly
- [ ] Staging deployment tested (if applicable)
- [ ] Submodules are up to date: `git submodule status`
- [ ] Dependencies are up to date
- [ ] Breaking changes documented
- [ ] Version numbers updated (if releasing @chassis-ui/docs)

## 🐛 Troubleshooting Deployments

### Build Fails on Vercel

**Check build logs:**
1. Go to Vercel dashboard
2. Click on failed deployment
3. View build logs

**Common issues:**

```bash
# Missing dependencies
pnpm install

# TypeScript errors
pnpm astro check

# Environment variables missing
# → Check Vercel dashboard settings
```

### Submodule Issues

```bash
# Ensure submodules are initialized
git submodule update --init --recursive

# Update to latest
git submodule update --remote

# Commit the update
git add vendor/assets
git commit -m "chore: update submodules"
```

### Proxy Routing Not Working

Check `vercel.json` configuration:
1. Verify rewrite rules are correct
2. Ensure target URLs are accessible
3. Check host header conditions for staging

See [VERCEL_CONFIG.md](VERCEL_CONFIG.md) for detailed routing configuration.

### Cache Issues

Clear Vercel build cache:
1. Go to Vercel dashboard
2. Settings → General
3. Clear build cache
4. Redeploy

Or use CLI:
```bash
vercel redeploy --no-cache
```

## 📊 Monitoring

### Vercel Analytics

Vercel automatically provides:
- Build logs and history
- Deployment previews
- Real-time analytics
- Error tracking

Access via Vercel dashboard for each project.

### Lighthouse CI

`.github/workflows/lighthouse.yml` runs on `deployment_status` events (or manual `workflow_dispatch`) and determines the target URL dynamically based on the deployment's environment (production vs. staging) rather than a hardcoded list — see the workflow file for the exact URL-resolution logic. Score thresholds (performance, accessibility, best-practices, SEO — all `0.9`) are defined in `lighthouse.json` at the repo root.

## 🔗 Deployment URLs

### Production URLs

- **Main Site:** https://chassis-ui.com
- **CSS Docs:** https://chassis-ui.com/css/
- **Tokens Docs:** https://chassis-ui.com/tokens/
- **Assets Docs:** https://chassis-ui.com/assets/
- **Icons Docs:** https://chassis-ui.com/icons/
- **Figma Docs:** https://chassis-ui.com/figma/

### Staging URLs

- **Main Site:** https://staging.chassis-ui.com
- **CSS Docs:** https://staging.chassis-ui.com/css/
- **Tokens Docs:** https://staging.chassis-ui.com/tokens/
- **Icons Docs:** https://staging.chassis-ui.com/icons/
- **Figma Docs:** https://staging.chassis-ui.com/figma/
- **Assets Docs:** https://staging.chassis-ui.com/assets/

> ⚠️ Staging is excluded from search engines via `robots.txt` (`Disallow: /`) and `X-Robots-Tag: noindex, nofollow`. See [INDEXING.md](INDEXING.md).

### Direct Project URLs

Useful for debugging routing:
- https://chassis-css.vercel.app
- https://chassis-tokens.vercel.app
- https://chassis-assets.vercel.app
- https://chassis-icons.vercel.app
- https://chassis-figma.vercel.app

## 📚 Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [VERCEL_CONFIG.md](VERCEL_CONFIG.md) - Vercel routing details
- [INDEXING.md](INDEXING.md) - Search engine indexing strategy
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development workflow
- [Vercel Documentation](https://vercel.com/docs)

## 🎯 Quick Commands

```bash
# Local preview
pnpm build && pnpm preview

# Deploy to production (if you have Vercel CLI configured)
vercel --prod

# Deploy to staging preview
vercel

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```
