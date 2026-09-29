import path from 'node:path'
import { defineConfig } from 'astro/config'
import { loadConfig } from '@chassis-ui/docs'
import { chassisDocs } from '@chassis-ui/docs/integration'
import { chassis } from './src/libs/astro'
import { siteConfigSchema } from './src/libs/config'

const root = import.meta.dirname
const config = loadConfig({ root, schema: siteConfigSchema })

// https://astro.build/config
export default defineConfig({
  outDir: '../../_site',
  build: {
    assets: `static/astro`
  },
  integrations: [chassisDocs({ config }), chassis({ config, root })],
  vite: {
    environments: {
      client: {
        build: {
          rolldownOptions: {
            output: {
              entryFileNames: `static/astro/docs.[hash].js`,
              chunkFileNames: 'static/astro/docs.[hash].js'
              // assetFileNames: 'static/astro/docs.[hash][extname]'
            }
          }
        }
      }
    },
    // Required for CSS files
    build: {
      rolldownOptions: {
        output: {
          assetFileNames: 'static/astro/docs.[hash][extname]'
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [
            // Custom override `_chassis-tokens.scss` if present in `src/scss`
            // path.resolve(import.meta.dirname, 'src/scss'),
            // Framework fallback `_chassis-tokens.scss` if no override above.
            path.resolve(import.meta.dirname, 'node_modules/@chassis-ui/css/scss/vendor')
          ]
        }
      }
    }
  }
})
