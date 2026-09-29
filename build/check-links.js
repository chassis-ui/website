#!/usr/bin/env node

/*!
 * Link checker
 *
 * Without an argument, checks every page of the built site in `_site`, and every link,
 * anchor and asset on them that stays on the site. It starts from each page, not from the
 * home page alone, because some pages are reached only through a redirect page, which a
 * crawler does not follow. Links into the proxied projects, such as `/css/`, are left out,
 * because their pages are not part of this build.
 *
 * With a URL, crawls that deployment instead, the proxied projects included, for example
 * `node build/check-links.js https://staging.chassis-ui.com`. A broken link on a page of
 * this site fails the run. A broken link on a page of a proxied project, or a link from
 * this site into a proxied project that fails, is listed as a warning, by project: it is
 * fixed in that project's repository, or that project's deployment is down or protected.
 *
 * Links to other hosts are left out in both modes, so that the result does not depend on
 * third-party sites.
 *
 * Licensed under MIT
 */

import { globby } from 'globby'
import { LinkChecker, LinkState } from 'linkinator'

// The paths that `vercel.json` rewrites to the sites of the other projects
const PROXIED = /^\/(assets|css|figma|icons|react|tokens)(\/|$)/

const target = process.argv[2]
const live = target ? new URL(target) : null

// Locally, linkinator serves `_site` on a port of its own, and every link is resolved
// against it. The first link it checks is one of the pages.
let local

async function linksToSkip(link) {
  const url = new URL(link)

  if (live) return url.host !== live.host

  local ??= url.host
  if (url.host !== local) return true

  return PROXIED.test(url.pathname)
}

// The project a page belongs to: a proxied project, or this site
function owner(page) {
  if (!live || !page) return 'website'

  return new URL(page).pathname.match(PROXIED)?.[1] ?? 'website'
}

// The project a broken link is reported under: the proxied project that it points into,
// or else the project of the page that it is on
function reportedUnder(link) {
  const url = new URL(link.url)

  if (live && url.host === live.host) {
    const project = url.pathname.match(PROXIED)?.[1]

    if (project) return project
  }

  return owner(link.parent)
}

// `vercel.json` routes `/static/*` by the `Referer` header, which linkinator does not
// send. A file of a proxied project therefore looks missing until it is requested again
// with the project's root as the referrer, which is what the rules match. Every page of a
// project loads the same files, so each file is requested once per project.
const referrerChecks = new Map()

function foundWithReferrer(link) {
  if (!link.parent || !new URL(link.url).pathname.startsWith('/static/')) return false

  const project = owner(link.parent)
  const key = `${project} ${link.url}`

  if (!referrerChecks.has(key)) {
    referrerChecks.set(
      key,
      fetch(link.url, { method: 'HEAD', headers: { referer: `${live.origin}/${project}/` } })
        .then((response) => response.ok)
        .catch(() => false)
    )
  }

  return referrerChecks.get(key)
}

// Pagefind's files and the preview page of chassis-icons are not pages of the site
const startPages = live
  ? [live.href]
  : await globby('**/*.html', { cwd: '_site', ignore: ['pagefind/**', 'static/**'] })

const checker = new LinkChecker()
let crawled = 0

checker.on('pagestart', () => {
  crawled++
  if (crawled % 100 === 0) console.log(`… ${crawled} pages`)
})

const { links } = await checker.check({
  path: startPages,
  serverRoot: live ? undefined : '_site',
  recurse: true,
  checkFragments: true,
  linksToSkip,
  // A deployment is crawled politely, and a request that fails is tried again
  concurrency: live ? 20 : 100,
  retryErrors: Boolean(live),
  retryErrorsCount: 3,
  timeout: 30_000
})

const candidates = links.filter((link) => link.state === LinkState.BROKEN)
const found = await Promise.all(
  candidates.map((link) => live && owner(link.parent) !== 'website' && foundWithReferrer(link))
)
const missing = candidates.filter((_, index) => !found[index])

// A missing page is answered with the 404 page, which linkinator checks like any other.
// Its links belong to the 404 page, not to the missing page, so they are left out.
const missingUrls = new Set(missing.map((link) => link.url))
const broken = missing.filter((link) => !missingUrls.has(link.parent))

const byOwner = Map.groupBy(broken, reportedUnder)
const checked = links.filter((link) => link.state !== LinkState.SKIPPED).length

// One line per broken URL, with the number of pages that link to it and one of them
for (const [project, list] of byOwner) {
  const log = project === 'website' ? console.error : console.warn
  const byUrl = Map.groupBy(list, (link) => link.url)

  log(`\n${project === 'website' ? 'Broken' : `Broken on the ${project} site`}: ${byUrl.size}`)

  for (const [url, found] of byUrl) {
    const pages = found.length === 1 ? '' : ` and ${found.length - 1} more`

    log(`[${found[0].status ?? 'error'}] ${url}\n    on ${found[0].parent ?? '(start)'}${pages}`)
  }
}

const own = new Set(byOwner.get('website')?.map((link) => link.url)).size
const others = new Set(broken.map((link) => link.url)).size - own

console.log(
  `\n${checked} links on ${crawled} pages of ${live ? live.origin : '_site'}: ` +
    `${own} broken on this site, ${others} on proxied sites`
)

process.exitCode = own ? 1 : 0
