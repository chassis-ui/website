# Chassis Ecosystem Architecture

> **Scope:** this document covers the _shape_ of the ecosystem and the _why_ behind its
> non-obvious decisions (why the assets are a pinned release instead of an npm package, why an
> override mechanism exists). Setup and commands are in [CONTRIBUTING.md](../CONTRIBUTING.md).
> How the parts work is in [DEVELOPMENT.md](DEVELOPMENT.md), [DEPLOYMENT.md](DEPLOYMENT.md),
> [VERCEL_CONFIG.md](VERCEL_CONFIG.md), and [INDEXING.md](INDEXING.md).

## Overview

Chassis is a **hybrid monorepo + multi-repository** design system:

- **chassis-ui/website** (this repo) is a pnpm monorepo containing `packages/website` (the
  main chassis-ui.com site) and `packages/docs` (the shared `@chassis-ui/docs` package
  used by every Chassis project's documentation site).
- **chassis-ui/tokens, chassis-ui/website-tokens, chassis-ui/css, chassis-ui/icons,
  chassis-ui/website-icons, chassis-ui/assets, chassis-ui/figma, chassis-ui/react** are each
  independent repositories, developed and released on their own schedule.
- All of it is presented as one site at `chassis-ui.com` via Vercel proxy routing — see
  [DEPLOYMENT.md](DEPLOYMENT.md) for the URL map and [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
  for how the rewrites work.

## Monorepo Structure: chassis-ui/website

```
.
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
├── api/                         # Vercel functions: the contact form and the CSP reports
├── vendor/
│   ├── assets.json              # the pinned release of chassis-ui/website-assets
│   └── assets/                  # unpacked from it, not committed
├── build/                       # Build, validation and release scripts
└── _site/                       # Build output
```

## Sibling Projects & Distribution Models

Each sibling project has an Astro documentation site that depends on `@chassis-ui/docs`
from npm, and deploys it to Vercel on its own. Where the site lives differs:

| Project           | Site            | What it distributes                                                    |
| ----------------- | --------------- | ---------------------------------------------------------------------- |
| chassis-ui/tokens | `packages/site` | `@chassis-ui/tokens` on npm, the token builder, from `packages/tokens` |
| chassis-ui/css    | `packages/site` | `@chassis-ui/css` on npm, from `packages/css`                          |
| chassis-ui/react  | `packages/site` | `@chassis-ui/react` on npm, from `packages/react`                      |
| chassis-ui/assets | `packages/site` | Fonts, images and other assets, from `packages/assets`. Not on npm     |
| chassis-ui/icons  | `site/`         | `@chassis-ui/icons` on npm, the icon builder, from the repository root |
| chassis-ui/figma  | `site/`         | Nothing. Documentation of the Figma libraries only                     |

tokens, css, react and assets are pnpm workspaces with the package and the site side by
side. icons and figma are single packages with the site in a folder.

The vanilla HTML example is a repository too,
[chassis-ui/vanilla-example](https://github.com/chassis-ui/vanilla-example). It is not a
documentation site: it uses no `@chassis-ui/docs`, and it is deployed as a website per
brand, at `example-1.chassis-ui.com` and `example-2.chassis-ui.com`, outside the proxy of
chassis-ui.com. The examples page of the website links it.

How each project's output reaches consumers differs, and this is a deliberate design
choice per project, not an inconsistency to be fixed:

- **chassis-ui/website-tokens, chassis-ui/css, chassis-ui/website-icons, chassis-ui/react** publish npm packages
  under semver. `chassis-ui/website` and other Node consumers install them from the npm registry
  (see Dependency Model below). **chassis-ui/tokens** and **chassis-ui/icons** publish the
  builders that chassis-ui/website-tokens and chassis-ui/website-icons are built with, and this
  repository does not install them.
- **chassis-ui/website-assets** holds the fonts, images and other binary assets of the Chassis
  sites and apps, which non-Node clients, such as native iOS and Android apps, read too. It
  releases an archive per platform, app and brand. Every Chassis site, this one included, pins
  a release and downloads the archive of its brand (see The assets below).
  **chassis-ui/assets** is the build, on npm as `@chassis-ui/assets`; the sites do not use it.
- **chassis-ui/figma** is documentation only — it has no distributable package, npm or
  otherwise.

## Dependency Model

### Published dependencies

The website uses three of the sibling packages, from npm and by semver range.
`chassis-ui/assets` isn't an npm package at all — see above. `packages/website/package.json`
depends on:

```json
{
  "devDependencies": {
    "@chassis-ui/css": "^x.y.z",
    "@chassis-ui/docs": "workspace:*",
    "@chassis-ui/website-icons": "^x.y.z",
    "@chassis-ui/website-tokens": "^x.y.z"
  }
}
```

`@chassis-ui/css`, `@chassis-ui/website-icons`, and `@chassis-ui/website-tokens` are published from
their own repos, each on its own version: the numbers are not coordinated. Check
`packages/website/package.json` for the exact current ranges rather than trusting a
number written here. `@chassis-ui/docs` is versioned inside this monorepo (see
`packages/docs/package.json`), and the "Compatibility" table of its README says which
versions of `@chassis-ui/css` and Astro each release works with.

### Local Development via pnpm Workspace Overrides

`@chassis-ui/css`, `@chassis-ui/website-icons`, and `@chassis-ui/website-tokens` resolve from the npm
registry. `pnpm-workspace.yaml` carries no overrides. To try an unpublished change of
`chassis-ui/css` or `chassis-ui/website-icons` in the website, add a `link:` override to your
checkout of it for the time of the test. [DEVELOPMENT.md](DEVELOPMENT.md#using-an-unpublished-chassis-css-or-icons)
shows how.

`chassis-ui/website-assets` isn't part of this mechanism — it's not an npm dependency of
`chassis-ui/website`. Changes to it are made in its own repository, and reach this one when
the pin in `vendor/assets.json` moves.

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
unpacking the pinned assets and moving the pin, and validating the built HTML. A site
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
`@chassis-ui/css` and the icon font of `@chassis-ui/website-icons` from `node_modules`, and the
fonts and images of chassis-ui/website-assets from `vendor/assets`.
`src/libs/astro.ts` of the site does the copying. See "What the site copies into
`public/`" in [DEVELOPMENT.md](DEVELOPMENT.md).

On chassis-ui.com every site requests these files from the same path, `/static/…`, and
the main site sends each request to the deployment of the site that asked, by the
`Referer` header. One URL for all sites lets the browser keep one copy of the files they
share. See "`/static/*` rewrites" in [VERCEL_CONFIG.md](VERCEL_CONFIG.md).

## Deployment & Routing

Each project (including chassis-ui/website itself) deploys independently to Vercel, and
`chassis-ui.com` proxies `/css/*`, `/tokens/*`, `/assets/*`, `/icons/*`, `/figma/*` and
`/react/*` to the corresponding project's deployment, with a staging mirror per project.
None of the staging deployments is behind Vercel's deployment protection, which would send
a visitor of the staging site to Vercel's login.

- Full URL table and release process: [DEPLOYMENT.md](DEPLOYMENT.md)
- How the host-header rewrites actually work: [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
- Which hosts are indexable and why: [INDEXING.md](INDEXING.md)

## The assets

chassis-ui/website has no submodule. `vendor/assets.json` pins a release of
chassis-ui/website-assets with the digest of each web archive, so the same commit of this
repository always builds the same site. `pnpm vendor` unpacks the archive, and
`pnpm sync-assets` moves the pin. Both run a command of `@chassis-ui/docs`, so every site
handles the assets the same way. See "The assets" in [DEVELOPMENT.md](DEVELOPMENT.md).

## Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) — how the build, the assets and the package work, troubleshooting
- [DEPLOYMENT.md](DEPLOYMENT.md) — environments, release process, GitHub Actions
- [VERCEL_CONFIG.md](VERCEL_CONFIG.md) — proxy routing mechanics
- [INDEXING.md](INDEXING.md) — search engine indexing rules per host
- [CHASSIS_CSS.md](CHASSIS_CSS.md) — Bootstrap → Chassis CSS migration guide
