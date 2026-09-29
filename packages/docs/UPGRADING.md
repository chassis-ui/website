# Upgrading @chassis-ui/docs

## From 0.5 to 0.6

0.6.0 is a breaking release. In 0.5 a site had to supply five modules behind a `@libs/*`
path alias, and every site carried its own copy of them. In 0.6 the package owns that code.
A site adds one integration and deletes its copies.

Do the steps in order. The build fails with a message that names the step you missed.

### 1. Update the dependency

```sh
pnpm add -D @chassis-ui/docs@^0.6.0
```

The package now brings these itself. Remove each one that your own code does not import:
`js-yaml`, `zod`, `clipboard`, `unified`, `unist-util-visit`, `mdast-util-mdx-jsx`,
`@types/mdast` and `astro-auto-import`.

### 2. Rename the keys of `config.yml`

| 0.5                   | 0.6                                         |
| --------------------- | ------------------------------------------- |
| `current_version`     | `currentVersion`                            |
| `github_org`          | `githubOrg`                                 |
| `figma_handle`        | `figmaHandle`                               |
| `x_username`          | `xUsername`                                 |
| `analytics.google_id` | `analytics.googleId`                        |
| `docsDir`             | Delete it. The site root is the Astro root. |

- `githubOrg` is the name of the organisation, such as `chassis-ui`. A URL is rejected.
- `sourceDir` is now relative to the site's root, not to the working directory of the
  build. For a site that is built from its own directory, the value stays the same.
- The schema is strict. A key that the package does not know fails the build. See step 4
  for the keys of your own, such as `blog`, `download` or `cdn`.

Write your own keys in camelCase too, for example `docsVersion` and `exampleIcon`.

Replace the old names in the content as well:

```sh
grep -rl '\[\[config:current_version\]\]' content src \
  | xargs sed -i '' 's/\[\[config:current_version\]\]/[[config:currentVersion]]/g'
```

Three keys outside `config.yml` were renamed as well. An old name fails the build.

| File                       | 0.5                | 0.6               |
| -------------------------- | ------------------ | ----------------- |
| `data/sidebar.yml`         | `icon_color`       | `iconColor`       |
| Frontmatter of a docs page | `added.show_badge` | `added.showBadge` |
| Frontmatter of a docs page | `extra_js`         | `extraJs`         |

```sh
sed -i '' 's/icon_color:/iconColor:/' data/sidebar.yml
grep -rlE '^ *(show_badge|extra_js):' content \
  | xargs sed -i '' -E 's/^( *)show_badge:/\1showBadge:/; s/^( *)extra_js:/\1extraJs:/'
```

Rename them in your own components and collection schemas too, where they read
`icon_color`, `show_badge` or `extra_js`.

### 3. Replace the Astro configuration

Before:

```ts
import { chassis } from './src/libs/astro'
import { getConfig } from './src/libs/config'
import { remarkCxConfig, remarkCxDocsref } from './src/libs/remark'
import { chassisAutoImportPlugin } from './src/libs/shortcode'
import { getSiteUrl, getDocsMarkdownConfig } from '@chassis-ui/docs'

export default defineConfig({
  site: getSiteUrl(getConfig()),
  integrations: [chassis()],
  markdown: getDocsMarkdownConfig({
    anchors: getConfig().anchors,
    remarkPlugins: [chassisAutoImportPlugin(), remarkCxConfig, remarkCxDocsref, myPlugin]
  })
  // ...
})
```

After:

```ts
import { loadConfig } from '@chassis-ui/docs'
import { chassisDocs } from '@chassis-ui/docs/integration'
import { chassis } from './src/libs/astro'
import { siteConfigSchema } from './src/libs/config'

const root = import.meta.dirname
const config = loadConfig({ root, schema: siteConfigSchema })

export default defineConfig({
  integrations: [
    chassisDocs({ config, markdown: { remarkPlugins: [myPlugin] } }),
    chassis({ config, root })
  ]
  // ...
})
```

- Remove `site` and `markdown`. The integration sets both.
- Pass only your own remark and rehype plugins. `rehypeCxTable` is already included.
- A site that does not need the config in `astro.config.ts` calls `chassisDocs()` with
  `configSchema` and does not call `loadConfig()`.

### 4. Replace the files in `src/libs`

| File            | What to do                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config.ts`     | Replace the content with the schema of your own keys. See below. Delete the file if you have none.                                                          |
| `validation.ts` | Delete. `zVersionSemver`, `zVersionMajorMinor`, `zPrefixedVersionSemver` and `zLanguageCode` are in `@chassis-ui/docs/schema`. Keep validators of your own. |
| `clipboard.ts`  | Delete. Import `initCopyButtons` from `@chassis-ui/docs/js/clipboard.ts` if your own code calls it.                                                         |
| `shortcode.ts`  | Delete. See step 6.                                                                                                                                         |
| `path.ts`       | Delete. See step 5 for the replacements.                                                                                                                    |
| `remark.ts`     | Delete `remarkCxConfig`, `remarkCxDocsref` and their helpers. Keep plugins of your own.                                                                     |
| `data.ts`       | Delete if `sidebar` was the only data you read. Otherwise replace the loader with `createDataLoader()`. See below.                                          |
| `content.ts`    | Delete `callouts`, `getCalloutByName` and `CalloutName`. Keep the collections that your own pages read.                                                     |
| `astro.ts`      | Keep. It copies the static files and adds `mdx()` and `sitemap()`. Change it as described below.                                                            |

`src/libs/config.ts`:

```ts
import { configSchema, z } from '@chassis-ui/docs/schema'

export const siteConfigSchema = configSchema.extend({
  blog: z.url()
})

export type SiteConfig = z.infer<typeof siteConfigSchema>
```

`src/libs/data.ts`, for a site with data files of its own:

```ts
import { createDataLoader } from '@chassis-ui/docs/site'
import { z } from '@chassis-ui/docs/schema'

export const getData = createDataLoader({
  breakpoints: z.object({ name: z.string() }).array()
})
```

`src/libs/astro.ts`:

- Take `{ config, root }` as the argument of `chassis()`, and stop calling `getConfig()`.
- Remove `chassisAutoImportIntegration()` from the list of integrations.
- Remove the `astro:build:done` hook that calls `validateChassisDocsPaths()`.
- Import `getChassisAssetsFsPath`, `getChassisCSSFsPath`, `getChassisIconsFsPath` and
  `getChassisTokensFsPath` from `@chassis-ui/docs` and call them with `{ root }`. Pass
  `dir` when the folder is not the installed package, as in `chassis-css`, which copies
  from `../css/dist`.
- Replace `getDocsFsPath()` with `root`, `getDocsPublicFsPath()` with
  `path.join(root, 'public')`, and `getDocsStaticFsPath()` with
  `path.join(root, 'static')`.
- Remove the Vite alias for `@chassis-ui/css` and `optimizeDeps: { exclude:
['@chassis-ui/docs'] }`. The integration now makes every script use one copy of
  `@chassis-ui/css`, in the dev server and in the build. It needs no alias.

### 5. Replace the imports in pages and components

| 0.5                                                 | 0.6                                                |
| --------------------------------------------------- | -------------------------------------------------- |
| `getConfig` from `@libs/config`                     | `getConfig` from `@chassis-ui/docs/site`           |
| `getData('sidebar')` from `@libs/data`              | `getSidebar()` from `@chassis-ui/docs/site`        |
| `getChassisDocsPath` from `@libs/path`              | `getDocsPath` from `@chassis-ui/docs/site`         |
| `getDocsFsPath` from `@libs/path`                   | `getSiteRoot` from `@chassis-ui/docs/site`         |
| `getDocsPublicFsPath` from `@libs/path`             | `getPublicFsPath` from `@chassis-ui/docs/site`     |
| `getDocsRelativePath(file)` from `@libs/path`       | `getSiteFsPath(file)` from `@chassis-ui/docs/site` |
| `replaceConfigInText` from `@libs/remark`           | `resolveConfigRefs` from `@chassis-ui/docs/site`   |
| `replaceDocsrefInText` from `@libs/remark`          | `resolveDocsrefs` from `@chassis-ui/docs/site`     |
| `getCalloutByName` from `@libs/content`             | `getCallout` from `@chassis-ui/docs/site`          |
| A path into `node_modules/@chassis-ui/docs/src/`    | `getPackageFilePath('js/color-modes.js')`          |
| `@chassis-ui/docs/components/shortcodes/Icon.astro` | `@chassis-ui/docs/shortcodes/Icon.astro`           |

`getConfig()` returns the keys of the package. For the keys of your own, name your type:
`getConfig<SiteConfig>()`.

Use the schemas of the package in `src/content.config.ts`:

```ts
import { calloutsSchema, docsSchema } from '@chassis-ui/docs/schema'

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
  schema: docsSchema
})
```

`docsSchema` is already partial. Do not call `.partial()` on it.

### 6. Shortcodes

- Delete `src/types/auto-import.d.ts`. The integration writes the declarations into
  `.astro/`.
- A shortcode in `src/components/shortcodes/` replaces the package's shortcode of the same
  name. No configuration is needed.
- To leave out a shortcode of the package, pass
  `chassisDocs({ shortcodes: { exclude: ['Icon'] } })`.

### 7. Path aliases

The package no longer needs `@libs/*`, `@scss/*` or `@shortcodes/*` in `tsconfig.json`.
Keep the ones that your own code imports.

The stylesheet that every page loads was `@scss/docs.scss`. It is now `src/scss/docs.scss`
in the site's root, which is the same file. Pass `styles` to the integration to name
another one.

### What changes in behaviour

- **Broken `[[docsref:]]` links fail the build.** Five sites only logged them. Fix the
  links, or pass `brokenDocsrefs: 'warn'` until they are fixed.
- **A page of the sidebar may have no `title`.** The schema of `data/sidebar.yml` now
  allows groups, so the type of `title` is `string | undefined`. Code of your own that
  reads the sidebar has to handle that.
- **The header shows the Figma and GitHub links only when `figmaHandle` and `githubOrg`
  are set.** The same holds for the X meta tags and `xUsername`, and for Google Analytics
  and `analytics.googleId`.
- **`@chassis-ui/docs` and `@chassis-ui/css` are not pre-bundled in the dev server.** Both
  are served from source, so a script of the site and a script of the package import the
  same copy of `@chassis-ui/css`. The dependency `clipboard` is still pre-bundled.
- **The working directory of the build does not matter.** `config.yml`, `data/` and the
  `file` props are found from the Astro root. A site that is built with
  `astro build --root site` no longer names `./site/` in its paths.

### Check the result

Build the site before and after the upgrade and compare the output. An upgrade from 0.5.1
changes nothing in the output. An upgrade from 0.5.0 or 0.5.0-0 changes the "View on
GitHub" links, as the changelog describes for 0.5.1.
