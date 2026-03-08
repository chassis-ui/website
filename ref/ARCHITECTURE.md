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
- Dependency on `@chassis-ui/docs@^0.1.3`
- Independent Vercel deployment

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
├── /docs/css/*                  → chassis-css.vercel.app
├── /docs/assets/*               → chassis-assets.vercel.app  
├── /docs/icons/*                → chassis-icons.vercel.app
├── /docs/tokens/*               → chassis-tokens.vercel.app
└── /docs/figma/*                → chassis-figma.vercel.app
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

The main website uses Vercel rewrites to proxy `/docs/*` paths to project-specific sites (see [VERCEL_CONFIG.md](VERCEL_CONFIG.md)).


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
  "version": "0.1.3",
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

Chassis projects reference each other as dependencies:

```json
// packages/website/package.json
{
  "dependencies": {
    "@chassis-ui/css": "github:chassis-ui/css#app/docs",
    "@chassis-ui/icons": "github:chassis-ui/icons#app/docs",
    "@chassis-ui/tokens": "github:chassis-ui/tokens#app/docs",
    "@chassis-ui/docs": "workspace:*"
  }
}
```

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

### Automatic via GitHub Actions

Each project has its own CI/CD:
- Push to `main` → production deployment
- Push to `staging` → staging deployment
- Vercel handles builds automatically

### Environment Detection

Vercel rewrites use host header detection (see [VERCEL_CONFIG.md](VERCEL_CONFIG.md)):
- Request to `chassis-ui.com/docs/css/` → routes to `chassis-css.vercel.app`
- Request to `staging.chassis-ui.com/docs/css/` → routes to `chassis-css-staging.vercel.app`

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

