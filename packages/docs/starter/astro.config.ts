import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import { chassisDocs } from '@chassis-ui/docs/integration'
import { chassisStatic } from './src/libs/static'

// https://astro.build/config
export default defineConfig({
  integrations: [chassisDocs(), chassisStatic(), mdx()]
})
