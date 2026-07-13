import fs from 'node:fs'
import path from 'node:path'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import type { AstroIntegration } from 'astro'
import { getConfig } from './config'
import {
  getDocsFsPath,
  getChassisAssetsFsPath,
  getChassisCSSFsPath,
  getChassisIconsFsPath,
  getDocsPublicFsPath,
  getDocsStaticFsPath,
  validateChassisDocsPaths
} from './path'
import { chassisAutoImportIntegration } from './shortcode'

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

/**
 * Returns the full set of Astro integrations used by the Chassis docs site.
 *
 * Includes the core `chassis-integration` (asset copying, remark/rehype plugins,
 * post-build validation), MDX support, the sitemap generator, and a
 * post-process integration that injects sub-project sitemap references.
 */
export function chassis(): AstroIntegration[] {
  const config = getConfig()
  const sitemapExcludedUrls = sitemapExcludes.map((url) => `${config.baseURL}${url}/`)

  // `astro check` / `astro sync` doesn't need static assets copied into _site.
  // Track the command so the config:done hook can skip expensive file copies.
  let cmd = 'dev'

  return [
    chassisAutoImportIntegration(),
    {
      name: 'chassis-integration',
      hooks: {
        'astro:config:setup': ({ addWatchFile, command }) => {
          cmd = command
          // Reload the config when the integration is modified.
          addWatchFile(path.join(getDocsFsPath(), 'src/libs/astro.ts'))
        },
        'astro:config:done': () => {
          if (cmd === 'sync') return
          cleanPublicDirectory()
          copyStatic()
          copyChassisAssets()
          copyChassisCSS()
          copyChassisIcons()
          aliasStatic()
          copyPagefindIndex()
        },
        'astro:build:done': ({ dir }) => {
          validateChassisDocsPaths(dir)
        }
      }
    },
    // https://github.com/withastro/astro/issues/6475
    mdx() as AstroIntegration,
    sitemap({
      filter: (page) => sitemapFilter(page, sitemapExcludedUrls)
    }),
    {
      // Must run AFTER `@astrojs/sitemap` writes `sitemap-index.xml`.
      name: 'chassis-sitemap-postprocess',
      hooks: {
        'astro:build:done': ({ dir }) => {
          injectSubProjectSitemaps(dir)
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
function copyPagefindIndex() {
  const source = path.join(process.cwd(), '../..', '_site', 'pagefind')
  if (!fs.existsSync(source)) return
  const destination = path.join(getDocsPublicFsPath(), 'pagefind')

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
function cleanPublicDirectory() {
  const dir = getDocsPublicFsPath()
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
function copyChassisAssets() {
  const source = getChassisAssetsFsPath()
  const destination = path.join(getDocsPublicFsPath(), 'static')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies the compiled Chassis CSS bundle into `public/static/`.
 */
function copyChassisCSS() {
  const source = getChassisCSSFsPath()
  const destination = path.join(getDocsPublicFsPath(), 'static')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies the `icons/` folder from the Chassis Icons package into
 * `public/static/icons/` so icons are served from `/static/icons/`.
 */
function copyChassisIcons() {
  const source = path.join(getChassisIconsFsPath(), 'icons')
  const destination = path.join(getDocsPublicFsPath(), 'static', 'icons')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies the contents of the `static/` source directory into `public/`
 * so files are served from the root URL (`/`).
 */
function copyStatic() {
  const source = getDocsStaticFsPath()
  const destination = getDocsPublicFsPath()

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

/**
 * Copies select static files from the Chassis assets package to alternative
 * destination paths (e.g. `apple-touch-icon.png` → `/apple-touch-icon.png`).
 */
function aliasStatic() {
  const source = getChassisAssetsFsPath()
  const destination = getDocsPublicFsPath()

  for (const [aliasSource, aliasDestination] of Object.entries(staticFileAliases)) {
    fs.cpSync(path.join(source, aliasSource), path.join(destination, aliasDestination))
  }
}

/**
 * Returns `false` for pages that should be excluded from the sitemap:
 * explicitly excluded URLs, and any page under `/test` or `/docs/test`.
 */
function sitemapFilter(page: string, excludedUrls: string[]) {
  const baseURL = getConfig().baseURL.replace(/\/$/, '')

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
function injectSubProjectSitemaps(dir: URL) {
  const sitemapIndexPath = path.join(new URL('.', dir).pathname, 'sitemap-index.xml')

  if (!fs.existsSync(sitemapIndexPath)) {
    console.warn('[chassis] sitemap-index.xml not found, skipping sub-project sitemap injection')
    return
  }

  const baseURL = getConfig().baseURL.replace(/\/$/, '')
  const subProjectEntries = subProjectPaths
    .map((p) => `  <sitemap><loc>${baseURL}${p}/sitemap-index.xml</loc></sitemap>`)
    .join('\n')

  let content = fs.readFileSync(sitemapIndexPath, 'utf-8')
  content = content.replace('</sitemapindex>', `\n${subProjectEntries}\n</sitemapindex>`)

  fs.writeFileSync(sitemapIndexPath, content, 'utf-8')
}
