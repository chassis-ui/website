import { defineConfig } from 'astro/config'
import { chassisDocs } from '../../src/integration'

// A minimal site for the component tests. It is not built.
export default defineConfig({
  // `astro sync` writes the content data store to the cache directory, and the dev server
  // that the tests run in reads it from `.astro/`. This makes them the same directory.
  cacheDir: '.astro',
  // Without the toolbar, the dev server does not annotate elements with their source file.
  devToolbar: { enabled: false },
  integrations: [chassisDocs({ styles: [] })]
})
