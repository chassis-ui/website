# @chassis-ui/docs

> Shared Astro layouts, components, and utilities for Chassis documentation sites.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![npm](https://img.shields.io/npm/v/@chassis-ui/docs.svg)](https://www.npmjs.com/package/@chassis-ui/docs)

## Overview

`@chassis-ui/docs` powers every documentation site in the Chassis ecosystem: the main `chassis-ui.com` website and the docs of `chassis-css`, `chassis-tokens`, `chassis-icons`, `chassis-figma`, `chassis-assets` and `chassis-react`. It ships layouts, navigation components, shortcodes for MDX, content-processing utilities and SCSS, so each site stays consistent without copying code.

> [!NOTE] This package is developed inside the [`chassis-website`](https://github.com/chassis-ui/website) monorepo at `packages/docs/` and published to npm. Source, issues, and pull requests live in that repository.

Coming from 0.5? See [UPGRADING.md](UPGRADING.md).

## Installation

```sh
pnpm add @chassis-ui/docs
```

### Peer Dependencies

```json
{
  "@astrojs/markdown-remark": "^7.0.0",
  "@chassis-ui/css": "^0.5.0-0",
  "@pagefind/component-ui": "^1.0.0",
  "@shikijs/transformers": "^4.3.1",
  "astro": "^7.0.0",
  "htmlparser2": "^12.0.0",
  "rehype-autolink-headings": "^7.0.0",
  "sass": "^1.101.0",
  "shiki": "^4.3.1"
}
```

A site also installs `@astrojs/mdx` and the rest of the Chassis stack, `@chassis-ui/tokens` and `@chassis-ui/icons`.

## Setup

A site needs four things before it can use the layouts: the integration, a `config.yml`, two content collections and the static files that the layouts link to.

The [starter site](starter/) has all four. Copy it to start a new site, and follow its README. CI builds it from the packed package on every push, so it works with the version of the package next to it.

### 1. Add the integration

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { chassisDocs } from '@chassis-ui/docs/integration'

export default defineConfig({
  integrations: [chassisDocs(), mdx()]
})
```

The integration:

- reads and validates `config.yml` and `data/sidebar.yml`, and gives them to the layouts and components
- sets `site` from `baseURL`, unless the Astro config sets `site` itself
- sets `markdown`: heading anchors, Shiki themes, and the `[[config:key]]` and `[[docsref:/path]]` replacements
- imports the shortcodes into every MDX file
- fails the build when a `[[docsref:]]` link points to a page that was not built
- makes the scripts of the package and of the site share one copy of `@chassis-ui/css`, so that no listener is registered twice
- puts the default design tokens of `@chassis-ui/css` on the Sass load path, which the styles need

It finds every file from the Astro root, the directory that holds `astro.config.ts`. The working directory of the build does not matter.

| Option           | Default                                  | Meaning                                                                                            |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `config`         | none                                     | The config, when the site has loaded it itself with `loadConfig()`                                 |
| `configFile`     | `'config.yml'`                           | Path of the config file, from the site's root                                                      |
| `configSchema`   | `configSchema`                           | Schema of the config file. See [keys of your own](#keys-of-your-own)                               |
| `sidebarFile`    | `'data/sidebar.yml'`, when it exists     | Path of the sidebar data, or `false` for no sidebar                                                |
| `styles`         | `['src/scss/docs.scss']`, when it exists | Stylesheets that every page loads. Without one, the package's own styles are loaded                |
| `shortcodes`     | all                                      | `{ dir, include, exclude }`. See [shortcodes](#shortcodes)                                         |
| `markdown`       | none                                     | `{ remarkPlugins, rehypePlugins, remarkRehype }` of the site. They run after the package's plugins |
| `brokenDocsrefs` | `'error'`                                | `'error'`, `'warn'` or `'ignore'`                                                                  |

#### Tokens of your own

The styles of `@chassis-ui/css` load the design tokens as `chassis-tokens`. The integration adds the folder with the default one, `scss/vendor` of `@chassis-ui/css`, as the last Sass load path. A site with tokens of its own adds the folder of its `_chassis-tokens.scss` in its Astro config, which comes first:

```ts
// astro.config.ts
export default defineConfig({
  vite: {
    css: { preprocessorOptions: { scss: { loadPaths: ['src/scss/tokens'] } } }
  }
})
```

### 2. Write `config.yml`

```yaml
title: 'Chassis - CSS'
subtitle: 'A Tokenized CSS Framework'
description: 'An open-source, tokenized CSS framework.'
authors: 'Ozgur Gunes'
baseURL: 'https://chassis-ui.com/css'
docsPath: '/css/docs'
repo: 'https://github.com/chassis-ui/css'
currentVersion: '0.5.2'
```

| Key                                           | Required | Meaning                                                                                           |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `title`, `subtitle`, `description`, `authors` | yes      | Used in the page title and the meta tags                                                          |
| `baseURL`                                     | yes      | Canonical URL of the site                                                                         |
| `docsPath`                                    | yes      | URL path of the docs pages. Starts with `/`                                                       |
| `repo`                                        | yes      | URL of the repository                                                                             |
| `currentVersion`                              | yes      | Version that the site documents. Links to source files use the tag `v<currentVersion>`            |
| `githubOrg`                                   | no       | GitHub organisation name, not a URL. The header links to it                                       |
| `figmaHandle`                                 | no       | Figma Community handle. The header links to it                                                    |
| `xUsername`                                   | no       | X handle. Used in the social meta tags                                                            |
| `analytics.googleId`                          | no       | Google Analytics ID. Loaded in production builds only                                             |
| `anchors.min`, `anchors.max`                  | no       | Heading levels that get an anchor link. Default 2 to 5                                            |
| `toc.min`, `toc.max`                          | no       | Heading levels in the table of contents. Default 2 to 6                                           |
| `sourceDir`                                   | no       | Directory that `file` props are relative to, from the site's root, e.g. `"../css"`. Default `"."` |
| `sourcePath`                                  | no       | The same directory from the root of the repository, e.g. `"packages/css"`                         |
| `sitePath`                                    | no       | The site's root from the root of the repository, e.g. `"packages/site"`                           |
| `siteBranch`                                  | no       | The branch that "View on GitHub" links to. Default `main`                                         |

`file` props are those of `<ScssDocs>`, `<ScssDocsSimple>`, `<JsDocs>` and `<Code filePath>`.

The schema is strict. A key that it does not know fails the build, so a typing error cannot go unnoticed.

#### Keys of your own

Extend the schema and pass it to the integration. Use the `z` that the package exports, so that the site and the package share one copy of Zod.

```ts
// src/libs/config.ts
import { configSchema, z } from '@chassis-ui/docs/schema'

export const siteConfigSchema = configSchema.extend({
  download: z.object({ dist: z.url(), source: z.url() })
})

export type SiteConfig = z.infer<typeof siteConfigSchema>
```

```ts
// astro.config.ts
integrations: [chassisDocs({ configSchema: siteConfigSchema })]
```

```astro
---
import { getConfig } from '@chassis-ui/docs/site'
import type { SiteConfig } from '@libs/config'

const { download } = getConfig<SiteConfig>()
---
```

### 3. Define the content collections

The layouts read the `docs` collection, and `<Callout name>` reads the `callouts` collection.

```ts
// src/content.config.ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { calloutsSchema, docsSchema } from '@chassis-ui/docs/schema'

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
    schema: docsSchema
  }),
  callouts: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './content/callouts' }),
    schema: calloutsSchema
  })
}
```

### 4. Provide the static files

The layouts link to files under `/static/`, which the site puts into its `public` directory:

| URL                                                                  | From                                      |
| -------------------------------------------------------------------- | ----------------------------------------- |
| `/static/css/chassis.css`, `/static/css/chassis.min.css`             | the `dist` folder of `@chassis-ui/css`    |
| `/static/icons/chassis-icons.svg`, `/static/icons/chassis-icons.css` | the `icons` folder of `@chassis-ui/icons` |
| `/static/images/*`: logo, favicons, social image                     | the docs build of `chassis-assets`        |

These helpers find the folders, whether `node_modules` is in the site's root or in the root of the repository: `getChassisCSSFsPath()`, `getChassisIconsFsPath()`, `getChassisAssetsFsPath()` and `getChassisTokensFsPath()`. Each takes `{ root, dir }`.

A site that type-checks with `astro check` declares the `@chassis-ui/css` module, which has no types: `declare module '@chassis-ui/css'`.

### 5. Use the layouts

```astro
---
import SingleLayout from '@chassis-ui/docs/layouts/SingleLayout.astro'
---

<SingleLayout title="About" description="What Chassis is and who makes it.">
  <p>Page content.</p>
</SingleLayout>
```

## Shortcodes

Every component in `@chassis-ui/docs/shortcodes/` is available in MDX files without an import. So is every component in the site's `src/components/shortcodes/`. A component of the site replaces the package's component of the same name.

```ts
chassisDocs({
  shortcodes: {
    // Leave out shortcodes whose names the site uses for something else
    exclude: ['Icon']
  }
})
```

## What pages read from the site

`@chassis-ui/docs/site` is for pages and components. It does not work in `astro.config.ts` or in the browser.

| Function                                           | Returns                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| `getConfig()`                                      | The parsed `config.yml`                                             |
| `getSidebar()`                                     | The parsed `data/sidebar.yml`                                       |
| `getDocsPath(path)`                                | URL path of a docs page                                             |
| `getDocsPages()`                                   | The entries of the `docs` collection                                |
| `getCallout(name)`                                 | An entry of the `callouts` collection                               |
| `getSiteRoot()`, `getSiteFsPath(file)`             | Absolute path of the site's root, or of a file in it                |
| `getPublicFsPath(file)`                            | Absolute path of a file in the `public` directory                   |
| `getSourceFsPath(file)`                            | Absolute path of a file that a `file` prop names                    |
| `getSourceUrl(file)`                               | URL of a source file on GitHub, at the tag of the current version   |
| `getSiteFileUrl(filePath)`                         | URL of a file of the site on GitHub, on the site's branch           |
| `getPackageFilePath(file)`                         | Absolute path of a file of this package, e.g. `'js/color-modes.js'` |
| `resolveConfigRefs(text)`, `resolveDocsrefs(text)` | `text` with `[[config:]]` or `[[docsref:]]` replaced                |
| `createDataLoader(definitions)`                    | A `getData(name)` function for the site's own YAML files in `data/` |

Code that runs while Astro loads its configuration uses the library functions of the root entry instead: `loadConfig()`, `loadData()`, `loadSidebar()` and the path helpers.

## Exports

These import paths are the public API.

| Path                            | Contents                                                                                                                                                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@chassis-ui/docs`              | Library functions that work anywhere: config and data loaders, path helpers, `getSiteUrl`, `getDocsMarkdownConfig`, the remark and rehype plugins, `chassisAutoImport`, `generateToc`, `highlightCode`, image and string utilities |
| `@chassis-ui/docs/integration`  | `chassisDocs()` and the type of its options                                                                                                                                                                                        |
| `@chassis-ui/docs/schema`       | `z`, `configSchema`, `sidebarSchema`, `docsSchema`, `calloutsSchema`, the version validators, and the types `ChassisConfig`, `Sidebar`, `SidebarItem`, `DocsFrontmatter`, `DocsPage`                                               |
| `@chassis-ui/docs/site`         | What pages read from the site. See above                                                                                                                                                                                           |
| `@chassis-ui/docs/layouts/*`    | `BaseLayout.astro`, `DocsLayout.astro`, `RedirectLayout.astro`, `SingleLayout.astro`                                                                                                                                               |
| `@chassis-ui/docs/components/*` | `DocsSidebar.astro`, `FeatureCard.astro`, `NavLink.astro`, `ResponsiveImage.astro`, `TableOfContents.astro`, `ThemeToggler.astro`                                                                                                  |
| `@chassis-ui/docs/shortcodes/*` | The MDX shortcodes                                                                                                                                                                                                                 |
| `@chassis-ui/docs/js/*`         | Client-side scripts: `example-mode.js`, `clipboard.ts`, `color-modes.js` and others                                                                                                                                                |
| `@chassis-ui/docs/scss/main`    | The styles of the package. The integration loads them when the site has no stylesheet of its own                                                                                                                                   |
| `@chassis-ui/docs/scss/vars`    | The Sass variables and custom properties of the docs, for a site's own stylesheets                                                                                                                                                 |

No other path resolves: `exports` in `package.json` lists these and nothing else. The layouts and components are listed by name, so the folders inside `layouts/` and `components/` are not reachable.

The integration provides four modules: `virtual:chassis-docs/config`, `virtual:chassis-docs/sidebar`, `virtual:chassis-docs/paths` and `virtual:chassis-docs/styles`. Use the functions of `@chassis-ui/docs/site` instead of importing them.

## Versioning

The package follows [Semantic Versioning](https://semver.org/). Before 1.0 that means:

- A minor release, 0.x.0, may contain breaking changes. Each one is listed in [CHANGELOG.md](CHANGELOG.md) and has a step in [UPGRADING.md](UPGRADING.md).
- A patch release, 0.x.y, contains none.

A change is breaking when it changes something that this README documents:

- the import paths listed under [Exports](#exports), and what they export
- the options of the integration
- the keys of `config.yml`, and the schemas of the sidebar and the content collections
- the props and slots of the layouts, components and shortcodes
- the `[[config:]]` and `[[docsref:]]` syntax
- the URLs under `/static/` that the layouts link to
- the supported versions of Node, Astro and `@chassis-ui/css`

Everything else may change in a patch release: the rendered HTML, class names, the content of the styles, and every file that is not reachable through a documented import path.

1.0 is released when all three hold:

1. Every Chassis site uses the integration and carries no copy of code that the package provides.
2. Unit tests and builds of a fixture site run before every release.
3. Releases are automated and published with provenance.

## Chassis Ecosystem

This package is part of the Chassis Design System's multi-repository architecture:

| Project                                                  | Description                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| [chassis-website](https://github.com/chassis-ui/website) | **Main website and home of `@chassis-ui/docs` (this package)** |
| [chassis-css](https://github.com/chassis-ui/css)         | CSS framework and component library                            |
| [chassis-tokens](https://github.com/chassis-ui/tokens)   | Design token generation and management                         |
| [chassis-icons](https://github.com/chassis-ui/icons)     | Icon library and build toolkit                                 |
| [chassis-assets](https://github.com/chassis-ui/assets)   | Multi-platform asset management                                |
| [chassis-figma](https://github.com/chassis-ui/figma)     | Figma component documentation                                  |
| [chassis-react](https://github.com/chassis-ui/react)     | React component library                                        |

All documentation sites in the ecosystem share this package for consistent layouts, components, and styling.

## Contributing

Issues and pull requests are welcome — please file them in [`chassis-ui/website`](https://github.com/chassis-ui/website). For larger changes, open an issue first so we can agree on the approach before you write the code.

## License

MIT © [Chassis UI](https://github.com/chassis-ui)

## Links

- [chassis-ui.com](https://chassis-ui.com)
- [npm package](https://www.npmjs.com/package/@chassis-ui/docs)
- [Source repository](https://github.com/chassis-ui/website/tree/main/packages/docs)
- [Issue tracker](https://github.com/chassis-ui/website/issues)
