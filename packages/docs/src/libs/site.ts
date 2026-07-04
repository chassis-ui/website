import os from 'os'

/** Resolved host and port for the local Astro development server. */
interface DevHost {
  /** Hostname or IP address (e.g. `"localhost"` or a LAN IP when `--host` is passed). */
  host: string
  /** Port number the dev server is listening on. */
  port: number
}

/**
 * Minimum site configuration shape required by `getSiteUrl`.
 * The consuming project's full config object satisfies this interface as long
 * as it exposes a `baseURL` string.
 */
export interface SiteConfig {
  /** Canonical base URL used as a fallback in production (e.g. `"https://chassis-ui.com/css/"`). */
  baseURL: string
}

/**
 * Resolves the host and port for the local Astro development server.
 *
 * Resolution order for port: `--port` CLI flag → `PORT` env var → `4321` (Astro default).
 * When `--host` is passed, the first non-internal IPv4 network interface address
 * is used as the host so the dev URL is reachable on the LAN.
 */
function getDevHost(): DevHost {
  const hasHostFlag = process.argv.includes('--host')
  let host = 'localhost'
  let port = 4321

  const portFlagIndex = process.argv.findIndex((arg) => arg === '--port')
  if (portFlagIndex !== -1 && process.argv[portFlagIndex + 1]) {
    const cliPort = parseInt(process.argv[portFlagIndex + 1], 10)
    if (!isNaN(cliPort) && cliPort > 0 && cliPort < 65536) {
      port = cliPort
    }
  }

  if (process.env.PORT) {
    const envPort = parseInt(process.env.PORT, 10)
    if (!isNaN(envPort) && envPort > 0 && envPort < 65536) {
      port = envPort
    }
  }

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
 * Determines the canonical site URL for the current environment.
 *
 * Resolution order:
 * 1. `SITE_URL` env var — explicit override, takes precedence everywhere.
 * 2. `NODE_ENV=development` — constructs a local `http://` URL from `getDevHost()`.
 * 3. `VERCEL_ENV=production` — uses `config.baseURL` (the path-prefixed canonical
 *    URL) rather than `VERCEL_PROJECT_PRODUCTION_URL` (the sub-project custom domain)
 *    so sitemaps always point to the correct public URL.
 * 4. `VERCEL_URL` present — Vercel preview/branch deployment; uses the auto-generated
 *    `https://` preview URL.
 * 5. Fallback — `config.baseURL` from the project's `config.yml`.
 *
 * @param config - Site configuration providing the `baseURL` fallback.
 */
export function getSiteUrl(config: SiteConfig): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL
  }

  if (process.env.NODE_ENV === 'development') {
    const { host, port } = getDevHost()
    return `http://${host}:${port}`
  }

  if (process.env.VERCEL_ENV === 'production') {
    return config.baseURL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return config.baseURL
}
