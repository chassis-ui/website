# Chassis Ecosystem Architecture

> **Scope:** this document covers the *shape* of the ecosystem and the *why* behind its
> non-obvious decisions (why a project is a submodule instead of an npm package, why an
> override mechanism exists). For step-by-step instructions, see [DEVELOPMENT.md](DEVELOPMENT.md),
> [DEPLOYMENT.md](DEPLOYMENT.md), [VERCEL_CONFIG.md](VERCEL_CONFIG.md), and [INDEXING.md](INDEXING.md).

## Overview

Chassis is a **hybrid monorepo + multi-repository** design system:

- **chassis-website** (this repo) is a pnpm monorepo containing `packages/website` (the
  main chassis-ui.com site) and `packages/docs` (the shared `@chassis-ui/docs` package
  used by every Chassis project's documentation site).
- **chassis-tokens, chassis-css, chassis-assets, chassis-icons, chassis-figma** are each
  independent repositories, developed and released on their own schedule.
- All of it is presented as one site at `chassis-ui.com` via Vercel proxy routing — see
  [DEPLOYMENT.md](DEPLOYMENT.md) for the URL map and [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
  for how the rewrites work.

## Monorepo Structure: chassis-website

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

## Sibling Projects & Distribution Models

Each sibling project has:
- A `site/` folder for documentation (Astro-based), depending on `@chassis-ui/docs` (see
  `packages/docs/package.json` for the current published version)
- Independent Vercel deployment for that docs site

How each project's actual output reaches consumers differs, and this is a deliberate
design choice per project, not an inconsistency to be fixed:

- **chassis-tokens, chassis-css, chassis-icons** each publish an npm package
  (`@chassis-ui/tokens`, `@chassis-ui/css`, `@chassis-ui/icons`) under semver.
  `chassis-website` and other Node consumers install these from the npm registry (see
  Dependency Model below).
- **chassis-assets** ships fonts, images, and other binary assets that are also consumed
  by non-Node clients — e.g. native iOS and Android apps — which have no use for an npm
  package. It is never published to npm; `chassis-website` pulls it in as a git submodule
  (`vendor/assets`, pinned to the `app/docs` branch) and other sites/apps consume it via
  CDN (see Runtime Asset Sharing below).
- **chassis-figma** is documentation only — it has no distributable package, npm or
  otherwise.

```
chassis-tokens/                  # @chassis-ui/tokens (npm package, semver)
├── tokens/                      # Token definitions (JSON)
├── dist/                        # Built tokens (CSS, JSON, JS)
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Publishes @chassis-ui/tokens; site depends on @chassis-ui/docs

chassis-css/                     # @chassis-ui/css (npm package, semver)
├── scss/                        # SCSS framework source
├── js/                          # JavaScript components
├── dist/                        # Built CSS/JS
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Publishes @chassis-ui/css; site depends on @chassis-ui/docs

chassis-assets/                  # Fonts, images, and other binary assets — no npm package
├── source/                      # Asset sources (fonts, images)
├── build/                       # Built assets
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Site depends on @chassis-ui/docs; assets themselves are distributed via git submodule + CDN, not npm

chassis-icons/                   # @chassis-ui/icons (npm package, semver)
├── icons/                       # Icon SVG sources
├── dist/                        # Built icon fonts/sprites
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Publishes @chassis-ui/icons; site depends on @chassis-ui/docs

chassis-figma/                   # Figma component documentation — no distributable package
├── site/                        # Docs site (uses @chassis-ui/docs)
└── package.json                 # Depends on @chassis-ui/docs
```

## Dependency Model

### Published dependencies

Of the four sibling projects, the three that publish an npm package are referenced from
`chassis-website` via semver ranges (`chassis-assets` isn't an npm package at all — see
above). `packages/website/package.json` depends on:

```json
{
  "devDependencies": {
    "@chassis-ui/css": "^x.y.z",
    "@chassis-ui/docs": "workspace:*",
    "@chassis-ui/icons": "^x.y.z",
    "@chassis-ui/tokens": "^x.y.z"
  }
}
```

`@chassis-ui/css`, `@chassis-ui/icons`, and `@chassis-ui/tokens` are published from their
own repos and released in lockstep — they share the same MINOR version number
release-to-release. Check `packages/website/package.json` for the exact current ranges
rather than trusting a number written here. `@chassis-ui/docs` is versioned
independently inside this monorepo (see `packages/docs/package.json`) and isn't part of
that coordinated release.

### Local Development via pnpm Workspace Overrides

`@chassis-ui/css`, `@chassis-ui/icons`, and `@chassis-ui/tokens` normally resolve from
the npm registry like any other dependency — `pnpm-workspace.yaml` carries no overrides
by default. The exception is parallel development: when a change in `chassis-css` or
`chassis-icons` needs to be exercised in `chassis-website` before it's published, add a
`link:` override pointing at a sibling checkout on disk:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
overrides:
  '@chassis-ui/css': link:../chassis-css
  '@chassis-ui/icons': link:../chassis-icons
```

This assumes `chassis-css` and `chassis-icons` are checked out as sibling directories
next to `chassis-website` (e.g. `Sites/chassis-css`, `Sites/chassis-icons`,
`Sites/chassis-website`). With the override in place, editing either sibling repo is
reflected immediately in `pnpm dev` without publishing. `@chassis-ui/tokens` is not
overridden this way — it's always resolved from the published npm package. Remove the
override once the change is published so `chassis-website` goes back to resolving
`@chassis-ui/css`/`@chassis-ui/icons` from the registry.

`chassis-assets` isn't part of this mechanism at all — it's never an npm dependency of
`chassis-website` in the first place, so local iteration on it happens by editing the
`vendor/assets` submodule checkout directly.

(For the separate case of testing an unpublished `@chassis-ui/docs` change inside a
*sibling* project, see "Testing Local Changes Across Projects" in
[DEVELOPMENT.md](DEVELOPMENT.md) — that's a `pnpm link`, not a workspace override, since
`@chassis-ui/docs` flows out of this repo rather than into it.)

## Shared Package: @chassis-ui/docs

`@chassis-ui/docs` provides the reusable infrastructure every Chassis documentation site
builds on: Astro components/layouts, image and markdown processing, table-of-contents
generation, and general utilities.

```typescript
// From packages/docs/index.ts
export * from './src/libs/chassis'    // Astro integration
export * from './src/libs/image'      // Image optimization
export * from './src/libs/layout'     // Layout utilities
export * from './src/libs/rehype'     // Markdown processing
export * from './src/libs/toc'        // Table of contents
export * from './src/libs/utils'      // General utilities
```

Each project site imports it the same way, e.g. `chassis-css/site/astro.config.ts`:

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

## Runtime Asset Sharing

Independent of how a project is installed at dev/build time (npm vs. submodule),
deployed sites reference each other's *built output* directly over CDN:

```html
<!-- CSS/JS from chassis-css's own deployment -->
<link href="https://chassis-css.vercel.app/dist/chassis.css" rel="stylesheet">
<script src="https://chassis-css.vercel.app/dist/chassis.js"></script>
```

```css
/* Fonts from chassis-assets, icon fonts from chassis-icons */
@import url('https://chassis-assets.vercel.app/fonts/inter.css');
@import url('https://chassis-icons.vercel.app/dist/icons.css');
```

## Deployment & Routing

Each project (including chassis-website itself) deploys independently to Vercel, and
`chassis-ui.com` proxies `/css/*`, `/tokens/*`, `/assets/*`, `/icons/*`, `/figma/*` to the
corresponding project's deployment, with a staging mirror per project.

- Full URL table and release process: [DEPLOYMENT.md](DEPLOYMENT.md)
- How the host-header rewrites actually work: [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
- Which hosts are indexable and why: [INDEXING.md](INDEXING.md)

## Git Submodules

`vendor/assets` is currently the only submodule in chassis-website, tracking
`chassis-ui/assets` on the `app/docs` branch:

```bash
git submodule status
git submodule update --remote vendor/assets
```

See "Working with Submodules" in [DEVELOPMENT.md](DEVELOPMENT.md) for the full workflow,
including how `pnpm build`/`pnpm dev` sync it automatically via `build/sync-submodules.js`.

## Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) — setup, day-to-day workflow, troubleshooting
- [DEPLOYMENT.md](DEPLOYMENT.md) — environments, release process, GitHub Actions
- [VERCEL_CONFIG.md](VERCEL_CONFIG.md) — proxy routing mechanics
- [INDEXING.md](INDEXING.md) — search engine indexing rules per host
- [CHASSIS_CSS.md](CHASSIS_CSS.md) — Bootstrap → Chassis CSS migration guide
