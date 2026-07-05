import path from 'node:path'
import { defineConfig } from 'astro/config'
import { chassis } from './src/libs/astro'
import { getConfig } from './src/libs/config'
import { remarkCxConfig, remarkCxDocsref } from './src/libs/remark'
import { chassisAutoImportPlugin } from './src/libs/shortcode'
import { getSiteUrl, getDocsMarkdownConfig } from '@chassis-ui/docs'

// https://astro.build/config
export default defineConfig({
  site: getSiteUrl(getConfig()),
  outDir: '../../_site',
  build: {
    assets: `static/astro`
  },
  integrations: [chassis()],
  markdown: getDocsMarkdownConfig({
    anchors: getConfig().anchors,
    remarkPlugins: [chassisAutoImportPlugin(), remarkCxConfig, remarkCxDocsref]
  }),
  vite: {
    environments: {
      client: {
        build: {
          rolldownOptions: {
            external: ['@chassis-ui/css'],
            output: {
              paths: { '@chassis-ui/css': '/static/js/chassis.bundle.min.js' },
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
