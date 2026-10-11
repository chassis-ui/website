/**
 * Builds the example into dist/, once per brand: dist/<brand>/ for each brand that
 * `chassis.build.brands` of package.json names. dist/index.html sends a visitor to the
 * first of them.
 *
 * A copy holds:
 * - everything in src/, the same files for every brand
 * - vendor/css/: Chassis CSS, compiled from its Sass source with the design tokens of the brand
 * - vendor/fonts/: the font stylesheets of the brand, with the font files and the licenses
 * - vendor/images/logo/: the logo of the brand
 * - vendor/icons/: the Chassis Icons font stylesheet and the font files it references
 *
 * The fonts and the logo come from chassis-assets, the `vendor/assets` submodule of the
 * repository. Paths are resolved from this file, not the working directory.
 */

import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chassisPostcss } from '@chassis-ui/css/postcss'
import autoprefixer from 'autoprefixer'
import postcss from 'postcss'
import * as sass from 'sass'

const FONT_ROLES = ['text', 'display', 'code']
// The characters the fonts keep, each range in a file of its own, as the site has them:
// `pnpm vendor` of the repository
const FONT_RANGES = ['latin', 'latin-ext']
const LOGO = 'images/logo/chassis-icon-brand.svg'

const root = import.meta.dirname
const src = join(root, 'src')
const dist = join(root, 'dist')
const modules = join(root, 'node_modules')
const cssDir = join(modules, '@chassis-ui/css')
const tokensDir = join(modules, '@chassis-ui/tokens/dist/web/docs')
const iconsDir = join(modules, '@chassis-ui/icons/icons')
const assetsRepo = join(root, '../../vendor/assets')
const assetsCli = join(assetsRepo, 'packages/assets/build/cli.js')

function fail(message) {
  console.error(message)
  process.exit(1)
}

// A brand has the same name here, in @chassis-ui/tokens and in chassis-assets
const brands = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).chassis?.build?.brands

if (!Array.isArray(brands) || brands.length === 0) {
  fail('package.json names no brand: chassis.build.brands is a list such as ["chassis"].')
}

function copy(from, to) {
  if (!existsSync(from)) {
    const hint = from.includes('node_modules') ? '\nRun `pnpm install` at the repository root.' : ''
    fail(`Missing source: ${from}${hint}`)
  }
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to, { recursive: true })
}

// Copies a stylesheet and the files it loads with relative url()s, which stay next to it.
function copyStylesheet(from, to) {
  copy(from, to)
  for (const [, url] of readFileSync(from, 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const file = url.split(/[?#]/)[0]
    copy(join(dirname(from), file), join(dirname(to), file))
  }
}

// Builds the fonts and the logos of every brand with chassis-assets, into a folder that is
// removed at the end. The build writes <out>/web/docs/<brand>/. The package that subsets
// the fonts is installed in the submodule by `pnpm vendor`.
function buildAssets(out) {
  if (!existsSync(assetsCli)) {
    fail(`Missing source: ${assetsCli}\nRun \`pnpm vendor\` at the repository root.`)
  }

  const args = ['build', '--cwd', assetsRepo, '--out', out, '--quiet']
  args.push('--brand', ...brands, '--app', 'docs', '--platform', 'web')
  args.push('--include', 'fonts/**', 'images/logo/**')
  args.push('--subset', ...FONT_RANGES, '--split')

  try {
    execFileSync(process.execPath, [assetsCli, ...args], { stdio: 'inherit' })
  } catch {
    fail('The build of vendor/assets failed. Run `pnpm vendor` at the repository root.')
  }
}

// Chassis CSS loads its design tokens as `chassis-tokens`, and the importer answers with
// the tokens of the brand. A project with one brand has a `_chassis-tokens.scss` on its
// Sass load paths instead, which forwards the same file.
async function compileCss(brand) {
  const tokens = join(tokensDir, brand, 'main.scss')

  if (!existsSync(tokens)) {
    fail(`@chassis-ui/tokens has no brand '${brand}': ${tokens} is missing.`)
  }

  const { css } = sass.compileString('@use "@chassis-ui/css/scss/chassis";', {
    importers: [
      { findFileUrl: (url) => (url === 'chassis-tokens' ? pathToFileURL(tokens) : null) }
    ],
    loadPaths: [modules],
    style: 'compressed'
  })

  // The prefix of the custom properties, `--cx-`, is added after Sass. Autoprefixer finds
  // its browser list from `from`: the `.browserslistrc` of Chassis CSS.
  const result = await postcss([...chassisPostcss(), autoprefixer()]).process(css, {
    from: join(cssDir, 'scss/chassis.scss'),
    map: false
  })

  return result.css
}

rmSync(dist, { recursive: true, force: true })

const assetsOut = mkdtempSync(join(tmpdir(), 'chassis-example-'))

try {
  buildAssets(assetsOut)

  for (const brand of brands) {
    const target = join(dist, brand)
    const assets = join(assetsOut, 'web/docs', brand)

    copy(src, target)

    mkdirSync(join(target, 'vendor/css'), { recursive: true })
    writeFileSync(join(target, 'vendor/css/chassis.min.css'), await compileCss(brand))

    for (const role of FONT_ROLES) {
      copyStylesheet(join(assets, `fonts/${role}.css`), join(target, `vendor/fonts/${role}.css`))
      copy(
        join(assets, `fonts/${role}-license.txt`),
        join(target, `vendor/fonts/${role}-license.txt`)
      )
    }

    copy(join(assets, LOGO), join(target, 'vendor', LOGO))

    copyStylesheet(
      join(iconsDir, 'chassis-icons.min.css'),
      join(target, 'vendor/icons/chassis-icons.min.css')
    )

    console.log(`Built ${target}`)
  }

  // The example itself has no page: its address opens the first brand
  writeFileSync(
    join(dist, 'index.html'),
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vanilla HTML example · Chassis</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=./${brands[0]}/"></head><body></body></html>\n`
  )
} finally {
  rmSync(assetsOut, { recursive: true, force: true })
}
