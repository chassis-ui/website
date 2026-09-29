import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration, AstroUserConfig, ViteUserConfig } from 'astro'
import type { z } from 'astro/zod'
import { loadConfig, loadSidebar } from './libs/config'
import { joinDocsPath } from './libs/docs-path'
import { getDocsMarkdownConfig, type DocsMarkdownConfigOptions } from './libs/markdown'
import { getPackageRoot } from './libs/paths'
import { remarkCxConfig, remarkCxDocsref } from './libs/remark'
import { configSchema, type ChassisConfig, type Sidebar } from './libs/schema'
import { chassisAutoImport, type ChassisAutoImportOptions } from './libs/shortcodes'
import { getSiteUrl } from './libs/site'

export interface ChassisDocsOptions<TSchema extends z.ZodType = typeof configSchema> {
  /**
   * The config, for a site that has loaded it with `loadConfig()` to use it in
   * `astro.config.ts`. `configFile` is then only watched, and `configSchema` is not used.
   */
  config?: ChassisConfig
  /**
   * Path of the config file, from the site's root.
   * @default 'config.yml'
   */
  configFile?: string
  /**
   * Schema of the config file: `configSchema` from `@chassis-ui/docs/schema`, or an
   * extension of it when the site has keys of its own.
   */
  configSchema?: TSchema
  /**
   * Path of the sidebar data file, from the site's root. `false` for a site that does not
   * render `<DocsSidebar>`.
   * @default 'data/sidebar.yml' when the file exists
   */
  sidebarFile?: string | false
  /**
   * Stylesheets that every page loads, from the site's root. A site's stylesheet is expected
   * to `@use "@chassis-ui/docs/scss/main"`.
   * @default ['src/scss/docs.scss'] when the file exists, the package's styles otherwise
   */
  styles?: string[]
  /** Which shortcodes are imported into every MDX file. */
  shortcodes?: Pick<ChassisAutoImportOptions, 'dir' | 'include' | 'exclude'>
  /** Plugins of the site. They run after the plugins of the package. */
  markdown?: Pick<DocsMarkdownConfigOptions, 'rehypePlugins' | 'remarkPlugins' | 'remarkRehype'>
  /**
   * What happens when a `[[docsref:]]` link points to a page that was not built.
   * @default 'error'
   */
  brokenDocsrefs?: 'error' | 'warn' | 'ignore'
}

type VitePlugin = Extract<NonNullable<ViteUserConfig['plugins']>[number], { name: string }>

const virtualPrefix = 'virtual:chassis-docs/'
const resolvedPrefix = '\0' + virtualPrefix

function virtualModules(modules: Record<string, string>): VitePlugin {
  return {
    name: 'chassis-docs:virtual',
    resolveId(id) {
      if (id.startsWith(virtualPrefix) && id.slice(virtualPrefix.length) in modules) {
        return '\0' + id
      }
    },
    load(id) {
      if (id.startsWith(resolvedPrefix)) {
        return modules[id.slice(resolvedPrefix.length)]
      }
    }
  }
}

// The declarations of `virtual.d.ts`, for a site.
const virtualTypes = `declare module 'virtual:chassis-docs/config' {
  const config: import('@chassis-ui/docs/schema').ChassisConfig
  export default config
}

declare module 'virtual:chassis-docs/sidebar' {
  const sidebar: import('@chassis-ui/docs/schema').Sidebar
  export default sidebar
}

declare module 'virtual:chassis-docs/paths' {
  export const root: string
  export const publicDir: string
  export const sourceDir: string
  export const packageRoot: string
}

declare module 'virtual:chassis-docs/styles' {}
`

// Append `index.html` when the path names a page, and drop the hash.
function toBuiltFilePath(docsPath: string): string {
  const withoutHash = docsPath.split('#')[0]

  return withoutHash.includes('.') ? withoutHash : path.join(withoutHash, 'index.html')
}

/**
 * The Astro integration of `@chassis-ui/docs`. A site adds it in `astro.config.ts`.
 *
 * It reads `config.yml` and `data/sidebar.yml`, gives them to the layouts and components of
 * the package, sets `site` and `markdown` of the Astro config, and imports the shortcodes
 * into every MDX file.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'astro/config'
 * import { chassisDocs } from '@chassis-ui/docs/integration'
 *
 * export default defineConfig({
 *   integrations: [chassisDocs()]
 * })
 * ```
 */
export function chassisDocs<TSchema extends z.ZodType = typeof configSchema>(
  options: ChassisDocsOptions<TSchema> = {}
): AstroIntegration {
  const { brokenDocsrefs = 'error' } = options

  // Docs paths that `[[docsref:]]` links name, collected while the pages are rendered.
  const linkedDocsPaths = new Set<string>()
  let config: ChassisConfig
  let typeDefinitions = ''

  return {
    name: '@chassis-ui/docs',
    hooks: {
      'astro:config:setup': ({ config: astroConfig, command, updateConfig, addWatchFile }) => {
        const root = fileURLToPath(astroConfig.root)
        const configFile = path.resolve(root, options.configFile ?? 'config.yml')

        config =
          options.config ??
          loadConfig({
            file: configFile,
            schema: (options.configSchema ?? configSchema) as z.ZodType<ChassisConfig>
          })
        addWatchFile(configFile)

        let sidebar: Sidebar = []

        if (options.sidebarFile !== false) {
          const sidebarFile = path.resolve(root, options.sidebarFile ?? 'data/sidebar.yml')

          // The default file is optional. A file that the site names must exist.
          if (options.sidebarFile !== undefined || fs.existsSync(sidebarFile)) {
            sidebar = loadSidebar({ file: sidebarFile })
            addWatchFile(sidebarFile)
          }
        }

        const defaultStyles = path.join(root, 'src/scss/docs.scss')
        const styles = options.styles
          ? options.styles.map((file) => path.resolve(root, file))
          : fs.existsSync(defaultStyles)
            ? [defaultStyles]
            : ['@chassis-ui/docs/scss/main.scss']

        const autoImport = chassisAutoImport({ root, ...options.shortcodes })
        typeDefinitions = autoImport.typeDefinitions

        const paths = {
          root,
          publicDir: fileURLToPath(astroConfig.publicDir),
          sourceDir: path.resolve(root, config.sourceDir),
          packageRoot: getPackageRoot()
        }

        const update: AstroUserConfig = {
          // A `site` that the Astro config sets itself is kept.
          ...(astroConfig.site ? {} : { site: getSiteUrl(config) }),
          markdown: getDocsMarkdownConfig({
            anchors: config.anchors,
            remarkPlugins: [
              autoImport.plugin(),
              [remarkCxConfig, { config }],
              [
                remarkCxDocsref,
                {
                  docsPath: config.docsPath,
                  onDocsPath:
                    command === 'build'
                      ? (docsPath: string) => linkedDocsPaths.add(docsPath)
                      : undefined
                }
              ],
              ...(options.markdown?.remarkPlugins ?? [])
            ],
            rehypePlugins: options.markdown?.rehypePlugins,
            remarkRehype: options.markdown?.remarkRehype
          }),
          vite: {
            plugins: [
              virtualModules({
                config: `export default ${JSON.stringify(config)}`,
                sidebar: `export default ${JSON.stringify(sidebar)}`,
                paths: Object.entries(paths)
                  .map(([name, value]) => `export const ${name} = ${JSON.stringify(value)}`)
                  .join('\n'),
                styles: styles.map((file) => `import ${JSON.stringify(file)}`).join('\n')
              })
            ]
          }
        }

        // The user config is wider than what `updateConfig()` declares for `markdown`.
        updateConfig(update as Parameters<typeof updateConfig>[0])
      },
      'astro:config:done': ({ injectTypes }) => {
        injectTypes({ filename: 'virtual.d.ts', content: virtualTypes })
        injectTypes({ filename: 'auto-import.d.ts', content: typeDefinitions })
      },
      'astro:build:done': ({ dir, logger }) => {
        if (brokenDocsrefs === 'ignore') return

        const broken = [...linkedDocsPaths].filter((docsPath) => {
          const builtPath = toBuiltFilePath(joinDocsPath(config.docsPath, docsPath))

          return !fs.existsSync(path.join(fileURLToPath(dir), builtPath))
        })

        if (broken.length === 0) return

        const message = `These [[docsref:]] links point to a page or file that was not built:\n${broken.map((docsPath) => `  - ${docsPath}`).join('\n')}`

        if (brokenDocsrefs === 'error') {
          throw new Error(message)
        }

        logger.warn(message)
      }
    }
  }
}
