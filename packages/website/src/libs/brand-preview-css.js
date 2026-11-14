// Compiles the Chassis CSS that the brand preview of the home page needs, for a second brand,
// scoped to one class. `writeBrandPreview()` runs this file in a process of its own: Astro
// loads its config through a Vite module runner, which is closed by the time of the hooks.
//
// The output holds only the custom properties of the brand (the `:root` of Chassis CSS and its
// themes, in the `root` layer), under the scope class. The components of the card are those of
// the page: their rules are the same for every brand and read these properties. The card sets
// its theme with `data-cx-theme`, so the theme rules apply to the scope element too.

import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const { root, tokens, selector, file } = JSON.parse(process.argv[2])

const require = createRequire(path.join(root, 'package.json'))
const sass = require('sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const { chassisPostcss } = await import(
  require.resolve('@chassis-ui/css/postcss', { paths: [root] })
)

// A load path whose `_chassis-tokens.scss` forwards the tokens of the brand.
const loadPath = path.join(root, 'node_modules/.cache/chassis-website/brand-preview')
fs.mkdirSync(loadPath, { recursive: true })
fs.writeFileSync(
  path.join(loadPath, '_chassis-tokens.scss'),
  `@forward "${path.relative(loadPath, tokens).split(path.sep).join('/')}";\n`
)

const { css } = sass.compileString('@use "@chassis-ui/css/scss/root";', {
  loadPaths: [loadPath, path.join(root, 'node_modules')],
  quietDeps: true,
  style: 'compressed'
})

/** Puts a selector of Chassis CSS under the scope class. */
function scope(selectorText) {
  if (selectorText === ':root') return selector
  if (selectorText.startsWith('[data-cx-theme')) {
    return `${selector}${selectorText}, ${selector} ${selectorText}`
  }
  if (selectorText.startsWith('[dir=')) return `${selectorText} ${selector}`
  // `:root:not(…)` keeps the scope where `:root` was.
  if (selectorText.startsWith(':root')) return `${selector}${selectorText.slice(5)}`
  return `${selector} ${selectorText}`
}

const scopePlugin = {
  postcssPlugin: 'chassis-website-brand-scope',
  Rule(rule) {
    if (rule.__scoped) return
    rule.selectors = rule.selectors.map(scope)
    rule.__scoped = true
  }
}

// On the page, the custom properties of `:root` sit on the root element and the utilities of an
// element below it set their own (`bg-even` sets `--cx-bg-color`). Scoped to a class, they sit on
// the card itself, where they are unlayered and would win over the layered utilities of the
// card. In the `root` layer that Chassis declares for them, the utilities win, as on the page.
const rootLayerPlugin = {
  postcssPlugin: 'chassis-website-brand-root-layer',
  OnceExit(css, { AtRule }) {
    const unlayered = css.nodes.filter(
      (node) =>
        node.type === 'rule' ||
        (node.type === 'atrule' && !['layer', 'font-face', 'charset'].includes(node.name))
    )

    if (unlayered.length === 0) return

    const layer = new AtRule({ name: 'layer', params: 'root' })
    unlayered.forEach((node) => layer.append(node))
    css.append(layer)
  }
}

const plugins = [...chassisPostcss(), scopePlugin, rootLayerPlugin, autoprefixer()]
const result = await postcss(plugins).process(css, {
  from: undefined,
  map: false
})

fs.mkdirSync(path.dirname(file), { recursive: true })
fs.writeFileSync(file, result.css)
