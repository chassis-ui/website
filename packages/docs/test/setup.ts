import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The content collections of the fixture are read from the data store that `astro sync`
// writes. The container API does not sync by itself. It runs in a separate process, because
// Vite resolves `astro` to its client entry here.
export default function setup() {
  const require = createRequire(import.meta.url)
  const astroBin = path.join(path.dirname(require.resolve('astro/package.json')), 'bin/astro.mjs')
  const root = fileURLToPath(new URL('fixture/', import.meta.url))

  execFileSync(process.execPath, [astroBin, 'sync', '--root', root], { stdio: 'pipe' })
}
