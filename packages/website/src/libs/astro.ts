import fs from 'node:fs'
import path from 'node:path'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import type { AstroIntegration } from 'astro'
import type { Element, Text } from 'hast'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { getConfig } from './config'
import { rehypeCxTable } from '@chassis-ui/docs'
import { remarkCxConfig, remarkCxDocsref } from './remark'
import {
  getDocsFsPath,
  getChassisAssetsFsPath,
  getChassisCSSFsPath,
  getChassisIconsFsPath,
  getDocsPublicFsPath,
  getDocsStaticFsPath,
  validateChassisDocsPaths
} from './path'
import chassisAutoImport from './shortcode'
import { configurePrism } from './prism'

// A list of static file paths that will be aliased to a different path.
const staticFileAliases = {
  '/images/apple-touch-icon.png': '/apple-touch-icon.png',
  '/images/favicon.png': '/favicon.ico'
}

// A list of pages that will be excluded from the sitemap.
const sitemapExcludes = ['/404', '/docs']

// Proxied sub-sites that are not pages in this Astro project but should appear in the sitemap.
const sitemapProxiedPaths = ['/tokens', '/assets', '/css', '/figma', '/icons']

const headingsRangeRegex = new RegExp(`^h[${getConfig().anchors.min}-${getConfig().anchors.max}]$`)

export function chassis(): AstroIntegration[] {
  const sitemapExcludedUrls = sitemapExcludes.map((url) => `${getConfig().baseURL}${url}/`)
  const sitemapCustomPages = sitemapProxiedPaths.map((url) => `${getConfig().baseURL}${url}/`)

  configurePrism()

  return [
    chassisAutoImport(),
    {
      name: 'chassis-integration',
      hooks: {
        'astro:config:setup': ({ addWatchFile, updateConfig }) => {
          // Reload the config when the integration is modified.
          addWatchFile(path.join(getDocsFsPath(), 'src/libs/astro.ts'))

          // Add the remark and rehype plugins.
          updateConfig({
            markdown: {
              rehypePlugins: [
                rehypeHeadingIds,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: 'append',
                    content: [{ type: 'text', value: ' ' }],
                    properties: (element: Element) => ({
                      class: 'anchor-link',
                      ariaLabel: `Link to this section: ${(element.children[0] as Text).value}`
                    }),
                    test: (element: Element) => element.tagName.match(headingsRangeRegex)
                  }
                ],
                rehypeCxTable
              ],
              remarkPlugins: [remarkCxConfig, remarkCxDocsref]
            }
          })
        },
        'astro:config:done': () => {
          cleanPublicDirectory()
          copyStatic()
          copyChassisAssets()
          copyChassisCSS()
          copyChassisIcons()
          aliasStatic()
        },
        'astro:build:done': ({ dir }) => {
          validateChassisDocsPaths(dir)
        }
      }
    },
    // https://github.com/withastro/astro/issues/6475
    mdx() as AstroIntegration,
    sitemap({
      customPages: sitemapCustomPages,
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

function cleanPublicDirectory() {
  fs.rmSync(getDocsPublicFsPath(), { force: true, recursive: true })
}

function copyChassisAssets() {
  const source = getChassisAssetsFsPath()
  const destination = path.join(getDocsPublicFsPath(), 'static')

  // fs.mkdirSync(destination, { recursive: true })
  // copyStaticRecursively(source, destination)
  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

function copyChassisCSS() {
  const source = getChassisCSSFsPath()
  const destination = path.join(getDocsPublicFsPath(), 'static')

  fs.mkdirSync(destination, { recursive: true })
  fs.cpSync(source, destination, { recursive: true })
}

// Copy the `icons` folder from the chassis-tokens repo to make it available from the `/icons` URL.
function copyChassisIcons() {
  // const svgs_source = path.join(getChassisIconsFsPath(), 'svgs')
  const font_source = path.join(getChassisIconsFsPath(), 'font')
  const destination = path.join(getDocsPublicFsPath(), 'static', 'icons')

  fs.mkdirSync(destination, { recursive: true })
  // fs.cpSync(svgs_source, destination, { recursive: true })
  fs.cpSync(font_source, destination, { recursive: true })
}

// Copy the content as-is of the `static` folder to make it available from the `/` URL.
// A folder named `[version]` will automatically be renamed to the current version of the docs extracted from the
// `config.yml` file.
function copyStatic() {
  const source = getDocsStaticFsPath()
  const destination = path.join(getDocsPublicFsPath())

  copyStaticRecursively(source, destination)
}

// Alias (copy) some static files to different paths.
function aliasStatic() {
  const source = getChassisAssetsFsPath()
  const destination = path.join(getDocsPublicFsPath())

  for (const [aliasSource, aliasDestination] of Object.entries(staticFileAliases)) {
    fs.cpSync(path.join(source, aliasSource), path.join(destination, aliasDestination))
  }
}

// See `copyStatic()` for more details.
function copyStaticRecursively(source: string, destination: string) {
  const entries = fs.readdirSync(source, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile()) {
      fs.cpSync(path.join(source, entry.name), path.join(destination, entry.name))
    } else if (entry.isDirectory()) {
      ;(fs.mkdirSync(path.join(destination, entry.name)), { recursive: true })

      copyStaticRecursively(path.join(source, entry.name), path.join(destination, entry.name))
    }
  }
}

function sitemapFilter(page: string, excludedUrls: string[]) {
  if (excludedUrls.includes(page)) {
    return false
  }

  return true
}

/**
 * Post-processes the generated sitemap-index.xml to inject references to each
 * sub-project's sitemap. Astro's @astrojs/sitemap only knows about the website's
 * own pages; sub-project pages live in separate deployments whose sitemaps are
 * proxied via chassis-ui.com/<project>/sitemap-index.xml.
 */
function injectSubProjectSitemaps(dir: URL) {
  const sitemapIndexPath = path.join(new URL('.', dir).pathname, 'sitemap-index.xml')

  if (!fs.existsSync(sitemapIndexPath)) {
    console.warn('[chassis] sitemap-index.xml not found, skipping sub-project sitemap injection')
    return
  }

  const baseURL = getConfig().baseURL.replace(/\/$/, '')
  const subProjectPaths = ['/tokens', '/css', '/figma', '/icons', '/assets']
  const subProjectEntries = subProjectPaths
    .map((p) => `  <sitemap><loc>${baseURL}${p}/sitemap-index.xml</loc></sitemap>`)
    .join('\n')

  let content = fs.readFileSync(sitemapIndexPath, 'utf-8')
  content = content.replace('</sitemapindex>', `\n${subProjectEntries}\n</sitemapindex>`)

  fs.writeFileSync(sitemapIndexPath, content, 'utf-8')
}
