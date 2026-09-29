import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/docs',
      {
        test: {
          name: 'api',
          root: 'api',
          include: ['**/*.test.ts'],
          environment: 'node'
        }
      }
    ]
  }
})
