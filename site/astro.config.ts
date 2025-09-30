import os from 'os'
import { defineConfig } from 'astro/config'
import { chassis } from './src/libs/astro'
import { getConfig } from './src/libs/config'
import { algoliaPlugin } from './src/plugins/algolia-plugin'
import { stackblitzPlugin } from './src/plugins/stackblitz-plugin'

/**
 * Gets the appropriate host for development server
 * @returns {string} 'localhost' or local IP address based on --host flag
 */
function getDevHost() {
  const hasHostFlag = process.argv.includes('--host')
  if (!hasHostFlag) return 'localhost'

  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces).flat()) {
    if (iface?.family === 'IPv4' && !iface.internal) {
      return iface.address
    }
  }
  return 'localhost'
}

/**
 * Determines the site URL based on environment and deployment context
 * @returns {string} The appropriate site URL for the current environment
 */
function getSiteUrl() {
  // Development: Local server with optional network access
  if (process.env.NODE_ENV === 'development') {
    return `http://${getDevHost()}:4321`
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
  return getConfig().baseURL
}

const site = getSiteUrl()

// https://astro.build/config
export default defineConfig({
  outDir: '../_site',
  build: {
    assets: `assets`
  },
  integrations: [chassis()],
  markdown: {
    smartypants: false,
    syntaxHighlight: 'prism'
  },
  site,
  vite: {
    plugins: [algoliaPlugin(), stackblitzPlugin()],
    ssr: {
      noExternal: ['@astrojs/prism']
    },
    build: {
      rollupOptions: {
        output: {
          // chunkFileNames: 'assets/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/css/[name].[hash].css'
            }
            return 'assets/[name].[hash][extname]'
          }
        }
      }
    }
  }
})
