import { defineConfig } from 'astro/config'
import { chassis } from './src/libs/astro'
import { getConfig } from './src/libs/config'
import { getSiteUrl } from '@chassis-ui/docs'
import { algoliaPlugin } from './src/plugins/algolia-plugin'
import { rehypeStripIsRaw } from '@chassis-ui/docs'

const site = getSiteUrl(getConfig())

// https://astro.build/config
export default defineConfig({
  outDir: '../../_site',
  build: {
    assets: `static`
  },
  integrations: [chassis()],
  markdown: {
    smartypants: false,
    syntaxHighlight: 'prism',
    rehypePlugins: [rehypeStripIsRaw]
  },
  site,
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
        }
      }
    },
    plugins: [algoliaPlugin()],
    build: {
      rollupOptions: {
        output: {
          // entryFileNames: 'js/[name]-[hash].js',
          // chunkFileNames: 'static/js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'static/css/docs-[hash].css'
            }
            return 'static/docs-[hash][extname]'
          }
        }
      }
    }
  }
})
