// Compiles Chassis CSS for a brand. `writeBrandCSS()` runs this file in a process of its own:
// Astro loads its config through a Vite module runner, which is closed by the time of the
// hooks, and a dynamic import of the peers would fail there.

import fs from 'node:fs'
import path from 'node:path'
import { CommandError, importPeer, log } from './shared.js'

const { loadPaths, cssDir, destination } = JSON.parse(process.argv[2])

try {
  const sass = await importPeer('sass')
  const { default: postcss } = await importPeer('postcss')
  const { default: autoprefixer } = await importPeer('autoprefixer')

  await importPeer('postcss-prefix-custom-properties')

  const { chassisPostcss } = await import('@chassis-ui/css/postcss')

  fs.mkdirSync(path.join(destination, 'css'), { recursive: true })

  await Promise.all(
    [
      ['expanded', 'css/chassis.css'],
      ['compressed', 'css/chassis.min.css']
    ].map(async ([style, file]) => {
      const { css } = await sass.compileStringAsync('@use "@chassis-ui/css/scss/chassis";', {
        loadPaths,
        quietDeps: true,
        style
      })
      // Autoprefixer finds its browser list from `from`: the `.browserslistrc` of Chassis CSS.
      const result = await postcss([...chassisPostcss(), autoprefixer()]).process(css, {
        from: path.join(cssDir, 'scss/chassis.scss'),
        map: false
      })

      fs.writeFileSync(path.join(destination, file), result.css)
    })
  )
} catch (error) {
  if (!(error instanceof CommandError)) throw error

  log(error.message, 'error')
  process.exitCode = 1
}
