import fs from 'node:fs'
import path from 'node:path'
import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import type { AstroIntegration } from 'astro'
import type { Element } from 'hast'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { getConfig } from './config'
import {
  configurePrism,
  rehypeCxTable,
  registerRemarkFunctions,
  remarkCxConfig,
  remarkCxDocsref
} from '@chassis-ui/docs'
import {
  getDocsFsPath,
  getChassisDocsPath,
  getChassisAssetsFsPath,
  getChassisCSSFsPath,
  getChassisIconsFsPath,
  getDocsPublicFsPath,
  getDocsStaticFsPath,
  validateChassisDocsPaths
} from './path'
import chassisAutoImport from './shortcode'

// A list of static file paths that will be aliased to a different path.
const staticFileAliases = {
  '/images/apple-touch-icon.png': '/apple-touch-icon.png',
  '/images/favicon.png': '/favicon.ico'
}

// A list of pages that will be excluded from the sitemap.
const sitemapExcludes = ['/404', '/docs', `/docs/${getConfig().docs_version}`]

const headingsRangeRegex = new RegExp(`^h[${getConfig().anchors.min}-${getConfig().anchors.max}]$`)

export function chassis(): AstroIntegration[] {
  const sitemapExcludedUrls = sitemapExcludes.map((url) => `${getConfig().baseURL}${url}/`)

  // Register remark functions for shared plugins
  registerRemarkFunctions(getConfig, getChassisDocsPath)

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
                    properties: { class: 'anchor-link' },
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
      filter: (page) => sitemapFilter(page, sitemapExcludedUrls)
    })
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
