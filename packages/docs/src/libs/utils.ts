import os from 'os'
import { slug } from 'github-slugger'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getSequence(start: number, end: number, step = 1) {
  const sequence = []

  for (let i = start; i <= end; i += step) {
    sequence.push(i)
  }

  return sequence
}

// This function is used in the docs sidebar to generate partial slugs and properly order the sidebar entries and also
// to generate docs frontmatter sections slugs.
// Note: this should be refactored and removed, the sidebar ordering defined in `site/data/sidebar.yml` should not rely
// on slugified custom titles that are expected to generate a string matching the actual file names on disk, this is
// error prone. Instead, custom sidebar titles should be defined in the frontmatter of the MDX files when needed and
// `site/data/sidebar.yml` should only reference the actual file names and slug extracted from the docs content
// collection. Same goes for the docs frontmatter sections.
export function getSlug(str: string) {
  return slug(str).replace(/--+/g, '-')
}

export function trimLeadingAndTrailingSlashes(str: string) {
  return str.replace(/^\/+|\/+$/g, '')
}

export function stripMarkdown(str: string) {
  return toString(fromMarkdown(str))
}

export function processMarkdownToHtml(markdown: string): string {
  // Use remark to process markdown to HTML
  const result = remark().use(remarkHtml).processSync(markdown)
  return result.toString()
}

export function titleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
}

/**
 * Gets the appropriate host and port for development server
 * @returns {object} Object with host and port properties
 */
function getDevHost() {
  const hasHostFlag = process.argv.includes('--host')
  let host = 'localhost'
  let port = 4321

  // Check for --port command line argument (e.g., astro dev --port 4322)
  const portFlagIndex = process.argv.findIndex((arg) => arg === '--port')
  if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
    const cliPort = parseInt(process.argv[portFlagIndex + 1], 10)
    if (!isNaN(cliPort) && cliPort > 0 && cliPort < 65536) {
      port = cliPort
    }
  }

  // Check for PORT environment variable (most common way to override port)
  if (process.env.PORT) {
    const envPort = parseInt(process.env.PORT, 10)
    if (!isNaN(envPort) && envPort > 0 && envPort < 65536) {
      port = envPort
    }
  }

  // Determine host based on --host flag
  if (hasHostFlag) {
    const interfaces = os.networkInterfaces()
    for (const iface of Object.values(interfaces).flat()) {
      if (iface?.family === 'IPv4' && !iface.internal) {
        host = iface.address
        break
      }
    }
  }

  return { host, port }
}

/**
 * Determines the site URL based on environment and deployment context
 * @returns {string} The appropriate site URL for the current environment
 */
export function getSiteUrl(config: any) {
  // Check for explicit SITE_URL override first
  if (process.env.SITE_URL) {
    return process.env.SITE_URL
  }

  // Development: Local server with optional network access
  if (process.env.NODE_ENV === 'development') {
    const { host, port } = getDevHost()
    return `http://${host}:${port}`
  }

  // Vercel Production: Live production deployment
  if (process.env.VERCEL_ENV === 'production') {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Vercel Preview: Branch deployments and previews
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback: Use baseURL from config.yml
  return config.baseURL
}
