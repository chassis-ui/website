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

Each Chassis project (tokens, css, icons, assets, figma, react) has its own staging and production deployments.

## 🏗 Deployment Architecture

### Main Website (chassis-website)

**Repository:** `chassis-ui/website`  
**Hosting:** Vercel  
**Build Command:** `pnpm site:build` (per `vercel.json`). `pnpm build` runs the same. See [How the site is built](DEVELOPMENT.md#how-the-site-is-built)  
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

| Project        | Production URL              | Staging URL                         |
| -------------- | --------------------------- | ----------------------------------- |
| chassis-css    | `chassis-css.vercel.app`    | `chassis-css-staging.vercel.app`    |
| chassis-tokens | `chassis-tokens.vercel.app` | `chassis-tokens-staging.vercel.app` |
| chassis-assets | `chassis-assets.vercel.app` | `chassis-assets-staging.vercel.app` |
| chassis-icons  | `chassis-icons.vercel.app`  | `chassis-icons-staging.vercel.app`  |
| chassis-figma  | `chassis-figma.vercel.app`  | `chassis-figma-staging.vercel.app`  |
| chassis-react  | `chassis-react.vercel.app`  | none yet                            |

chassis-react's staging deployment is behind Vercel's deployment protection, so `staging.chassis-ui.com/react/` shows Vercel's login. See [VERCEL_CONFIG.md](VERCEL_CONFIG.md).

### Unified Routing

The main website (`chassis-ui.com`) proxies requests to project sites via Vercel rewrites:

```
/css/*           → chassis-css.vercel.app
/tokens/*        → chassis-tokens.vercel.app
/assets/*        → chassis-assets.vercel.app
/icons/*         → chassis-icons.vercel.app
/figma/*         → chassis-figma.vercel.app
/react/*         → chassis-react.vercel.app
```

See [VERCEL_CONFIG.md](VERCEL_CONFIG.md) for details on request routing.

## 🚀 Deployment Process

### Branches and required checks

| Branch    | Receives                                   | Deploys                  | Protected                                   |
| --------- | ------------------------------------------ | ------------------------ | ------------------------------------------- |
| `develop` | Every change, from pull requests or merges | nothing                  | no                                          |
| `staging` | The commits of `develop`, once CI passed   | `staging.chassis-ui.com` | no force push, no deletion, required checks |
| `main`    | The same commits, after staging            | `chassis-ui.com`, npm    | no force push, no deletion, required checks |

Work is merged into `develop`. Outside contributors open their pull requests against
`develop`, and CI runs on them. Maintainers merge their own branches into `develop` locally
or with a pull request. Then the same commit moves on to `staging` and `main`. No commit
reaches `staging` or `main` that did not pass through `develop`.

The ruleset "Protect main and staging" requires four jobs of `ci.yml` to pass on a commit
before it reaches `staging` or `main`: Lint, Type Check, Test and Build. The ruleset and
`release.yml` name the jobs, so a job is renamed in all three places. Fixture Site,
Changeset and Audit run and do not block a push; `release.yml` also requires both Fixture
Site jobs before it publishes.

The rule applies to direct pushes and pull requests alike. GitHub accepts a direct push
only when the commit already has passing checks, so a commit has to pass CI somewhere
first. That is what `develop` is for: CI runs on every push to it, and Vercel does not
deploy it. CI does not run again when the same commit is pushed to `staging` and `main`: the
results of the `develop` run belong to the commit, and the ruleset and the release workflow
read them there. A push to `staging` runs nothing in Actions, and a push to `main` runs
`release.yml` only. The pushes to `develop` are not cancelled by a newer one, so each
commit keeps its results; a newer push to a pull request cancels the run of the older.

### Releasing chassis-website

With the work merged into `develop`:

```bash
git push origin develop
# → CI runs on develop. Wait until it is green.

git push origin develop:staging
# → Deploys to staging.chassis-ui.com. Check it.

git push origin develop:main
# → Deploys to chassis-ui.com, and publishes @chassis-ui/docs when its version changed
```

Each push moves the branch to the same commit, so the checks that passed on `develop`
count for `staging` and `main`. A push is rejected when CI failed, is still running, or
has not run on that commit, for example after a local merge commit. Push that commit to
`develop` first.

A pull request from `develop` into `staging` or `main` works as well. It merges once the
checks pass on it.

### Other projects

Each Chassis project deploys from its own `staging` and `main` branches. Their branch
rules are set in their own repositories.

### Manual Deployment

If you need to trigger a manual deployment:

```bash
# Using Vercel CLI
vercel --prod              # Deploy to production
vercel                     # Deploy to preview
```

## 📋 GitHub Actions

**Deploys are triggered directly by Vercel's git integration** — Vercel watches the `main` and `staging` branches and builds automatically on push. No Actions workflow performs the actual deploy.

None of the workflows in `.github/workflows/` deploys:

| Workflow         | Trigger                                                                                                            | Purpose                                                                                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml`         | Pushes to `develop`, pull requests against `develop`, `staging` and `main`                                         | Lint, Type Check, Test and Build, which the ruleset requires, Fixture Site for both layouts, Changeset, which asks for a changeset when `packages/docs` changed, and Audit. Dependency Review on pull requests                                                                                         |
| `lighthouse.yml` | `deployment_status` events (or manual `workflow_dispatch`)                                                         | Runs Lighthouse CI against the resulting production or staging URL, using `lighthouse.json` thresholds                                                                                                                                                                                                 |
| `links.yml`      | `deployment_status` events (or manual `workflow_dispatch`)                                                         | Crawls the resulting production or staging URL, the proxied projects included, with `build/check-links.js`. Fails on a broken link of this site. A broken link of a proxied project, or into one, is a warning                                                                                         |
| `release.yml`    | Push to `main`, or manual `workflow_dispatch` on `main`                                                            | Publishes the version in `packages/docs/package.json` when npm does not have it, after checking that CI passed on the commit, then creates the GitHub release. Trusted publishing with provenance. A prerelease goes to the dist-tag named by its version. See [Releases](../CONTRIBUTING.md#releases) |
| `canary.yml`     | Pushes to `develop` that set a version of `@chassis-ui/docs` that npm does not have, or manual `workflow_dispatch` | Builds the site of each sibling whose range accepts the version, with the packed package, with `build/canary.js`. Reports only: nothing requires it. See [Releases](../CONTRIBUTING.md#releases)                                                                                                       |

No workflow moves the `vendor/assets` pin. The build uses the pinned commit, and the pin moves only when someone runs `pnpm sync-submodules` and commits the result. See [DEVELOPMENT.md](DEVELOPMENT.md#the-vendorassets-submodule).

Every action in them is pinned to a commit, so the commit a sibling pins fixes the actions
too. The checkout does not keep the token of the job (`persist-credentials: false`), and
the permissions are `contents: read`.

A change to an input or a default of these workflows is a change for every sibling that
calls them. Add inputs, and keep the defaults, unless all siblings move together.

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

See [VERCEL_CONFIG.md](VERCEL_CONFIG.md) for the full rewrite set (including `/static/*` referer-based rules), the security headers and the firewall rule of the contact endpoint, and [INDEXING.md](INDEXING.md) for the full indexing strategy.

### Environment Detection

Vercel automatically sets environment variables:

- `VERCEL_ENV`: `production`, `preview`, or `development`
- `VERCEL_URL`: Deployment URL
- `VERCEL_GIT_COMMIT_REF`: Branch name

## 🔄 Deployment Workflow

### Typical Development Cycle

1. Work on a local branch and merge it into `develop`.
2. Push `develop` and wait for CI.
3. Push the same commit to `staging` and check the staging site.
4. Push the same commit to `main`.

The commands are under [Releasing chassis-website](#releasing-chassis-website).

### Version Coordination

When deploying changes that affect multiple projects:

1. **Release @chassis-ui/docs** (if shared components changed) — run from the repo root:

   ```bash
   pnpm changeset:version   # applies the changesets in .changeset/
   git commit -am "chore(release): @chassis-ui/docs <version>"
   # Push through develop and staging to main, as above
   # → .github/workflows/release.yml publishes a version that npm does not have yet
   ```

   See [Releases](../CONTRIBUTING.md#releases) for changesets and prereleases.

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

Before pushing to `main`:

- [ ] CI is green on the commit. GitHub rejects the push otherwise
- [ ] Preview deployment works correctly
- [ ] Staging deployment tested (if applicable)
- [ ] The `vendor/assets` pin is the commit you mean to deploy: `git submodule status`
- [ ] Dependencies are up to date
- [ ] Breaking changes documented
- [ ] `pnpm changeset:version` run and committed (if releasing @chassis-ui/docs)

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
pnpm check:astro

# Environment variables missing
# → Check Vercel dashboard settings. .env.example names them
```

### Submodule Issues

```bash
# Build vendor/assets at the pinned commit, as Vercel does
pnpm vendor

# Move the pin to the latest app/docs of chassis-assets, then commit it on its own
pnpm sync-submodules
git add vendor/assets
git commit -m "chore: update the assets submodule"
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
- **React Docs:** https://chassis-ui.com/react/

### Staging URLs

- **Main Site:** https://staging.chassis-ui.com
- **CSS Docs:** https://staging.chassis-ui.com/css/
- **Tokens Docs:** https://staging.chassis-ui.com/tokens/
- **Icons Docs:** https://staging.chassis-ui.com/icons/
- **Figma Docs:** https://staging.chassis-ui.com/figma/
- **Assets Docs:** https://staging.chassis-ui.com/assets/
- **React Docs:** none yet, see above

> ⚠️ Staging is excluded from search engines via `robots.txt` (`Disallow: /`) and `X-Robots-Tag: noindex, nofollow`. See [INDEXING.md](INDEXING.md).

### Direct Project URLs

Useful for debugging routing:

- https://chassis-css.vercel.app
- https://chassis-tokens.vercel.app
- https://chassis-assets.vercel.app
- https://chassis-icons.vercel.app
- https://chassis-figma.vercel.app
- https://chassis-react.vercel.app

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
