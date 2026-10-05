# Chassis Ecosystem Architecture

> **Scope:** this document covers the _shape_ of the ecosystem and the _why_ behind its
> non-obvious decisions (why a project is a submodule instead of an npm package, why an
> override mechanism exists). Setup and commands are in [CONTRIBUTING.md](../CONTRIBUTING.md).
> How the parts work is in [DEVELOPMENT.md](DEVELOPMENT.md), [DEPLOYMENT.md](DEPLOYMENT.md),
> [VERCEL_CONFIG.md](VERCEL_CONFIG.md), and [INDEXING.md](INDEXING.md).

## Overview

Chassis is a **hybrid monorepo + multi-repository** design system:

- **chassis-website** (this repo) is a pnpm monorepo containing `packages/website` (the
  main chassis-ui.com site) and `packages/docs` (the shared `@chassis-ui/docs` package
  used by every Chassis project's documentation site).
- **chassis-tokens, chassis-css, chassis-icons, chassis-assets, chassis-figma,
  chassis-react** are each independent repositories, developed and released on their own
  schedule.
- All of it is presented as one site at `chassis-ui.com` via Vercel proxy routing — see
  [DEPLOYMENT.md](DEPLOYMENT.md) for the URL map and [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
  for how the rewrites work.

## Monorepo Structure: chassis-website

```
chassis-website/
├── packages/
│   ├── docs/                    # @chassis-ui/docs, published to npm
│   │   ├── src/
│   │   │   ├── components/      # Shared Astro components and MDX shortcodes
│   │   │   ├── layouts/         # Page layouts
│   │   │   ├── libs/            # Config, paths, remark plugins, TOC, utilities
│   │   │   ├── js/              # Client-side scripts
│   │   │   ├── scss/            # Shared styles
│   │   │   └── integration.ts   # The Astro integration
│   │   ├── starter/             # Minimal site that CI builds from the packed package
│   │   ├── test/                # Unit and component tests
│   │   └── index.ts             # The root entry point
│   └── website/                 # chassis-ui.com
│       ├── content/             # Blog posts, the docs guide, callouts
│       ├── data/                # Sidebar of the docs guide
│       ├── src/                 # Pages, components, layouts, SCSS, the site's integration
│       ├── static/              # Files copied to the root of the site
│       ├── config.yml           # Site configuration, read by the package
│       └── astro.config.ts
├── examples/                    # Workspace packages, served under /examples/
│   └── vanilla-html/
├── api/                         # Vercel functions: the contact form and the CSP reports
├── vendor/
│   └── assets/                  # chassis-assets submodule
├── build/                       # Build, validation and release scripts
└── _site/                       # Build output
```

## Sibling Projects & Distribution Models

Each sibling project has an Astro documentation site that depends on `@chassis-ui/docs`
from npm, and deploys it to Vercel on its own. Where the site lives differs:

| Project        | Site            | What it distributes                                                |
| -------------- | --------------- | ------------------------------------------------------------------ |
| chassis-tokens | `packages/site` | `@chassis-ui/tokens` on npm, from `packages/tokens`                |
| chassis-css    | `packages/site` | `@chassis-ui/css` on npm, from `packages/css`                      |
| chassis-react  | `packages/site` | `@chassis-ui/react` on npm, from `packages/react`                  |
| chassis-assets | `packages/site` | Fonts, images and other assets, from `packages/assets`. Not on npm |
| chassis-icons  | `site/`         | `@chassis-ui/icons` on npm, from the repository root               |
| chassis-figma  | `site/`         | Nothing. Documentation of the Figma libraries only                 |

tokens, css, react and assets are pnpm workspaces with the package and the site side by
side. icons and figma are single packages with the site in a folder.

How each project's output reaches consumers differs, and this is a deliberate design
choice per project, not an inconsistency to be fixed:

- **chassis-tokens, chassis-css, chassis-icons, chassis-react** publish npm packages under
  semver. `chassis-website` and other Node consumers install them from the npm registry
  (see Dependency Model below).
- **chassis-assets** ships fonts, images, and other binary assets that are also consumed
  by non-Node clients — e.g. native iOS and Android apps — which have no use for an npm
  package. It is never published to npm; every Chassis site, this one included, pulls it in
  as a git submodule (`vendor/assets`, at a pinned commit of the `app/docs` branch) and
  builds it (see Git Submodules below).
- **chassis-figma** is documentation only — it has no distributable package, npm or
  otherwise.

## Dependency Model

### Published dependencies

The website uses three of the sibling packages, from npm and by semver range.
`chassis-assets` isn't an npm package at all — see above. `packages/website/package.json`
depends on:

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
own repos, each on its own version: the numbers are not coordinated. Check
`packages/website/package.json` for the exact current ranges rather than trusting a
number written here. `@chassis-ui/docs` is versioned inside this monorepo (see
`packages/docs/package.json`), and the "Compatibility" table of its README says which
versions of `@chassis-ui/css` and Astro each release works with.

### Local Development via pnpm Workspace Overrides

`@chassis-ui/css`, `@chassis-ui/icons`, and `@chassis-ui/tokens` resolve from the npm
registry. `pnpm-workspace.yaml` carries no overrides. To try an unpublished change of
`chassis-css` or `chassis-icons` in the website, add a `link:` override to a sibling
checkout for the time of the test. [DEVELOPMENT.md](DEVELOPMENT.md#using-an-unpublished-chassis-css-or-icons)
shows how.

`chassis-assets` isn't part of this mechanism — it's never an npm dependency of
`chassis-website`. Changes to it are made in its own repository, and reach this one when
the `vendor/assets` pin moves.

To try an unpublished `@chassis-ui/docs` in a sibling project, pack it and install the
tarball there. See "Trying a change in a sibling project" in [DEVELOPMENT.md](DEVELOPMENT.md).

## Shared Package: @chassis-ui/docs

`@chassis-ui/docs` provides what every Chassis documentation site is built from: layouts,
components, MDX shortcodes, styles, and the code that reads a site's configuration.

A site connects to the package through one Astro integration. The integration reads the
site's `config.yml` and `data/sidebar.yml`, validates them against schemas that the
package owns, and hands them to the layouts and components. It also sets `site` and
`markdown` of the Astro config and imports the shortcodes into every MDX file.

```typescript
// astro.config.ts of a site
import { loadConfig } from '@chassis-ui/docs'
import { chassisDocs } from '@chassis-ui/docs/integration'
import { chassis } from './src/libs/astro'
import { siteConfigSchema } from './src/libs/config'

const root = import.meta.dirname
const config = loadConfig({ root, schema: siteConfigSchema })

export default defineConfig({
  integrations: [chassisDocs({ config }), chassis({ config, root })]
  // ...
})
```

The package has four entry points:

| Import path                    | For                                                                  |
| ------------------------------ | -------------------------------------------------------------------- |
| `@chassis-ui/docs`             | Library functions that work anywhere, including `astro.config.ts`    |
| `@chassis-ui/docs/integration` | The integration                                                      |
| `@chassis-ui/docs/schema`      | The schemas of `config.yml`, the sidebar and the content collections |
| `@chassis-ui/docs/site`        | What pages and components read from the site, such as `getConfig()`  |

It also installs the `chassis-docs` command, with the build steps that every site shares:
building and moving the `vendor/assets` submodule, and validating the built HTML. A site
calls it from the scripts of its `package.json` instead of keeping copies of those scripts.

What stays in each site is what differs between sites: `src/libs/astro.ts`, which copies
the static files and adds `mdx()` and `sitemap()`, the schema of the site's own config
keys, and plugins of its own.

Until 0.6.0 the package imported five modules from the site through a `@libs/*` path
alias, and each site carried its own copy of them. The copies drifted. The record of that
is in [CONTRACT_REVIEW.md](CONTRACT_REVIEW.md). The package README is the reference for the
current contract.

## Shared Static Files

No site loads a file from another project's deployment by its URL. Each site copies what
it needs into its own build, under `/static/`: the compiled CSS and JavaScript of
`@chassis-ui/css` and the icon font of `@chassis-ui/icons` from `node_modules`, and the
fonts and images of chassis-assets from the docs build of `vendor/assets`.
`src/libs/astro.ts` of the site does the copying. See "What the site copies into
`public/`" in [DEVELOPMENT.md](DEVELOPMENT.md).

On chassis-ui.com every site requests these files from the same path, `/static/…`, and
the main site sends each request to the deployment of the site that asked, by the
`Referer` header. One URL for all sites lets the browser keep one copy of the files they
share. See "`/static/*` rewrites" in [VERCEL_CONFIG.md](VERCEL_CONFIG.md).

## Deployment & Routing

Each project (including chassis-website itself) deploys independently to Vercel, and
`chassis-ui.com` proxies `/css/*`, `/tokens/*`, `/assets/*`, `/icons/*`, `/figma/*` and
`/react/*` to the corresponding project's deployment, with a staging mirror per project.
None of the staging deployments is behind Vercel's deployment protection, which would send
a visitor of the staging site to Vercel's login.

- Full URL table and release process: [DEPLOYMENT.md](DEPLOYMENT.md)
- How the host-header rewrites actually work: [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
- Which hosts are indexable and why: [INDEXING.md](INDEXING.md)

## Git Submodules

`vendor/assets` is the only submodule in chassis-website. It is `chassis-ui/assets` at a
pinned commit of the `app/docs` branch. Builds use the pinned commit, so the same commit of
this repository always builds the same site. `pnpm vendor` builds it, and
`pnpm sync-submodules` moves the pin. Both run a command of `@chassis-ui/docs`, so every
site handles the submodule the same way. See "The `vendor/assets` submodule" in
[DEVELOPMENT.md](DEVELOPMENT.md).

## Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) — how the build, the submodule and the package work, troubleshooting
- [DEPLOYMENT.md](DEPLOYMENT.md) — environments, release process, GitHub Actions
- [VERCEL_CONFIG.md](VERCEL_CONFIG.md) — proxy routing mechanics
- [INDEXING.md](INDEXING.md) — search engine indexing rules per host
- [CHASSIS_CSS.md](CHASSIS_CSS.md) — Bootstrap → Chassis CSS migration guide
