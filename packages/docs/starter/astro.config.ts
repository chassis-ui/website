import path from 'node:path'
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { getInstalledPackageFsPath } from '@chassis-ui/docs'
import { chassisDocs } from '@chassis-ui/docs/integration'
import { chassisStatic } from './src/libs/static'

const chassisCss = getInstalledPackageFsPath('@chassis-ui/css', import.meta.dirname)

// https://astro.build/config
export default defineConfig({
  integrations: [chassisDocs(), chassisStatic(), mdx()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // The styles of `@chassis-ui/css` load the tokens as `chassis-tokens`. Its
          // `scss/vendor` folder has the default, which uses `@chassis-ui/tokens`. A site with
          // tokens of its own puts a folder with its `_chassis-tokens.scss` first.
          loadPaths: [path.join(chassisCss, 'scss/vendor')]
        }
      }
    }
  }
})
