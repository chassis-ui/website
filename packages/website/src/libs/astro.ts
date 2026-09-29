import fs from 'node:fs'
import path from 'node:path'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import type { AstroIntegration } from 'astro'
import {
  getChassisAssetsFsPath,
  getChassisCSSFsPath,
  getChassisIconsFsPath
} from '@chassis-ui/docs'
import type { SiteConfig } from './config'

// Directories that the site copies files from and to.
interface SitePaths {
  assets: string
  css: string
  icons: string
  public: string
  static: string
}

// Static file paths that will be aliased (copied) to a different destination path.
const staticFileAliases = {
  '/images/apple-touch-icon.png': '/apple-touch-icon.png',
  '/images/favicon.png': '/favicon.ico'
}

// Pages excluded from the generated sitemap.
const sitemapExcludes = ['/404', '/docs']

// Sub-project paths whose sitemaps are injected into the root sitemap-index.xml
// after build. Each entry corresponds to a separate Astro deployment proxied
// under chassis-ui.com/<project>/.
const subProjectPaths = ['/tokens', '/css', '/figma', '/icons', '/assets']

interface ChassisOptions {
  /** The parsed `config.yml`. */
  config: SiteConfig
  /** The site's root: the directory that holds `astro.config.ts`. */
  root: string
}

/**
 * Returns the site's own Astro integrations. They come after `chassisDocs()` of
 * `@chassis-ui/docs` in `astro.config.ts`.
 *
 * Includes the `chassis-integration` (asset copying), MDX support, the sitemap generator,
 * and a post-process integration that injects sub-project sitemap references.
 */
export function chassis({ config, root }: ChassisOptions): AstroIntegration[] {
  const paths: SitePaths = {
    assets: getChassisAssetsFsPath({ root }),
    css: getChassisCSSFsPath({ root }),
    icons: getChassisIconsFsPath({ root }),
    public: path.join(root, 'public'),
    static: path.join(root, 'static')
  }
  const baseURL = config.baseURL.replace(/\/$/, '')
  const sitemapExcludedUrls = sitemapExcludes.map((url) => `${config.baseURL}${url}/`)

  // `astro check` / `astro sync` doesn't need static assets copied into _site.
  // Track the command so the config:done hook can skip expensive file copies.
  let cmd = 'dev'

  return [
    {
      name: 'chassis-integration',
      hooks: {
        'astro:config:setup': ({ addWatchFile, command }) => {
          cmd = command
          // Reload the config when the integration is modified.
          addWatchFile(path.join(root, 'src/libs/astro.ts'))
        },
        'astro:config:done': () => {
          if (cmd === 'sync') return
          cleanPublicDirectory(paths)
          copyStatic(paths)
          copyChassisAssets(paths)
          copyChassisCSS(paths)
          copyChassisIcons(paths)
          aliasStatic(paths)
          copyPagefindIndex(root, paths)
        }
      }
    },
    // https://github.com/withastro/astro/issues/6475
    mdx() as AstroIntegration,
    sitemap({
      filter: (page) => sitemapFilter(page, baseURL, sitemapExcludedUrls)
    }),
    {
      // Must run AFTER `@astrojs/sitemap` writes `sitemap-index.xml`.
      name: 'chassis-sitemap-postprocess',
      hooks: {
        'astro:build:done': ({ dir }) => {
          injectSubProjectSitemaps(dir, baseURL)
        }
      }
    }
  ]
}

/**
 * Copies the previously-generated Pagefind search index from `_site/pagefind/`
 * into `public/pagefind/` so `astro dev` can serve search at `/pagefind/`.
 * No-op if no production build has been run yet — dev simply returns no results.
 */
function copyPagefindIndex(root: string, paths: SitePaths) {
  const source = path.join(root, '../..', '_site', 'pagefind')
  if (!fs.existsSync(source)) return
  const destination = path.join(paths.public, 'pagefind')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Deletes the contents of the `public/` directory before each dev/build run so
 * stale vendor assets (CSS, icons, images) from a previous build are removed.
 * The directory itself is preserved to avoid ENOTEMPTY errors on the root.
 * Errors on individual entries are intentionally swallowed — the directory may
 * contain locked or read-only files in some environments.
 */
function cleanPublicDirectory(paths: SitePaths) {
  const dir = paths.public
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry)
    try {
      fs.rmSync(entryPath, { force: true, recursive: true })
    } catch {
      // ignore
    }
  }
}

/**
 * Copies the Chassis assets package output into `public/static/`.
 */
function copyChassisAssets(paths: SitePaths) {
  const source = paths.assets
  const destination = path.join(paths.public, 'static')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies the compiled Chassis CSS bundle into `public/static/`.
 */
function copyChassisCSS(paths: SitePaths) {
  const source = paths.css
  const destination = path.join(paths.public, 'static')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies the `icons/` folder from the Chassis Icons package into
 * `public/static/icons/` so icons are served from `/static/icons/`.
 */
function copyChassisIcons(paths: SitePaths) {
  const source = path.join(paths.icons, 'icons')
  const destination = path.join(paths.public, 'static', 'icons')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies the contents of the `static/` source directory into `public/`
 * so files are served from the root URL (`/`).
 */
function copyStatic(paths: SitePaths) {
  const source = paths.static
  const destination = paths.public

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies select static files from the Chassis assets package to alternative
 * destination paths (e.g. `apple-touch-icon.png` → `/apple-touch-icon.png`).
 */
function aliasStatic(paths: SitePaths) {
  const source = paths.assets
  const destination = paths.public

  for (const [aliasSource, aliasDestination] of Object.entries(staticFileAliases)) {
    fs.cpSync(path.join(source, aliasSource), path.join(destination, aliasDestination))
  }
}

/**
 * Returns `false` for pages that should be excluded from the sitemap:
 * explicitly excluded URLs, and any page under `/test` or `/docs/test`.
 */
function sitemapFilter(page: string, baseURL: string, excludedUrls: string[]) {
  if (
    excludedUrls.includes(page) ||
    page.startsWith(`${baseURL}/test`) ||
    page.startsWith(`${baseURL}/docs/test`)
  ) {
    return false
  }

  return true
}

/**
 * Post-processes the generated `sitemap-index.xml` to inject `<sitemap>` entries
 * for each sub-project deployment. `@astrojs/sitemap` only knows about the
 * website's own pages; sub-project sitemaps are served from separate deployments
 * and proxied under `chassis-ui.com/<project>/sitemap-index.xml`.
 */
function injectSubProjectSitemaps(dir: URL, baseURL: string) {
  const sitemapIndexPath = path.join(new URL('.', dir).pathname, 'sitemap-index.xml')

  if (!fs.existsSync(sitemapIndexPath)) {
    console.warn('[chassis] sitemap-index.xml not found, skipping sub-project sitemap injection')
    return
  }

  const subProjectEntries = subProjectPaths
    .map((p) => `  <sitemap><loc>${baseURL}${p}/sitemap-index.xml</loc></sitemap>`)
    .join('\n')

  let content = fs.readFileSync(sitemapIndexPath, 'utf-8')
  content = content.replace('</sitemapindex>', `\n${subProjectEntries}\n</sitemapindex>`)

  fs.writeFileSync(sitemapIndexPath, content, 'utf-8')
}
