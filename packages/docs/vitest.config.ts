/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { getViteConfig } from 'astro/config'

const fixtureRoot = fileURLToPath(new URL('test/fixture/', import.meta.url))

// The Vite config of the fixture site, so that tests can render components with the
// container API. The unit tests run in it too, which costs nothing.
export default getViteConfig(
  {
    test: {
      name: 'docs',
      root: import.meta.dirname,
      include: ['test/**/*.test.ts'],
      globalSetup: ['test/setup.ts']
    }
  },
  { root: fixtureRoot, logLevel: 'error' }
)
