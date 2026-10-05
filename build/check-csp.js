#!/usr/bin/env node

/*!
 * Content security policy check
 *
 * Opens pages of a deployment in Chrome and lists what the content security policy of
 * `vercel.json` would block, or blocks: `node build/check-csp.js https://chassis-ui.com`.
 * The policy is a header of the deployment, so there is nothing to check in `_site`. The
 * proxied projects are included, because the header covers their pages too.
 *
 * The sites are static, so a page loads the same files for every visitor, and a browser
 * that opens it sees what the reports of the visitors would say. Besides loading a page,
 * the check scrolls through it, for what is loaded lazily, accepts the analytics consent,
 * and searches once in each project. It does not send the contact form.
 *
 * A violation in `ACCEPTED` below is known and left blocked: it is listed and does not
 * fail the check. A project behind Vercel's login, as a staging deployment can be, is
 * skipped and named.
 *
 * It takes the pages from the sitemaps: the home page of each project and an even spread
 * of the others, 25 by default. Vercel challenges an address that requests thousands of
 * pages in an hour, so check every page of one project at a time.
 *
 *   --max <n>       Pages of each project, 25 by default
 *   --all           Every page
 *   --only <names>  Only these projects, e.g. `--only website,css`
 *
 * It uses the Chrome that is installed on the machine, as GitHub's runners have, so
 * nothing is downloaded.
 *
 * Licensed under MIT
 */

import { readdir } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { chromium } from 'playwright-core'

// The paths that `vercel.json` rewrites to the sites of the other projects
const PROXIED = ['assets', 'css', 'figma', 'icons', 'react', 'tokens']
const POLICY_HEADERS = ['content-security-policy', 'content-security-policy-report-only']
// The measurement requests of Google Analytics. The policy is applied before a request
// leaves the browser, so stopping these here hides no violation and counts no visit.
const ANALYTICS_HITS = /^https:\/\/[^/]*(google|doubleclick)[^/]*\/(.*\/)?collect\b/
// Violations that are left blocked on purpose, each with the reason
const ACCEPTED = [
  {
    directive: 'connect-src',
    what: 'https://www.google.com',
    // The Google tag sends a copy of each hit to `www.google.com/g/collect`, for Google's
    // advertising features, which the sites do not use. The hit itself goes to
    // `google-analytics.com`, which the policy allows. See D23 in ref/ROADMAP.md.
    why: 'the copy of each analytics hit that the Google tag sends to google.com'
  }
]

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: 'boolean', default: false },
    max: { type: 'string', default: '25' },
    only: { type: 'string' }
  }
})

if (positionals.length !== 1) {
  console.error('Usage: node build/check-csp.js <url> [--max <n>] [--all] [--only <names>]')
  process.exit(1)
}

const origin = new URL(positionals[0]).origin
const max = options.all ? Infinity : Number(options.max)
const only = options.only?.split(',')

// The project a page belongs to: a proxied project, or this site
function owner(pathname) {
  return PROXIED.find((name) => pathname.startsWith(`/${name}/`)) ?? 'website'
}

async function locations(url) {
  const response = await fetch(url)

  if (!response.ok) return []

  return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)
}

// The paths of the pages that the sitemaps list. A sitemap names the production host, and
// on staging the host of the project's own deployment, so only the path of a page is
// kept, and a sitemap is read from the folder of the index that lists it.
async function sitemapPaths() {
  const paths = new Set()

  for (const prefix of ['', ...PROXIED.map((name) => `/${name}`)]) {
    for (const sitemap of await locations(`${origin}${prefix}/sitemap-index.xml`)) {
      const file = new URL(sitemap).pathname.split('/').pop()

      if (file === 'sitemap-index.xml') continue

      for (const page of await locations(`${origin}${prefix}/${file}`)) {
        paths.add(new URL(page).pathname)
      }
    }
  }

  return paths
}

// The home page, and the others spread evenly over the sorted list
function sample(pages, home) {
  const rest = pages.filter((page) => page !== home).sort()
  const count = Math.min(rest.length, max - 1)
  const picked = Array.from(
    { length: count },
    (_, i) => rest[Math.floor((i * rest.length) / count)]
  )

  return [home, ...picked]
}

const paths = await sitemapPaths()

// The examples are sites of their own, which no sitemap lists
for (const example of await readdir('examples', { withFileTypes: true })) {
  if (example.isDirectory()) paths.add(`/examples/${example.name}/`)
}

const byProject = Map.groupBy(paths, owner)
const projects = ['website', ...PROXIED].filter((name) => !only || only.includes(name))

const violations = new Map()
const accepted = new Map()
const problems = []
const skipped = []
let checked = 0

function record(project, page, { directive, blocked, source }) {
  // An address is cut down to its origin, so that one host is one line
  const what = /^[a-z]+:\/\//.test(blocked) ? new URL(blocked).origin : blocked || 'unknown'
  const known = ACCEPTED.find((entry) => entry.directive === directive && entry.what === what)

  if (known) {
    accepted.set(known, (accepted.get(known) ?? new Set()).add(page))
    return
  }

  const key = `${project} ${directive} ${what}`
  const entry = violations.get(key) ?? {
    project,
    directive,
    what,
    pages: new Set(),
    sources: new Set()
  }

  entry.pages.add(page)
  // The file that asked for it, when that is not the page itself
  if (source && source.replace(origin, '') !== page) entry.sources.add(source.replace(origin, ''))
  violations.set(key, entry)
}

const browser = await chromium.launch({ channel: 'chrome' })

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  let current

  await context.route(ANALYTICS_HITS, (route) => route.abort())
  // The frames of other sites, such as a video, have a policy of their own
  await context.exposeBinding('reportPolicyViolation', (_source, violation) => {
    if (violation.document.startsWith(origin)) record(current.project, current.page, violation)
  })
  await context.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      window.reportPolicyViolation({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
        source: event.sourceFile,
        document: event.documentURI
      })
    })
  })

  for (const project of projects) {
    const home = project === 'website' ? '/' : `/${project}/`
    const pages = sample([...(byProject.get(project) ?? [])], home)
    let searched = false

    for (const page of pages) {
      const tab = await context.newPage()

      current = { project, page }

      try {
        const response = await tab.goto(origin + page, { waitUntil: 'load' })
        const headers = response.headers()

        // Vercel's deployment protection redirects every page of a project to its login
        if (new URL(tab.url()).origin !== origin) {
          skipped.push(`${project} redirects to ${new URL(tab.url()).host}`)
          searched = true
          break
        }

        if (!response.ok()) {
          problems.push(`${page} answered ${response.status()}`)
          continue
        }

        if (!POLICY_HEADERS.some((name) => name in headers)) {
          problems.push(`${page} has no content security policy`)
          continue
        }

        checked++

        const accept = tab.locator('.cxd-consent [data-consent="granted"]')

        if (await accept.isVisible()) await accept.click()

        const trigger = tab.locator('.cxd-search-trigger').first()

        if (!searched && (await trigger.isVisible())) {
          await trigger.click()
          await tab.locator('#cxdSearchDialog-input').fill('color')
          await tab.waitForTimeout(1500)
          await tab.keyboard.press('Escape')
          await tab.keyboard.press('Escape')
          searched = true
        }

        // Images and frames below the fold are loaded when they come near the viewport
        await tab.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
            window.scrollTo(0, y)
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        })
        await tab.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
      } catch (error) {
        problems.push(`${page} did not load: ${error.message.split('\n')[0]}`)
      } finally {
        await tab.close()
      }
    }

    if (!searched) problems.push(`${project}: no page with a search button, search not checked`)
  }
} finally {
  await browser.close()
}

// One block per project, with a line for each directive and host, and where it was found
for (const [project, found] of Map.groupBy(violations.values(), (entry) => entry.project)) {
  console.error(`\n${project}`)

  for (const { directive, what, pages, sources } of found) {
    const places = [...pages]

    console.error(`  ${directive}: ${what}`)
    if (sources.size) console.error(`    from ${[...sources].slice(0, 3).join(', ')}`)
    console.error(
      `    on ${places.slice(0, 3).join(', ')}` +
        (places.length > 3 ? ` and ${places.length - 3} more` : '')
    )
  }
}

for (const [{ directive, what, why }, pages] of accepted) {
  console.log(`\nAccepted, on ${pages.size} pages\n  ${directive}: ${what}\n    ${why}`)
}

if (skipped.length) console.log(`\nSkipped:\n  ${skipped.join('\n  ')}`)
if (problems.length) console.error(`\nNot checked:\n  ${problems.join('\n  ')}`)

console.log(
  `\n${checked} pages of ${projects.length} projects on ${origin}: ` +
    `${violations.size} violations, ${problems.length} not checked`
)

process.exitCode = violations.size || problems.length ? 1 : 0
