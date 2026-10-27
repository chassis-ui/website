# @chassis-ui/docs

> Shared Astro layouts, components, and utilities for Chassis documentation sites.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![npm](https://img.shields.io/npm/v/@chassis-ui/docs.svg)](https://www.npmjs.com/package/@chassis-ui/docs)

## Overview

`@chassis-ui/docs` powers every documentation site in the Chassis ecosystem: the main `chassis-ui.com` website and the docs of `chassis-css`, `chassis-tokens`, `chassis-icons`, `chassis-figma`, `chassis-assets` and `chassis-react`. It ships layouts, navigation components, shortcodes for MDX, content-processing utilities and SCSS, so each site stays consistent without copying code.

> [!NOTE] This package is developed inside the [`chassis-website`](https://github.com/chassis-ui/website) monorepo at `packages/docs/` and published to npm. Source, issues, and pull requests live in that repository.

Coming from an earlier version? See [UPGRADING.md](UPGRADING.md).

## Installation

```sh
pnpm add @chassis-ui/docs
```

### Peer Dependencies

```json
{
  "@astrojs/markdown-remark": "^7.0.0",
  "@chassis-ui/css": ">=0.10.0",
  "@pagefind/component-ui": "^1.0.0",
  "@shikijs/transformers": "^4.3.1",
  "astro": "^7.0.0",
  "htmlparser2": "^12.0.0",
  "rehype-autolink-headings": "^7.0.0",
  "sass": "^1.101.0",
  "shiki": "^4.3.1"
}
```

Two more are optional. They are needed by the [commands](#commands) that validate HTML: `html-validate` `^11.0.0` and `vnu-jar` `>=26.0.0`.

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

| Key                                           | Required | Meaning                                                                                                                            |
| --------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `title`, `subtitle`, `description`, `authors` | yes      | Used in the page title and the meta tags                                                                                           |
| `baseURL`                                     | yes      | Canonical URL of the site. The page at its path is the home page: `/css/` for `https://chassis-ui.com/css/`                        |
| `docsPath`                                    | yes      | URL path of the docs pages. Starts with `/`                                                                                        |
| `staticPath`                                  | no       | URL path that the pages load the static files from. Default `/static`. See [A site under a prefix](#a-site-under-a-prefix)         |
| `repo`                                        | yes      | URL of the repository                                                                                                              |
| `currentVersion`                              | yes      | Version that the site documents. Links to source files use the tag `v<currentVersion>`                                             |
| `githubOrg`                                   | no       | GitHub organisation name, not a URL. The header links to it                                                                        |
| `figmaHandle`                                 | no       | Figma Community handle. The header links to it                                                                                     |
| `xUsername`                                   | no       | X handle. Used in the social meta tags                                                                                             |
| `media.cloudinary`                            | no       | Cloud name of the Cloudinary account that holds the media library. See [Images of the media library](#images-of-the-media-library) |
| `analytics.googleId`                          | no       | Google Analytics ID. In production builds, loaded after the visitor accepts in a consent banner                                    |
| `anchors.min`, `anchors.max`                  | no       | Heading levels that get an anchor link. Default 2 to 5                                                                             |
| `toc.min`, `toc.max`                          | no       | Heading levels in the table of contents. Default 2 to 6                                                                            |
| `sourceDir`                                   | no       | Directory that `file` props are relative to, from the site's root, e.g. `"../css"`. Default `"."`                                  |
| `sourcePath`                                  | no       | The same directory from the root of the repository, e.g. `"packages/css"`                                                          |
| `sitePath`                                    | no       | The site's root from the root of the repository, e.g. `"packages/site"`                                                            |
| `siteBranch`                                  | no       | The branch that "View on GitHub" links to. Default `main`                                                                          |

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

The layouts link to files under `/static/`, which the site puts into `static/` of its `public` directory:

| URL                                                                                                                                | From                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/static/css/chassis.css`, `/static/css/chassis.min.css`                                                                           | the `dist` folder of `@chassis-ui/css`                                                                                    |
| `/static/icons/chassis-icons.svg`, `/static/icons/chassis-icons.css`                                                               | the `icons` folder of `@chassis-ui/icons`                                                                                 |
| `/static/images/site-logo.svg`, the logo of the navigation bar and the footer. The build inlines it, and fails without the file    | the docs build of `chassis-assets`                                                                                        |
| `/static/images/favicon.png`, `favicon-16x16.png`, `favicon-32x32.png` and `apple-touch-icon.png`                                  | the docs build of `chassis-assets`                                                                                        |
| `/static/images/social-image.png`, the image of a page without a `thumbnail`. The build reads its size, and fails without the file | the docs build of `chassis-assets`                                                                                        |
| `/static/fonts/fonts.css`, and the font files it loads                                                                             | the docs build of `chassis-assets`                                                                                        |
| `/static/other/manifest.json`, the web app manifest                                                                                | the docs build of `chassis-assets`, `v0.5.0` or later. A site may put its own in its `static/other/`, as the starter does |

`chassis-docs vendor` builds the docs build of `chassis-assets` in the `vendor/assets` submodule. See [Commands](#commands).

Nothing else of the docs build is read by the package. A site copies the whole build into `static/`, and its own pages may read more of it.

These helpers find the folders, whether `node_modules` is in the site's root or in the root of the repository: `getChassisCSSFsPath()`, `getChassisIconsFsPath()`, `getChassisAssetsFsPath()` and `getChassisTokensFsPath()`. Each takes `{ root, dir }`.

A site that type-checks with `astro check` declares the `@chassis-ui/css` module, which has no types: `declare module '@chassis-ui/css'`.

#### What the Chassis sites read from the docs build

The sites of the Chassis projects read these files besides, by name, from the docs build of the `chassis` brand:

| File of the docs build                                                   | Read by                                                                                                         |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `icons/cx-sprite.svg`                                                    | The home page of each of the seven sites, which imports it. The build fails without it                          |
| `images/apple-touch-icon.png`, `images/favicon.png`                      | Each of the seven sites, which copies them to `/apple-touch-icon.png` and `/favicon.ico`                        |
| `images/android-chrome-192x192.png`, `images/android-chrome-512x512.png` | `other/manifest.json` of the docs build, which the head links                                                   |
| `images/home/`                                                           | The home page of the website. The home page of chassis-tokens reads `comp-gallery-*` of it                      |
| `images/logo/logo-{light,dark}.svg`                                      | The about page of the website                                                                                   |
| `images/social-image.png`                                                | The blog of the website, for a post without an image                                                            |
| `images/site-logo.svg`                                                   | The examples of the navbar page of chassis-css. The README of `@chassis-ui/react`, by its URL on chassis-ui.com |
| `images/figma/components/`                                               | The component pages of chassis-figma                                                                            |

The vanilla HTML example, in the `vanilla-example` repository, builds the assets itself from a `vendor/assets` submodule of its own, for the brand of each of its sites, and takes `fonts/text.css`, `fonts/display.css` and `fonts/code.css`, the font files they load, the license of each font and `images/logo/chassis-icon-brand.svg`.

`contracts` in `chassis.checks.json` of `chassis-assets` names the files that a site reads, with the code that reads each, and `pnpm assets:contract` there checks a build against it.

#### A site under a prefix

A site that is served under a path of another host, such as `chassis-ui.com/css`, cannot use `/static/` there: that path belongs to the host's own site. It loads its static files under a path of its own instead:

```yaml
# config.yml
staticPath: '/css/static'
```

The layouts, the `Icon` shortcode and the scripts of the package then link `/css/static/css/chassis.min.css` and so on. The files do not move: they stay in `static/` of the `public` directory. Two rewrites make the path answer:

- on the host, from `/css/static/*` to `/static/*` of the site's deployment.
- in the site's own `vercel.json`, from `/css/static/(.*)` to `/static/$1`, so that the deployment also works when it is opened directly.

Two kinds of URL are the site's own to move:

- URLs that the site writes itself, in its pages and components. `getStaticPath('images/hero.png')` of `@chassis-ui/docs/site` returns the URL under `staticPath`.
- The files that Astro builds, when the site puts them under `static/` with `build.assets`. Astro's `build.assetsPrefix` adds the prefix to them, `'/css'` here.

A social image named in the frontmatter as `static/images/…` is read from the `public` directory and linked under `staticPath`.

The layouts link the Chassis CSS, the icon stylesheet, `fonts/fonts.css` and the icon sprite with a version: `/static/css/chassis.min.css?v=8e2106f6`, the first 8 characters of the MD5 hash of the file. A new file is a new URL, so a host can let the browser keep these files for good. The version is read from the file of `public` at the path of the URL, so a site under a prefix whose `public` holds the files in `static/` links them without one.

### 5. Use the layouts

```astro
---
import SingleLayout from '@chassis-ui/docs/layouts/SingleLayout.astro'
---

<SingleLayout title="About" description="What Chassis is and who makes it.">
  <p>Page content.</p>
</SingleLayout>
```

The `<title>` of a page is its `title` and the `title` of `config.yml`: `About · Chassis UI`. The home page, which is the page at the path of `baseURL`, gets `title` and `subtitle` of `config.yml` instead: `Chassis UI · Design Systems that Scale & Sync`. Its own `title` is used for the social tags only. html-validate reports a `<title>` of more than 70 characters, so keep the two within that.

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
| `getStaticPath(file)`                              | URL path of a static file, under `staticPath` of the config         |
| `getVersionedStaticPath(file)`                     | The same, with `?v=` and a hash of the file in `public`             |
| `getMediaUrl(path, transform)`                     | URL of a copy of an image of the media library                      |
| `getMediaSrcSet(path, widths, transform)`          | The `srcset` of an image of the media library                       |
| `getSourceFsPath(file)`                            | Absolute path of a file that a `file` prop names                    |
| `getSourceUrl(file)`                               | URL of a source file on GitHub, at the tag of the current version   |
| `getSiteFileUrl(filePath)`                         | URL of a file of the site on GitHub, on the site's branch           |
| `getPackageFilePath(file)`                         | Absolute path of a file of this package, e.g. `'js/color-modes.js'` |
| `resolveConfigRefs(text)`, `resolveDocsrefs(text)` | `text` with `[[config:]]` or `[[docsref:]]` replaced                |
| `createDataLoader(definitions)`                    | A `getData(name)` function for the site's own YAML files in `data/` |

Code that runs while Astro loads its configuration uses the library functions of the root entry instead: `loadConfig()`, `loadData()`, `loadSidebar()` and the path helpers.

## Images of the media library

Images that do not belong in the repository, such as the covers of blog posts, are in a media library on Cloudinary. `media.cloudinary` of `config.yml` is the cloud name of the account, and a page names an image by its path in the library, such as `blog/2026/color-system/cover.jpg`. The path is the public ID of the image, with or without an extension. The folders of the library do not take part in it unless the public ID has them. A URL, a path that starts with `/`, `..` and a query are refused.

```astro
---
import MediaImage from '@chassis-ui/docs/components/MediaImage.astro'
---

<MediaImage
  src="blog/2026/color-system/cover.jpg"
  alt="Paint chips beside an empty floor plan"
  width={1200}
  height={630}
  sizes="(width >= 64rem) 50vw, 100vw"
/>
```

| Prop     | Meaning                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| `src`    | Path of the image in the media library                                                                               |
| `alt`    | Alternative text                                                                                                     |
| `width`  | Largest width in CSS pixels that the image is shown at                                                               |
| `height` | Height at `width`. The image is cropped to that ratio, around its subject. Without it, the image keeps its own ratio |
| `widths` | Widths of the copies in the `srcset`. Default: the widths from 320 to 2400 up to twice `width`, and `width`          |
| `sizes`  | The `sizes` attribute. Default: `width` pixels, or the width of the viewport when smaller                            |

Other attributes go to the `<img>`. `loading` is `lazy` and `decoding` is `async` unless the page sets them. A browser that accepts AVIF or WebP gets that format.

A `thumbnail` of `media:` and a path, such as `media:blog/2026/color-system/cover.jpg`, links a 1200 × 630 JPEG copy, cropped around the subject, in the social meta tags. Its size is known, so the build does not load it. `zMediaPath` of `@chassis-ui/docs/schema` checks a path in a content schema of the site.

The page CSP of the host must allow images from `https://res.cloudinary.com`. Only `src/libs/media.ts` knows the URL format of Cloudinary, so a move to another provider changes that file and the config key, and no page.

## Commands

The package installs a `chassis-docs` command with the build steps that every Chassis site shares. Call it from the scripts of `package.json`:

```json
{
  "scripts": {
    "vendor": "chassis-docs vendor",
    "sync-submodules": "chassis-docs sync-submodules",
    "lint:html": "chassis-docs html-validate _site",
    "lint:vnu": "chassis-docs vnu _site"
  }
}
```

| Command                              | What it does                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chassis-docs vendor`                | Checks out the `vendor/assets` submodule at the commit that the repository pins, pulls its Git LFS files, installs its dependencies and runs its `pnpm assets:site` |
| `chassis-docs sync-submodules`       | Moves `vendor/assets` to the latest commit of the `app/docs` branch and builds it. Commit the new pointer afterwards                                                |
| `chassis-docs html-validate [paths]` | Validates the HTML files in `paths` with [html-validate](https://html-validate.org)                                                                                 |
| `chassis-docs vnu [paths]`           | Validates `paths` with the [Nu Html Checker](https://validator.github.io/validator/). Skipped, with a warning, when Java is missing                                 |
| `chassis-docs help`                  | Lists the commands and their options                                                                                                                                |

`vendor` and `sync-submodules` work from any folder of the repository. They need Git, Git LFS and pnpm. `sync-submodules --branch <name>`, or the `SUBMODULE_BRANCH` variable, follows another branch.

Both take `--subset <range>`, which writes the fonts of the build with the characters of the range only, so that a page downloads smaller font files. A range is a name that `chassis-assets` knows, such as `latin` or `latin-ext`, or a range written as `U+0370-03FF`, and the option is repeatable:

```json
{
  "scripts": {
    "vendor": "chassis-docs vendor --subset latin --subset latin-ext --split"
  }
}
```

A character outside the ranges is drawn with the next font of the font stack. With the option, the commands install the package of the build in the submodule, `pnpm install --filter ./packages/assets --prod`, in place of `pnpm install --ignore-workspace`: it holds the package that subsets a font.

`--subset` also fixes the axes of a variable font that `chassis-assets` names for the brand: the optical size of Inter at 14, so that text has the width it had with Google Fonts. A site that builds without `--subset` sets `font-optical-sizing: none` in its styles for the same look.

`--split`, with `--subset`, writes each font in a file per range as well, such as `text-latin.woff2` and `text-latin-ext.woff2`, and the stylesheets name them with a `unicode-range`: a page loads the file of a range only when it has a character of it. `--no-split` writes one file per font. Without either, the setting of `chassis-assets` decides, which is one file.

Each command exits with 1 when it fails, so a script or CI job stops there.

### Validating HTML

`html-validate` and `vnu` take any number of files and folders, `_site` when none is given. Paths are relative to the folder the script runs in, which for a site in `packages/site` is that folder when the script is in its `package.json`, and the repository root when it is in the root one.

What a site can change:

| To                                  | Use                                   | Validator     | Adds to the defaults or replaces them |
| ----------------------------------- | ------------------------------------- | ------------- | ------------------------------------- |
| Skip a file or folder               | `--ignore <path>`, repeatable         | both          | adds                                  |
| Check `static/icons` too            | `--no-default-ignore`                 | both          | removes the default                   |
| Turn a rule off or change it        | `rules` in the file of `--config`     | html-validate | overrides the rule                    |
| Use more presets or plugins         | `extends` in the file of `--config`   | html-validate | adds                                  |
| Allow custom elements or attributes | `elements` in the file of `--config`  | html-validate | replaces                              |
| Leave out a message                 | `--filter <regex>` or `--filter-file` | vnu           | adds                                  |

The defaults:

- Both skip `static/icons` in each path, where a site copies `@chassis-ui/icons`, whose preview page is not the site's.
- `html-validate` extends `html-validate:recommended` and `html-validate:document`. It turns off `void-style`, since Astro writes void elements with a slash, `no-inline-style`, since Shiki writes inline styles, and `require-sri`. `heading-level` lets a page start at `h2`, as the dialogs of the layouts do.
- `vnu` fails on warnings as well as errors, and leaves out "Trailing slash on void elements", which Astro writes.

A site with its own exceptions keeps them in files next to its `package.json`, and names them in its scripts:

```json
{
  "scripts": {
    "lint:html": "chassis-docs html-validate _site --ignore _site/examples --config html-validate.json",
    "lint:vnu": "chassis-docs vnu _site --ignore _site/examples --filter-file vnu-filters.txt"
  }
}
```

`html-validate.json`:

```json
{
  "rules": {
    "prefer-native-element": ["error", { "exclude": ["region"] }],
    "prefer-button": "off"
  }
}
```

`vnu-filters.txt`, one regular expression per line, where a line that starts with `#` is a comment:

```text
# The docs show autocomplete on inputs of every type
Attribute “autocomplete” is only allowed when the input type is.*
Bad value “heading” for attribute “role” on element “summary”.
```

A filter is matched against the message as the output shows it, curly quotes included: `“role”`. A line copied from the output works.

A rule or filter applies to every file that the command checks. To make an exception for one page only, skip the page with `--ignore`, or disable the rule inside the page's markup with a comment of html-validate, such as `<!-- [html-validate-disable-next prefer-button] -->`.

## Exports

These import paths are the public API.

| Path                            | Contents                                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@chassis-ui/docs`              | Library functions that work anywhere: config and data loaders, path helpers, `getSiteUrl`, `getDocsMarkdownConfig`, the remark and rehype plugins, `chassisAutoImport`, `generateToc`, `highlightCode`, image, media and string utilities |
| `@chassis-ui/docs/integration`  | `chassisDocs()` and the type of its options                                                                                                                                                                                               |
| `@chassis-ui/docs/schema`       | `z`, `configSchema`, `sidebarSchema`, `docsSchema`, `calloutsSchema`, the version validators, `zMediaPath`, and the types `ChassisConfig`, `Sidebar`, `SidebarItem`, `DocsFrontmatter`, `DocsPage`                                        |
| `@chassis-ui/docs/site`         | What pages read from the site. See above                                                                                                                                                                                                  |
| `@chassis-ui/docs/layouts/*`    | `BaseLayout.astro`, `DocsLayout.astro`, `RedirectLayout.astro`, `SingleLayout.astro`                                                                                                                                                      |
| `@chassis-ui/docs/components/*` | `DocsSidebar.astro`, `FeatureCard.astro`, `MediaImage.astro`, `NavLink.astro`, `ResponsiveImage.astro`, `TableOfContents.astro`, `ThemeToggler.astro`                                                                                     |
| `@chassis-ui/docs/shortcodes/*` | The MDX shortcodes                                                                                                                                                                                                                        |
| `@chassis-ui/docs/js/*`         | Client-side scripts: `example-mode.js`, `clipboard.ts`, `color-modes.js` and others                                                                                                                                                       |
| `@chassis-ui/docs/scss/main`    | The styles of the package. The integration loads them when the site has no stylesheet of its own                                                                                                                                          |
| `@chassis-ui/docs/scss/vars`    | The Sass variables and custom properties of the docs, for a site's own stylesheets                                                                                                                                                        |

No other path resolves: `exports` in `package.json` lists these and nothing else. The layouts and components are listed by name, so the folders inside `layouts/` and `components/` are not reachable.

The integration provides five modules: `virtual:chassis-docs/config`, `virtual:chassis-docs/sidebar`, `virtual:chassis-docs/paths`, `virtual:chassis-docs/static` and `virtual:chassis-docs/styles`. Use the functions of `@chassis-ui/docs/site` instead of importing them.

## Compatibility

"Requires" is what `package.json` of each version declares. "Built with" is what the website in this repository resolved and built when the version was released. CI also builds the [starter site](starter/) with the newest versions that its ranges accept.

| `@chassis-ui/docs` | Requires Astro             | Requires `@chassis-ui/css` | Requires Node | Built with                             |
| ------------------ | -------------------------- | -------------------------- | ------------- | -------------------------------------- |
| 0.11.0             | `^7.0.0`                   | `>=0.10.0`                 | `>=22.12.0`   | Astro 7.3.8, css 0.10.0, tokens 0.10.0 |
| 0.10.0             | `^7.0.0`                   | `>=0.10.0`                 | `>=22.12.0`   | Astro 7.3.8, css 0.10.0, tokens 0.10.0 |
| 0.9.0              | `^7.0.0`                   | `>=0.10.0`                 | `>=22.12.0`   | Astro 7.3.8, css 0.10.0, tokens 0.10.0 |
| 0.8.0              | `^7.0.0`                   | `>=0.6.0`                  | `>=22.12.0`   | Astro 7.3.5, css 0.7.1, tokens 0.7.0   |
| 0.7.0              | `^7.0.0`                   | `>=0.6.0`                  | `>=22.12.0`   | Astro 7.3.5, css 0.6.0, tokens 0.6.0   |
| 0.6.3              | `^7.0.0`                   | `^0.5.0-0`                 | `>=22.12.0`   | Astro 7.3.5, css 0.5.2, tokens 0.6.0   |
| 0.6.2              | `^7.0.0`                   | `^0.5.0-0`                 | `>=22.12.0`   | Astro 7.3.5, css 0.5.2, tokens 0.6.0   |
| 0.6.1              | `^7.0.0`                   | `^0.5.0-0`                 | `>=22.12.0`   | Astro 7.3.5, css 0.5.2, tokens 0.6.0   |
| 0.6.0              | `^7.0.0`                   | `^0.5.0-0`                 | `>=22.12.0`   | Astro 7.3.5, css 0.5.2, tokens 0.5.3   |
| 0.5.1              | `^7.0.0`                   | `^0.5.0-0`                 | `>=22.12.0`   | Astro 7.3.5, css 0.5.2, tokens 0.5.3   |
| 0.5.0              | `^7.0.0`                   | `^0.5.0-0`                 | not declared  | not recorded                           |
| 0.4.0              | `^7.0.0`                   | `^0.4.0`                   | not declared  | not recorded                           |
| 0.3.0 to 0.3.10    | `^7.0.0`                   | `>=0.3.1` to `>=0.3.4`     | not declared  | not recorded                           |
| 0.1.0 to 0.2.0     | `^5.0.0`, 0.1.0–0.1.1 `^4` | not declared               | not declared  | not recorded                           |

`@chassis-ui/tokens` is not a dependency of the package, but a site installs it: the default token source of `@chassis-ui/css`, `scss/vendor/_chassis-tokens.scss`, forwards `@chassis-ui/tokens/dist/web/docs/chassis/main` from the site's `node_modules`, so the site needs the tokens that its css is built on: css 0.10 on tokens 0.10, css 0.7 on tokens 0.7. A site with tokens of its own puts them on the Sass load path in place of those, as [Styles](#styles) says.

Before a release, the [canary](https://github.com/chassis-ui/website/blob/main/build/canary.js) builds the site of each Chassis repository whose range accepts the new version.

## Versioning

The package follows [Semantic Versioning](https://semver.org/). Before 1.0 that means:

- A minor release, 0.x.0, may contain breaking changes. Each one is listed in [CHANGELOG.md](CHANGELOG.md) and has a step in [UPGRADING.md](UPGRADING.md).
- A patch release, 0.x.y, contains none.

A change is breaking when it changes something that this README documents:

- the import paths listed under [Exports](#exports), and what they export
- the options of the integration
- the commands of `chassis-docs`, their options and their defaults
- the keys of `config.yml`, and the schemas of the sidebar and the content collections
- the props and slots of the layouts, components and shortcodes
- the `[[config:]]` and `[[docsref:]]` syntax
- the URLs under `staticPath`, `/static/` by default, that the layouts link to
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
