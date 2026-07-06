/*!
 * JavaScript for Chassis docs search (https://chassis-ui.com/)
 * Copyright 2024-2026 The Chassis Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

// Custom Pagefind integration. We use `@pagefind/component-ui` only for its
// instance manager / search engine; the trigger, dialog, input, and results
// list are all built from Chassis primitives. No `<pagefind-*>` element is
// ever rendered. Dialog open/close is delegated to the Chassis data-API via
// the trigger and dismiss buttons already in the markup, so no Dialog import
// is needed here.

import { getInstanceManager } from '@pagefind/component-ui'

const DIALOG_SELECTOR = '#cxdSearchDialog'
const SUB_RESULTS_LIMIT = 3
// How long a search may take before we show the loading skeleton. Most queries
// resolve faster, so the previous results stay on-screen instead of flashing.
const LOADING_SKELETON_DELAY_MS = 200
const RECENT_STORAGE_KEY = 'cxd:search:recent'
const RECENT_LIMIT = 5

// ─── Multi-site search ────────────────────────────────────────────────────────
// Every Chassis project deploys its own Pagefind index under its own path
// prefix (e.g. `/tokens/pagefind/`), matching the prefix chassis-ui.com's
// Vercel rewrites proxy that project under (see `ref/VERCEL_CONFIG.md`).
// This lets one shared instance merge every project's index into a single,
// site-filterable search — no cross-origin requests required, since
// `chassis-ui.com/<slug>/...` and `<slug>.vercel.app/<slug>/...` both resolve
// the same root-relative bundle path.

/** All Chassis projects with their own Pagefind index, in nav order. `website` is the hub (root-level index, no path prefix). */
const CHASSIS_SITES = [
  { slug: 'website', label: 'Website' },
  { slug: 'tokens', label: 'Tokens' },
  { slug: 'css', label: 'CSS' },
  { slug: 'assets', label: 'Assets' },
  { slug: 'icons', label: 'Icons' },
  { slug: 'figma', label: 'Figma' }
]

// Hosts where every project's index is *expected* to be reachable at its
// root-relative bundle path via Vercel's proxy rewrites. Everywhere else
// (local dev, direct `*.vercel.app` preview deployments) only this site's own
// pages exist, so merging would always 404 — not attempted there at all.
const CANONICAL_HOSTS = new Set(['chassis-ui.com', 'staging.chassis-ui.com'])

const getBundlePath = (slug) => (slug === 'website' ? '/pagefind/' : `/${slug}/pagefind/`)

const getCurrentSite = () => {
  const [, firstSegment] = typeof location === 'undefined' ? [] : location.pathname.split('/')
  return CHASSIS_SITES.find((site) => site.slug === firstSegment) ?? CHASSIS_SITES[0]
}

const isCanonicalHost = () =>
  typeof location !== 'undefined' && CANONICAL_HOSTS.has(location.hostname)

const currentSite = getCurrentSite()

// Pagefind derives `baseUrl` from `bundlePath` by stripping the trailing
// `pagefind` segment (e.g. `/tokens/pagefind/` -> `/tokens/`), then prepends
// that to every result's raw URL. Those raw URLs are already site-root-relative
// (e.g. `tokens/docs/...`, because that's where the page actually lives inside
// `_site`), so the auto-derived baseUrl would double up the prefix into
// `/tokens/tokens/docs/...`. Force it back to `/` for every index.
const BASE_URL = '/'

// NOTE: we deliberately do NOT pass `mergeIndex` here. `@pagefind/component-ui`
// awaits every entry in that array back-to-back with no try/catch — if a
// single sibling site's index 404s (e.g. mid-rollout, one repo deployed
// before another), the whole `__doLoad__` throws and search breaks entirely,
// including this site's own results. We instead merge additional sites
// ourselves afterwards, in `mergeAdditionalSites()` below, so a single
// unreachable sibling is skipped rather than taking everything down.
const instance = getInstanceManager().getInstance('default', {
  bundlePath: getBundlePath(currentSite.slug),
  baseUrl: BASE_URL,
  mergeFilter: { site: currentSite.slug }
})

// Default filter scope: the website (hub) defaults to searching everywhere;
// every project site defaults to its own results, but can still be widened
// or switched via the `cxd-search-filter` control.
if (currentSite.slug !== 'website') {
  instance.searchFilters = { site: currentSite.slug }
}

let mergeAttempted = false

// How long to wait for a sibling's Pagefind entry file before assuming it's
// unreachable (bad deploy, rollout in progress, host down, etc.).
const PROBE_TIMEOUT_MS = 4000

// Mirrors Pagefind's own language selection in `PagefindInstance.findIndex`:
// exact `<html lang>` match, then its base subtag, then the language with the
// most pages. Needed so the probe below checks the same chunk `init()` will
// actually request.
const getPreferredLanguageHash = (entry) => {
  const languages = entry?.languages
  if (!languages) return null
  const htmlLang = document.documentElement.getAttribute('lang')?.toLowerCase()
  if (htmlLang && languages[htmlLang]) return languages[htmlLang].hash
  const base = htmlLang?.split('-')[0]
  if (base && languages[base]) return languages[base].hash
  const [topLanguage] = Object.values(languages).sort((a, b) => b.page_count - a.page_count)
  return topLanguage?.hash ?? null
}

/**
 * Checks whether a sibling site's Pagefind bundle actually exists, without
 * touching the shared `pf` instance. This matters because a *failed*
 * `pf.mergeIndex()` call corrupts that instance beyond recovery — there is no
 * public API to detach a bad merge, and every future search (including this
 * site's own) throws the same error afterwards.
 *
 * `init()` performs two fetches, not one: `pagefind-entry.json`, then the
 * language-specific `pagefind.<hash>.pf_meta` chunk it points to. Checking
 * only the entry file misses exactly the failure this is meant to guard
 * against — a deploy mid-rollout where the entry file has already updated to
 * reference a hash whose chunk hasn't finished uploading (or was purged) yet.
 * So we probe both before ever calling `mergeIndex`.
 */
const isBundleReachable = async (bundlePath) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const entryResponse = await fetch(`${bundlePath}pagefind-entry.json`, {
      signal: controller.signal
    })
    if (!entryResponse.ok) return false

    const hash = getPreferredLanguageHash(await entryResponse.json())
    if (!hash) return false

    const metaResponse = await fetch(`${bundlePath}pagefind.${hash}.pf_meta`, {
      signal: controller.signal
    })
    return metaResponse.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Loads this site's own Pagefind bundle, then merges every other Chassis
 * site's index in, one at a time. Each sibling is probed first (see
 * `isBundleReachable`) so an unreachable one — a bad deploy, a rollout still
 * in progress across the (separate) Chassis repos, etc. — is silently skipped
 * instead of breaking search for everyone. Safe to call multiple times; only
 * does real work once.
 */
const mergeAdditionalSites = async () => {
  if (mergeAttempted) return
  mergeAttempted = true

  await instance.triggerLoad()
  const pf = instance.__pagefind__
  if (!pf || !isCanonicalHost()) return

  const siblings = CHASSIS_SITES.filter((site) => site.slug !== currentSite.slug)
  await Promise.allSettled(
    siblings.map(async (site) => {
      const bundlePath = getBundlePath(site.slug)
      if (!(await isBundleReachable(bundlePath))) {
        console.warn(
          `Chassis search: "${site.slug}" index not reachable at ${bundlePath}, skipping`
        )
        return
      }
      try {
        await pf.mergeIndex(bundlePath, { baseUrl: BASE_URL, mergeFilter: { site: site.slug } })
      } catch (error) {
        console.warn(`Chassis search: failed to merge the "${site.slug}" index`, error)
      }
    })
  )
}

// ─── Recent visits ────────────────────────────────────────────────────────────
// Opt-out via Do Not Track; silently no-op when storage is unavailable.

const isDoNotTrackEnabled = () => {
  if (typeof navigator === 'undefined') return false
  return (
    navigator.doNotTrack === '1' || globalThis.doNotTrack === '1' || navigator.msDoNotTrack === '1'
  )
}

const getRecentVisits = () => {
  if (isDoNotTrackEnabled()) return []
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.url) : []
  } catch {
    return []
  }
}

const saveRecentVisit = (visit) => {
  if (isDoNotTrackEnabled() || !visit?.url) return
  try {
    const existing = getRecentVisits().filter((item) => item.url !== visit.url)
    const next = [visit, ...existing].slice(0, RECENT_LIMIT)
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage is best-effort.
  }
}

const clearRecentVisits = () => {
  try {
    localStorage.removeItem(RECENT_STORAGE_KEY)
  } catch {
    // Ignore.
  }
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])

// Single template for every clickable row: top-level results, sub-results, and
// recently visited items. `titleHtml`/`excerptHtml` name the contract, not just
// describe it: callers must pass already-safe HTML, either by running plain
// text through `escapeHtml` (recents) or by using Pagefind's own pre-marked
// excerpt (search results, which embed `<mark>` highlights).
const renderItem = ({ url, titleHtml, excerptHtml = '', icon, sub = false }) => `
  <a class="cxd-search-item${sub ? ' cxd-search-subitem' : ''}" href="${escapeHtml(url)}">
    <svg class="icon cxd-search-item-icon" width="16" height="16" aria-hidden="true">
      <use href="/static/icons/chassis-icons.svg#${icon}"></use>
    </svg>
    <div class="cxd-search-item-body">
      <div class="cxd-search-item-title">${titleHtml}</div>
      ${excerptHtml ? `<div class="cxd-search-item-excerpt">${excerptHtml}</div>` : ''}
    </div>
  </a>
`

// Shared wrapper for every rendered list of rows (recents, top-level results).
const renderResultsList = (itemsHtml) =>
  `<ol class="list flush cxd-search-results-list">${itemsHtml}</ol>`

// Wires `handlers` (eventType -> bound listener) onto `target` and returns a
// cleanup function that removes them all — the bind/track/remove dance every
// element below otherwise repeats by hand in connectedCallback/disconnectedCallback.
const addListeners = (target, handlers) => {
  for (const [type, handler] of Object.entries(handlers)) {
    target.addEventListener(type, handler)
  }
  return () => {
    for (const [type, handler] of Object.entries(handlers)) {
      target.removeEventListener(type, handler)
    }
  }
}

// ─── Custom elements ──────────────────────────────────────────────────────────

class CxdSearchInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input')
    if (!this.input) return

    this.inputEl = this.input
    instance.registerInput(this, { keyboardNavigation: true })

    this._removeListeners = addListeners(this.input, {
      input: this._onInput.bind(this),
      keydown: this._onKeydown.bind(this)
    })

    this.input.addEventListener('focus', () => mergeAdditionalSites(), { once: true })
  }

  disconnectedCallback() {
    this._removeListeners?.()
  }

  _onInput(event) {
    instance.triggerSearch(event.target.value)
  }

  _onKeydown(event) {
    // ArrowDown jumps focus to the first link in the next results component.
    if (event.key === 'ArrowDown' && instance.focusNextResults(this)) {
      event.preventDefault()
      return
    }

    // Enter follows the first result link.
    // Always preventDefault so the form never implicit-submits.
    if (event.key === 'Enter') {
      event.preventDefault()
      const dialogEl = this.closest('dialog')
      dialogEl?.querySelector('.cxd-search-item')?.click()
    }
  }

  focus() {
    this.input?.focus()
  }
}

class CxdSearchResults extends HTMLElement {
  connectedCallback() {
    instance.registerResults(this, { keyboardNavigation: true })

    instance.on('loading', () => this._renderLoading(), this)
    instance.on('results', (result) => this._renderResults(result), this)
    instance.on('error', (error) => this._renderError(error), this)

    this._removeListeners = addListeners(this, {
      keydown: this._onKeydown.bind(this),
      click: this._onClick.bind(this)
    })

    this._renderEmpty()
  }

  disconnectedCallback() {
    this._removeListeners?.()
    this._clearLoadingTimer()
  }

  _onClick(event) {
    if (event.target.closest('[data-cxd-search-clear-recent]')) {
      event.preventDefault()
      clearRecentVisits()
      this._renderEmpty()
      instance.focusInputAndType(this, '')
    }
  }

  _getLinks() {
    return [...this.querySelectorAll('.cxd-search-item')]
  }

  _onKeydown(event) {
    const link = event.target.closest('.cxd-search-item')
    if (!link) return

    const links = this._getLinks()
    const index = links.indexOf(link)

    switch (event.key) {
      case 'ArrowDown': {
        const next = links[index + 1]
        if (next) {
          event.preventDefault()
          next.focus()
        }
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (index === 0) {
          instance.focusPreviousInput(this)
        } else {
          links[index - 1].focus()
        }
        break
      }
      case 'Home': {
        if (links[0]) {
          event.preventDefault()
          links[0].focus()
        }
        break
      }
      case 'End': {
        const last = links.at(-1)
        if (last) {
          event.preventDefault()
          last.focus()
        }
        break
      }
      case 'Backspace': {
        event.preventDefault()
        instance.focusInputAndDelete(this)
        break
      }
      default: {
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault()
          instance.focusInputAndType(this, event.key)
        }
      }
    }
  }

  _clearLoadingTimer() {
    if (this._loadingTimer) {
      clearTimeout(this._loadingTimer)
      this._loadingTimer = null
    }
  }

  _renderEmpty() {
    this._clearLoadingTimer()
    if (instance.searchTerm) return

    const recents = getRecentVisits()
    if (recents.length === 0) {
      this.innerHTML = `<div class="cxd-search-empty">Start typing to search…</div>`
      return
    }

    this.innerHTML = `
      <div class="cxd-search-recent">
        <div class="cxd-search-recent-header">
          <span class="cxd-search-recent-label">Recently visited</span>
          <button type="button" class="cxd-search-recent-clear" data-cxd-search-clear-recent>Clear</button>
        </div>
        ${renderResultsList(
          recents
            .map((visit) => {
              const isSubLink = visit.url.includes('#')
              return `
              <li class="cxd-search-result">
                ${renderItem({
                  url: visit.url,
                  titleHtml: escapeHtml(visit.title),
                  excerptHtml: escapeHtml(visit.excerpt),
                  icon: isSubLink ? 'hashtag-outline' : 'file-outline',
                  sub: isSubLink
                })}
              </li>
            `
            })
            .join('')
        )}
      </div>
    `
  }

  _renderLoading() {
    this._clearLoadingTimer()
    this._loadingTimer = setTimeout(() => {
      this._loadingTimer = null
      this._paintLoading()
    }, LOADING_SKELETON_DELAY_MS)
  }

  _paintLoading() {
    this.innerHTML = `
      <div class="cxd-search-loading skeleton-glow" role="status" aria-live="polite">
        <span class="visually-hidden">${escapeHtml(instance.translate('searching') || 'Searching…')}</span>
        ${Array.from(
          { length: 3 },
          () => `
          <div class="cxd-search-item">
            <div class="icon cxd-search-icon skeleton">
            </div>
            <div class="cxd-search-item-body">
              <div class="skeleton col-4"></div>
              <div class="skeleton col-12"></div>
            </div>
          </div>
        `
        ).join('')}
      </div>
    `
  }

  _renderError(error) {
    this._clearLoadingTimer()
    const message =
      error?.message || instance.translate('error_text') || 'Something went wrong with search.'
    this.innerHTML = `<div class="cxd-search-error" role="alert">${escapeHtml(message)}</div>`
  }

  async _renderResults(searchResult) {
    this._clearLoadingTimer()
    const term = instance.searchTerm

    if (!term) {
      this._renderEmpty()
      return
    }

    const rawResults = searchResult?.results ?? []
    if (rawResults.length === 0) {
      const zero =
        instance.translate('zero_results', { SEARCH_TERM: term }) || `No results for "${term}"`
      this.innerHTML = `<div class="cxd-search-empty">${escapeHtml(zero)}</div>`
      return
    }

    const top = rawResults.slice(0, 5)
    const settled = await Promise.all(top.map((raw) => raw.data().catch(() => null)))
    const data = settled.filter(Boolean)

    if (instance.searchTerm !== term) return // newer search started

    this.innerHTML = renderResultsList(data.map((result) => this._renderResult(result)).join(''))
  }

  _renderResult(result) {
    const title = result.meta?.title || result.url
    const subResults = instance.getDisplaySubResults(result, SUB_RESULTS_LIMIT)

    const subResultsHtml =
      subResults.length === 0
        ? ''
        : `
      <ul class="list plain cxd-search-subresults">
        ${subResults
          .map(
            (sub) => `
          <li class="list-item">
            ${renderItem({ url: sub.url, titleHtml: escapeHtml(sub.title), excerptHtml: sub.excerpt, icon: 'hashtag-outline', sub: true })}
          </li>
        `
          )
          .join('')}
      </ul>
    `

    return `
      <li class="list-item cxd-search-result">
        ${renderItem({ url: result.url, titleHtml: escapeHtml(title), excerptHtml: result.excerpt, icon: 'file-outline' })}
        ${subResultsHtml}
      </li>
    `
  }
}

// ─── Site filter ──────────────────────────────────────────────────────────────
// Dropdown letting the visitor scope results to a single project, or back out
// to "Everywhere". Always rendered (see `CxdSearchFilter` below) — filtering to
// a site that hasn't actually been merged in just yields no results.

const FILTER_OPTIONS = [{ slug: '', label: 'Everywhere' }, ...CHASSIS_SITES]

class CxdSearchFilter extends HTMLElement {
  connectedCallback() {
    this.select = this.querySelector('select')
    if (!this.select) return

    // Always rendered — even outside merging (local dev, direct preview
    // deployments) the current site's own results are tagged with `site`, so
    // "Everywhere" and the current site both work; switching to a *different*
    // site just yields no results until it's actually merged in.
    this.hidden = false

    this.select.innerHTML = FILTER_OPTIONS.map(
      (option) => `<option value="${option.slug}">${escapeHtml(option.label)}</option>`
    ).join('')
    this.select.value = currentSite.slug === 'website' ? '' : currentSite.slug

    this._removeListeners = addListeners(this.select, {
      change: this._onChange.bind(this)
    })
  }

  disconnectedCallback() {
    this._removeListeners?.()
  }

  _onChange() {
    const value = this.select.value
    instance.triggerSearchWithFilters(instance.searchTerm, value ? { site: value } : {})
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

const defineSearchCustomElements = () => {
  if (!customElements.get('cxd-search-input')) {
    customElements.define('cxd-search-input', CxdSearchInput)
  }
  if (!customElements.get('cxd-search-results')) {
    customElements.define('cxd-search-results', CxdSearchResults)
  }
  if (!customElements.get('cxd-search-filter')) {
    customElements.define('cxd-search-filter', CxdSearchFilter)
  }
}

// ─── Trigger shortcut hints ───────────────────────────────────────────────────

const isMac = () => {
  if (typeof navigator === 'undefined') return false
  const platform = navigator.userAgentData?.platform || navigator.userAgent || ''
  return /mac|iphone|ipad|ipod/i.test(platform)
}

// Fill in `.cxd-search-trigger-shortcut` slots with the platform-correct hint
// and reveal them. Rendered hidden by SearchTrigger.astro so non-JS visitors
// never see a misleading shortcut key.
const setupTriggerShortcuts = () => {
  const mac = isMac()
  const modifier = mac ? '⌘' : 'Ctrl '
  const ariaKeyshortcut = mac ? 'Meta+K' : 'Control+K'

  for (const slot of document.querySelectorAll('.cxd-search-trigger-shortcut')) {
    slot.innerHTML = `<kbd class="cxd-search-trigger-key">${modifier}K</kbd>`
    slot.hidden = false
    slot.closest('.cxd-search-trigger')?.setAttribute('aria-keyshortcuts', ariaKeyshortcut)
  }
}

// ─── Dialog open / close (via chassis data-API) ───────────────────────────────

const isEditableTarget = (target) => {
  if (!target) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const openSearchDialog = () => {
  const dialogEl = document.querySelector(DIALOG_SELECTOR)
  if (!dialogEl) return

  if (dialogEl.open) {
    dialogEl.querySelector('cxd-search-input')?.focus()
    return
  }

  // Native showModal() — CSS @starting-style handles the entry animation without
  // needing the chassis bundle. Works in both dev (no bundle) and prod.
  dialogEl.showModal()
  requestAnimationFrame(() => {
    dialogEl.querySelector('cxd-search-input')?.focus()
    if (!instance.searchTerm) {
      dialogEl.querySelector('cxd-search-results')?._renderEmpty?.()
    }
  })
}

const registerGlobalShortcuts = () => {
  document.addEventListener('keydown', (event) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === 'k'
    ) {
      event.preventDefault()
      openSearchDialog()
      return
    }

    if (
      event.key === '/' &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey &&
      !isEditableTarget(event.target)
    ) {
      event.preventDefault()
      openSearchDialog()
    }
  })
}

// ─── Dialog lifecycle hooks ───────────────────────────────────────────────────

const setupDialogResetOnClose = () => {
  const dialogEl = document.querySelector(DIALOG_SELECTOR)
  if (!dialogEl) return

  // The native `close` event fires whenever the dialog closes — whether via
  // dialogEl.close(), the Esc key, or (in prod) the chassis hide animation.
  // This avoids depending on the chassis bundle being loaded.
  dialogEl.addEventListener('close', () => {
    const inputEl = dialogEl.querySelector('cxd-search-input input')
    if (inputEl) inputEl.value = ''
    instance.triggerSearch('')
  })
}

// ─── Result link handler ──────────────────────────────────────────────────────

const registerResultLinkHandler = () => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.cxd-search-item')
    if (!link) return
    const dialogEl = link.closest('dialog')
    if (!dialogEl?.matches(DIALOG_SELECTOR)) return

    const titleEl = link.querySelector('.cxd-search-item-title')
    const excerptEl = link.querySelector('.cxd-search-item-excerpt')
    saveRecentVisit({
      url: link.getAttribute('href') || '',
      title: titleEl?.textContent.trim() || link.textContent.trim(),
      excerpt: excerptEl?.textContent.trim() || ''
    })

    dialogEl.close()
  })
}

// ─── Init (auto-executes on import) ──────────────────────────────────────────

defineSearchCustomElements()
registerGlobalShortcuts()
registerResultLinkHandler()

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      setupTriggerShortcuts()
      setupDialogResetOnClose()
    },
    { once: true }
  )
} else {
  setupTriggerShortcuts()
  setupDialogResetOnClose()
}
