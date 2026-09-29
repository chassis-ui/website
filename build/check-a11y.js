#!/usr/bin/env node

/*!
 * Accessibility check
 *
 * Serves the built site in `_site` and runs axe on every page, in the light and the dark
 * colour mode, against WCAG 2.2 level A and AA. Fails when axe finds a violation. Colour
 * contrast is left out until the design is reviewed, see F35 in ref/ROADMAP.md. It uses
 * the Chrome that is installed on the machine, as GitHub's runners have, so nothing is
 * downloaded.
 *
 * Licensed under MIT
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { AxeBuilder } from '@axe-core/playwright'
import { globby } from 'globby'
import { chromium } from 'playwright-core'

const ROOT = path.resolve('_site')
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const SCHEMES = ['light', 'dark']
// Contrast depends on the design, which the maintainer reviews separately
const DISABLED_RULES = ['color-contrast']

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
}

// Enough of Vercel's behaviour for the pages to load: `/about/` serves `about/index.html`,
// and a missing file gets `404.html`
async function serve(request, response) {
  const url = new URL(request.url, 'http://localhost')
  let file = path.join(ROOT, decodeURIComponent(url.pathname))

  if (!file.startsWith(ROOT)) return response.writeHead(403).end()

  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
    response.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream'
    })
    response.end(await readFile(file))
  } catch {
    response.writeHead(404, { 'Content-Type': TYPES['.html'] })
    response.end(await readFile(path.join(ROOT, '404.html')))
  }
}

const server = createServer(serve)

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

const origin = `http://127.0.0.1:${server.address().port}`

// Pagefind's files and the preview page of chassis-icons are not pages of the site. A
// redirect page has no content, and it navigates away while axe runs.
const files = await globby('**/*.html', { cwd: ROOT, ignore: ['pagefind/**', 'static/**'] })
const pages = []

for (const file of files) {
  const html = await readFile(path.join(ROOT, file), 'utf8')

  if (!/<meta http-equiv="refresh"/i.test(html)) pages.push(`/${file.replace(/index\.html$/, '')}`)
}

const browser = await chromium.launch({ channel: 'chrome' })
const violations = new Map()

try {
  for (const colorScheme of SCHEMES) {
    const context = await browser.newContext({ colorScheme })

    for (const page of pages) {
      const tab = await context.newPage()

      await tab.goto(origin + page, { waitUntil: 'load' })

      const results = await new AxeBuilder({ page: tab })
        .withTags(TAGS)
        .disableRules(DISABLED_RULES)
        .analyze()

      for (const violation of results.violations) {
        const entry = violations.get(violation.id) ?? { ...violation, found: [] }

        entry.found.push(...violation.nodes.map((node) => ({ page, colorScheme, node })))
        violations.set(violation.id, entry)
      }

      await tab.close()
    }

    await context.close()
  }
} finally {
  await browser.close()
  server.close()
}

// One block per rule, with the elements it found, each once, and where
for (const { id, impact, help, helpUrl, found } of violations.values()) {
  const byTarget = Map.groupBy(found, ({ node }) => node.target.join(' '))

  console.error(`\n[${impact}] ${id}: ${help}\n  ${helpUrl}`)

  for (const [target, where] of byTarget) {
    const places = [...new Set(where.map(({ page, colorScheme }) => `${page} (${colorScheme})`))]
    const summary = where[0].node.failureSummary?.split('\n').slice(1).join(' ').trim()

    console.error(`  ${target}\n    ${summary ?? ''}\n    on ${places.slice(0, 3).join(', ')}`)
    if (places.length > 3) console.error(`    and ${places.length - 3} more`)
  }
}

console.log(
  `\n${pages.length} pages in ${SCHEMES.length} colour modes: ` +
    `${violations.size} rules violated`
)

process.exitCode = violations.size ? 1 : 0
