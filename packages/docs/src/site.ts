// What pages and components read from the site. It is backed by the modules that the
// integration provides, so it works only in code that Astro renders: not in
// `astro.config.ts`, and not in the browser.

import path from 'node:path'
import type { z } from 'astro/zod'
import config from 'virtual:chassis-docs/config'
import sidebar from 'virtual:chassis-docs/sidebar'
import * as paths from 'virtual:chassis-docs/paths'
import { getCollection, getEntry, type render } from 'astro:content'
import { loadData } from './libs/config'
import { joinDocsPath, joinStaticPath } from './libs/docs-path'
import { getNodeModulesFsPaths, resolvePackageFilePath } from './libs/paths'
import { replaceConfigInText, replaceDocsrefInText } from './libs/remark'
import type { ChassisConfig, DocsPage, Sidebar } from './libs/schema'
import { resolveSiteFileUrl, resolveSourceFsPath, resolveSourceUrl } from './libs/source'

/**
 * The parsed `config.yml`.
 *
 * A site with keys of its own names its config type: `getConfig<SiteConfig>()`, where
 * `SiteConfig` is inferred from the schema that the site passes to the integration.
 */
export function getConfig<TConfig extends ChassisConfig = ChassisConfig>(): TConfig {
  return config as TConfig
}

/** The parsed `data/sidebar.yml`. Empty when the site has no sidebar file. */
export function getSidebar(): Sidebar {
  return sidebar
}

/** URL path of a docs page, e.g. `getDocsPath('/components/button/')`. */
export function getDocsPath(inputPath: string): string {
  return joinDocsPath(config.docsPath, inputPath)
}

/**
 * URL path of a static file, under `staticPath` of the config:
 * `getStaticPath('images/site-logo.svg')` is `/static/images/site-logo.svg` by default.
 */
export function getStaticPath(file = ''): string {
  return joinStaticPath(config.staticPath ?? '/static', file)
}

/** Absolute path of the site's root: the directory that holds `astro.config.ts`. */
export function getSiteRoot(): string {
  return paths.root
}

/** Absolute path of a file in the site's root. */
export function getSiteFsPath(file = ''): string {
  return path.resolve(paths.root, file)
}

/** Absolute path of a file in the site's `public` directory. */
export function getPublicFsPath(file = ''): string {
  return path.join(paths.publicDir, file)
}

/** Absolute path of a file or directory that a `file` prop names. */
export function getSourceFsPath(file = ''): string {
  return resolveSourceFsPath(paths.sourceDir, file)
}

/** URL of a source file on GitHub, in the tag of the current version. */
export function getSourceUrl(file: string): string {
  return resolveSourceUrl(config, file)
}

/** URL of a file of the site on GitHub, on the site's branch. */
export function getSiteFileUrl(filePath: string): string {
  return resolveSiteFileUrl(config, filePath)
}

/**
 * Absolute path of a file of the package, named by its public path, e.g.
 * `getPackageFilePath('js/color-modes.js')`.
 */
export function getPackageFilePath(file: string): string {
  return resolvePackageFilePath(file, paths.packageRoot)
}

/** The `node_modules` directories that the site resolves packages from, nearest first. */
export function getNodeModulesPaths(): string[] {
  return getNodeModulesFsPaths(paths.root)
}

/**
 * Returns a `getData(name)` function for the site's own data files. Each key of
 * `definitions` is the name of a YAML file in `dir`, and its value is the schema of the file.
 *
 * @example
 * ```ts
 * import { createDataLoader } from '@chassis-ui/docs/site'
 * import { z } from '@chassis-ui/docs/schema'
 *
 * export const getData = createDataLoader({
 *   breakpoints: z.object({ name: z.string() }).array()
 * })
 * ```
 */
export function createDataLoader<TDefinitions extends Record<string, z.ZodType>>(
  definitions: TDefinitions,
  options: { dir?: string } = {}
) {
  const cache = new Map<keyof TDefinitions, unknown>()

  return function getData<TName extends keyof TDefinitions & string>(
    name: TName
  ): z.infer<TDefinitions[TName]> {
    if (!cache.has(name)) {
      cache.set(
        name,
        loadData({
          file: path.join(options.dir ?? 'data', `${name}.yml`),
          root: paths.root,
          schema: definitions[name]
        })
      )
    }

    return cache.get(name) as z.infer<TDefinitions[TName]>
  }
}

type RenderableEntry = Parameters<typeof render>[0]

// The package cannot know the collections of the site, so their names are not type-checked.
const getSiteCollection = getCollection as unknown as (_name: string) => Promise<DocsPage[]>
const getSiteEntry = getEntry as unknown as (
  _collection: string,
  _id: string
) => Promise<RenderableEntry | undefined>

let docsPages: Promise<DocsPage[]> | undefined

/** The entries of the site's `docs` collection. */
export function getDocsPages(): Promise<DocsPage[]> {
  docsPages ??= getSiteCollection('docs')

  return docsPages
}

/** An entry of the site's `callouts` collection, or `undefined` when there is none. */
export function getCallout(name: string): Promise<RenderableEntry | undefined> {
  return getSiteEntry('callouts', name)
}

/** Replaces each `[[config:key]]` in `text` with the value of that key of `config.yml`. */
export function resolveConfigRefs(text: string): string {
  return replaceConfigInText(text, config)
}

/** Replaces each `[[docsref:/path]]` in `text` with the URL path of that docs page. */
export function resolveDocsrefs(text: string): string {
  return replaceDocsrefInText(text, { docsPath: config.docsPath })
}
