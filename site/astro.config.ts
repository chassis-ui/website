import os from 'os'
import { defineConfig } from 'astro/config'
import { chassis } from './src/libs/astro'
import { getConfig } from './src/libs/config'
import { algoliaPlugin } from './src/plugins/algolia-plugin'
import { stackblitzPlugin } from './src/plugins/stackblitz-plugin'

function getLocalIp() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}
const hasHostFlag = process.argv.includes('--host')

const isDev = process.env.NODE_ENV === 'development'

const site = isDev
  // In development mode, use the local dev server.
  ? hasHostFlag
    ? `http://${getLocalIp()}:4321`
    : 'http://localhost:4321'
  : process.env.DEPLOY_PRIME_URL !== undefined
    ? // If deploying on Netlify, use the `DEPLOY_PRIME_URL` environment variable.
      process.env.DEPLOY_PRIME_URL
    : // Otherwise, use the `baseURL` value defined in the `config.yml` file.
      getConfig().baseURL

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
    // },
    // build: {
    //   rollupOptions: {
    //     output: {
    //       // chunkFileNames: 'assets/js/[name].[hash].js',
    //       assetFileNames: (assetInfo) => {
    //         if (assetInfo.name?.endsWith('.css')) {
    //           return 'assets/css/docs.[hash].css'
    //         }
    //         return 'assets/[name].[hash][extname]'
    //       }
    //     }
    //   }
    }
  }
})
