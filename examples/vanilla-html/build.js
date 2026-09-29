/**
 * Builds the example into dist/:
 * - copies everything in src/ to dist/
 * - copies the minified Chassis CSS to dist/vendor/css/
 * - copies the Chassis Icons font stylesheet and the font files it references to dist/vendor/icons/
 *
 * Uses Node built-ins only. Paths are resolved from this file, not the working directory.
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'

const root = import.meta.dirname
const src = join(root, 'src')
const dist = join(root, 'dist')
const cssDir = join(root, 'node_modules/@chassis-ui/css/dist/css')
const iconsDir = join(root, 'node_modules/@chassis-ui/icons/icons')

function copy(from, to) {
  if (!existsSync(from)) {
    const hint = from.includes('node_modules') ? '\nRun `pnpm install` at the repository root.' : ''
    console.error(`Missing source: ${from}${hint}`)
    process.exit(1)
  }
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to, { recursive: true })
}

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist)

copy(src, dist)
copy(join(cssDir, 'chassis.min.css'), join(dist, 'vendor/css/chassis.min.css'))

// The icon stylesheet loads its fonts with relative url()s, so copy each one next to it.
const iconsCss = join(iconsDir, 'chassis-icons.min.css')
copy(iconsCss, join(dist, 'vendor/icons/chassis-icons.min.css'))
for (const [, url] of readFileSync(iconsCss, 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
  const file = url.split(/[?#]/)[0]
  copy(join(iconsDir, file), join(dist, 'vendor/icons', file))
}

console.log(`Built ${dist}`)
