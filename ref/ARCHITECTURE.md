# Chassis Ecosystem Architecture

## 🏗 Architecture Overview

The Chassis Design System uses a **hybrid monorepo + multi-repository architecture**:

- **chassis-website** is a pnpm monorepo containing:
  - `packages/docs` - Shared documentation components/layouts (`@chassis-ui/docs` package)
  - `packages/website` - Main chassis-ui.com website
- Each Chassis project (tokens, css, assets, icons, figma) is a separate repository
- All project documentation sites import and use `@chassis-ui/docs` for consistency
- Sites are unified through Vercel's proxy routing into a single user experience

## 📦 Monorepo Structure: chassis-website

```
chassis-website/                 # Main monorepo
├── packages/
│   ├── docs/                    # @chassis-ui/docs shared package
│   │   ├── src/
│   │   │   ├── components/      # Shared Astro components
│   │   │   │   ├── DocsSidebar.astro
│   │   │   │   ├── TableOfContents.astro
│   │   │   │   └── shortcodes/  # MDX shortcodes
│   │   │   ├── layouts/         # Base page layouts
│   │   │   ├── libs/            # Utilities (chassis, config, toc)
│   │   │   ├── js/              # Client-side JavaScript
│   │   │   └── scss/            # Shared styles
│   │   ├── index.ts             # Package exports
│   │   └── package.json         # Published to npm
│   └── website/                 # Main chassis-ui.com site
│       ├── src/
│       │   ├── pages/           # File-based routing
│       │   ├── content/         # MDX/Markdown content
│       │   ├── components/      # Site-specific components
│       │   └── plugins/         # Vite plugins
│       └── astro.config.ts
├── vendor/                      # Git submodules
│   └── assets/                  # chassis-assets submodule
├── build/                       # Build scripts
│   ├── build-site.js            # Main build orchestrator
│   ├── sync-submodules.js       # Submodule management
│   └── vnu-jar.js               # HTML validation
└── _site/                       # Build output (outDir)
```

## 🌐 Separate Chassis Projects

Each Chassis project is an independent repository with:
- Its own npm package for distribution
- A `site/` folder for documentation (Astro-based)
- Dependency on `@chassis-ui/docs` (see `packages/docs/package.json` for the current published version)
- Independent Vercel deployment

> Not every project has migrated yet — `chassis-tokens` and `chassis-assets` still pin `@chassis-ui/icons`/`@chassis-ui/tokens` to `github:chassis-ui/*#app/docs` branch refs rather than semver ranges. `chassis-css` and `chassis-icons` are on the semver model described below.

```
chassis-tokens/                  # @chassis-ui/tokens
├── tokens/                      # Token definitions (JSON)
├── dist/                        # Built tokens (CSS, JSON, JS)
├── site/                        # Docs site (uses @chassis-ui/docs)
│   ├── astro.config.ts
│   ├── src/
│   │   ├── pages/               # Token-specific pages
│   │   ├── libs/                # Site-specific utilities
│   │   └── plugins/             # Site-specific plugins
│   └── content/                 # Token documentation
└── package.json                 # Depends on @chassis-ui/docs

chassis-css/                     # @chassis-ui/css
├── scss/                        # SCSS framework source
├── js/                          # JavaScript components
├── dist/                        # Built CSS/JS
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Depends on @chassis-ui/docs

chassis-assets/                  # @chassis-ui/assets
├── source/                      # Asset sources (fonts, images)
├── build/                       # Built assets
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Depends on @chassis-ui/docs

chassis-icons/                   # @chassis-ui/icons
├── icons/                       # Icon SVG sources
├── dist/                        # Built icon fonts/sprites
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Depends on @chassis-ui/docs

chassis-figma/                   # Figma component documentation
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Depends on @chassis-ui/docs
```

## 🌐 Unified Website Architecture

### Domain Structure
```
chassis-ui.com (Main Domain)
├── /                            → chassis-website (Main hub)
├── /css/*                       → chassis-css.vercel.app
├── /assets/*                    → chassis-assets.vercel.app
├── /icons/*                     → chassis-icons.vercel.app
├── /tokens/*                    → chassis-tokens.vercel.app
└── /figma/*                     → chassis-figma.vercel.app
```

### Deployment Targets
Each repository deploys independently to Vercel:

**Production:**
1. **chassis-website** → `chassis-website.vercel.app` (domain: `chassis-ui.com`)
2. **chassis-css** → `chassis-css.vercel.app`
3. **chassis-assets** → `chassis-assets.vercel.app`
4. **chassis-icons** → `chassis-icons.vercel.app`
5. **chassis-tokens** → `chassis-tokens.vercel.app`
6. **chassis-figma** → `chassis-figma.vercel.app`

**Staging:**
Same structure with `-staging` suffix (e.g., `chassis-css-staging.vercel.app`)

The main website uses Vercel rewrites to proxy project paths to project-specific sites (see [VERCEL_CONFIG.md](VERCEL_CONFIG.md)).


## 📦 Shared Package: @chassis-ui/docs

The `@chassis-ui/docs` package provides reusable infrastructure for all Chassis documentation sites:

### Exports

```typescript
// From packages/docs/index.ts
export * from './src/libs/chassis'    // Astro integration
export * from './src/libs/image'      // Image optimization
export * from './src/libs/layout'     // Layout utilities
export * from './src/libs/rehype'     // Markdown processing
export * from './src/libs/toc'        // Table of contents
export * from './src/libs/utils'      // General utilities
```

### Package Structure

```json
{
  "name": "@chassis-ui/docs",
  "version": "x.y.z",
  "exports": {
    ".": "./index.ts",
    "./components/*": "./src/components/*",
    "./shortcodes/*": "./src/components/shortcodes/*",
    "./layouts/*": "./src/layouts/*",
    "./libs/*": "./src/libs/*",
    "./js/*": "./src/js/*",
    "./scss/*": "./src/scss/*"
  }
}
```

### Usage in Project Sites

Each Chassis project's `site/astro.config.ts`:

```typescript
import { chassis } from './src/libs/astro'
import { getConfig } from './src/libs/config'
import { getSiteUrl } from '@chassis-ui/docs'  // From shared package

const site = getSiteUrl(getConfig())

export default defineConfig({
  integrations: [chassis()],
  site,
  // ...
})
```

## 🔄 Shared Assets Strategy

### Direct Package Dependencies

Chassis projects reference each other via published semver ranges rather than git-branch refs. `packages/website/package.json` depends on:

```json
// packages/website/package.json
{
  "devDependencies": {
    "@chassis-ui/css": "^x.y.z",
    "@chassis-ui/docs": "workspace:*",
    "@chassis-ui/icons": "^x.y.z",
    "@chassis-ui/tokens": "^x.y.z"
  }
}
```

`@chassis-ui/css`, `@chassis-ui/icons`, and `@chassis-ui/tokens` are published to npm from their own repos and are released in lockstep — they share the same MINOR version number release-to-release. Check `packages/website/package.json` for the exact current ranges rather than trusting a number written here. `@chassis-ui/docs` is versioned independently inside this monorepo (see `packages/docs/package.json`) and is not part of that coordinated release.

### Local Development via pnpm Workspace Overrides

For day-to-day development, `pnpm-workspace.yaml` at the repo root overrides two of those packages to resolve from sibling checkouts on disk instead of the npm registry:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
overrides:
  '@chassis-ui/css': link:../chassis-css
  '@chassis-ui/icons': link:../chassis-icons
```

This assumes `chassis-css` and `chassis-icons` are checked out as sibling directories next to `chassis-website` (e.g. `Sites/chassis-css`, `Sites/chassis-icons`, `Sites/chassis-website`). Editing either sibling repo is reflected immediately in `pnpm dev` without publishing. `@chassis-ui/tokens` is not overridden this way — it's always resolved from the published npm package. Remove or comment out the relevant override line if you need to test against the real published version of css/icons instead of a local checkout.

> Some sibling repos (`chassis-tokens`, `chassis-assets`) haven't migrated off the old `github:chassis-ui/<pkg>#app/docs` dependency style yet for their own internal cross-deps — that's a per-repo migration, independent of chassis-website's workspace overrides.

### CDN-Based Asset Sharing

For production sites, assets are available via CDN:

```html
<!-- Reference from deployed sites -->
<link href="https://chassis-css.vercel.app/dist/chassis.css" rel="stylesheet">
<script src="https://chassis-css.vercel.app/dist/chassis.js"></script>
```

### Font and Icon Sharing

```css
/* Shared font imports from assets */
@import url('https://chassis-assets.vercel.app/fonts/inter.css');

/* Icon fonts from icons project */
@import url('https://chassis-icons.vercel.app/dist/icons.css');
```

## 🌟 Architecture Benefits

✅ **Shared Components**: Single source of truth for documentation UI  
✅ **Independent Development**: Each project can work autonomously  
✅ **Unified Experience**: Users see one cohesive website  
✅ **Version Control**: Shared package ensures consistency across projects  
✅ **Scalable**: Easy to add new projects to the ecosystem  
✅ **Performance**: Each site optimized independently  
✅ **Monorepo Benefits**: website and docs packages share tooling  

## 🔄 Development Workflow

### Working on @chassis-ui/docs

1. Make changes in `packages/docs`
2. Bump version in `packages/docs/package.json`
3. Commit and push to chassis-website repo
4. Other projects update their dependency: `pnpm add @chassis-ui/docs@latest`

### Working on Individual Projects

1. Clone project: `git clone https://github.com/chassis-ui/css.git`
2. Install: `pnpm install` (installs @chassis-ui/docs)
3. Develop: `pnpm dev` (runs site development server)
4. Build: `pnpm build` (builds both package and site)

### Local Development Cross-Project

To test docs changes with a project locally:

```bash
# In packages/docs
pnpm link --global

# In chassis-css (or another project)
pnpm link --global @chassis-ui/docs
```

## 🛠 Build System

### Monorepo Build (chassis-website)

```bash
# Root scripts (defined in root package.json)
pnpm build              # Build entire site
pnpm dev                # Start website dev server
pnpm astro:dev          # Alias to packages/website dev

# Website-specific
cd packages/website
pnpm dev                # Start dev server
pnpm build              # Build to ../../_site

# Docs package (no build, TypeScript only)
cd packages/docs
pnpm i                  # Install dependencies
```

### Individual Project Build

```bash
# In chassis-css, chassis-tokens, etc.
pnpm build              # Builds package + site
pnpm dev                # Runs package build watch + site dev
pnpm dist               # Builds only the package (CSS, tokens, etc.)
pnpm site:build         # Builds only the site (to _site folder)
```

## 🚀 Deployment Pipeline

### Automatic via GitHub Actions + Vercel

Deploys themselves are triggered directly by Vercel's git integration (push to `main` → production, push to `staging` → staging) — no Actions workflow performs the deploy. chassis-website's own `.github/workflows/` does three other things:
- **`ci.yml`** — ESLint, Stylelint, Prettier, `astro check`, and `pnpm audit` on PRs against `main`/`staging` and on push to `staging`
- **`lighthouse.yml`** — runs Lighthouse CI against the production or staging URL on `deployment_status` events (or manually via `workflow_dispatch`)
- **`publish-packages.yml`** — on push to `main`, detects a version bump in `packages/docs/package.json` and publishes `@chassis-ui/docs` to npm automatically

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

### Environment Detection

Vercel rewrites use host header detection (see [VERCEL_CONFIG.md](VERCEL_CONFIG.md)):
- Request to `chassis-ui.com/css/` → routes to `chassis-css.vercel.app`
- Request to `staging.chassis-ui.com/css/` → routes to `chassis-css-staging.vercel.app`

### Search Engine Indexing

Only the production custom domain (`chassis-ui.com`) is indexable. Staging and every direct `*.vercel.app` host are excluded via `robots.txt` and (for staging) `X-Robots-Tag: noindex` headers. See [INDEXING.md](INDEXING.md).

## 🧩 Key Concepts

### Monorepo vs Multi-Repo

**Monorepo (chassis-website):**
- Shared documentation infrastructure
- Main website
- Shared build tools and configuration

**Multi-Repo (ecosystem):**
- Independent package development
- Isolated version control
- Team autonomy
- Clear package boundaries

### Why This Hybrid Approach?

1. **Consistency**: Shared UI/UX via @chassis-ui/docs
2. **Independence**: Projects can release on their own schedule
3. **Maintainability**: Documentation updates benefit all projects
4. **Collaboration**: Easy to contribute to shared components
5. **Flexibility**: Projects can override/extend shared components

## 📝 Git Submodules

Currently only `vendor/assets` is a submodule in chassis-website:

```bash
# Check submodule status
git submodule status

# Update submodule
git submodule update --remote vendor/assets
```

This allows the main website to directly include chassiss-assets content.

## 🔧 Configuration Files

### Main Site (chassis-website/vercel.json)
- Handles proxy routing to all project sites
- Environment-based rewrites (production vs staging)
- Static file serving configuration

### Project Sites (vercel.json in each project)
- Standard Astro build configuration
- Site-specific rewrites if needed

## 🛠 Maintenance

- **DNS**: `chassis-ui.com` points to chassis-website deployment
- **SSL**: Managed by Vercel for all sites
- **Monitoring**: Each site monitored independently  
- **Analytics**: Can track across unified domain
- **Dependencies**: Regularly update @chassis-ui/docs in all projects

