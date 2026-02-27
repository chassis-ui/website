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
**Build Command:** `pnpm build`  
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
/docs/css/*      → chassis-css.vercel.app
/docs/tokens/*   → chassis-tokens.vercel.app
/docs/assets/*   → chassis-assets.vercel.app
/docs/icons/*    → chassis-icons.vercel.app
/docs/figma/*    → chassis-figma.vercel.app
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

### Workflow Configuration

The repository uses GitHub Actions defined in `.github/workflows/`:

**Example workflow:**
```yaml
name: Deploy

on:
  push:
    branches:
      - main
      - staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
          
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

## 🔐 Required Secrets

### GitHub Secrets

Configure in repository settings (`Settings → Secrets and variables → Actions`):

```
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
```

### Getting Vercel Credentials

1. **Vercel Token:**
   - Visit https://vercel.com/account/tokens
   - Create new token
   - Copy and add as `VERCEL_TOKEN` secret

2. **Vercel Org ID & Project ID:**
   ```bash
   # Install Vercel CLI
   pnpm add -g vercel
   
   # Login and link project
   vercel link
   
   # Get IDs from .vercel/project.json
   cat .vercel/project.json
   ```

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
  "buildCommand": "pnpm build",
  "outputDirectory": "_site",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/docs/css/:path*",
      "has": [
        {
          "type": "header",
          "key": "host",
          "value": "staging.chassis-ui.com"
        }
      ],
      "destination": "https://chassis-css-staging.vercel.app/docs/css/:path*"
    },
    {
      "source": "/docs/css/:path*",
      "destination": "https://chassis-css.vercel.app/docs/css/:path*"
    }
  ]
}
```

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

1. **Update @chassis-ui/docs** (if shared components changed)
   ```bash
   cd packages/docs
   # Update version in package.json (e.g., 0.1.0 → 0.1.1)
   git commit -m "feat(docs): update shared component"
   git push
   ```

2. **Update dependent projects**
   ```bash
   # In chassis-css, chassis-tokens, etc.
   pnpm add @chassis-ui/docs@latest
   git commit -m "chore: update @chassis-ui/docs"
   git push
   ```

3. **Deploy in order** (optional, or just deploy all simultaneously)

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

The repository may include Lighthouse CI for performance monitoring:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, staging]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://chassis-ui.com
            https://chassis-ui.com/docs/css/
          uploadArtifacts: true
```

## 🔗 Deployment URLs

### Production URLs

- **Main Site:** https://chassis-ui.com
- **CSS Docs:** https://chassis-ui.com/docs/css/
- **Tokens Docs:** https://chassis-ui.com/docs/tokens/
- **Assets Docs:** https://chassis-ui.com/docs/assets/
- **Icons Docs:** https://chassis-ui.com/docs/icons/
- **Figma Docs:** https://chassis-ui.com/docs/figma/

### Staging URLs

- **Main Site:** https://staging.chassis-ui.com
- **CSS Docs:** https://staging.chassis-ui.com/docs/css/
- *(Same pattern for other docs)*

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
