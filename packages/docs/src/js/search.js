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

const instance = getInstanceManager().getInstance('default')

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
// recently visited items. `title` and `excerpt` are inlined as-is so callers
// can either escape them (recents, plain text) or pass Pagefind's pre-marked HTML.
const renderItem = ({ url, title, excerpt = '', icon, sub = false }) => `
  <a class="cxd-search-item${sub ? ' cxd-search-subitem' : ''}" href="${escapeHtml(url)}">
    <svg class="icon cxd-search-item-icon" width="16" height="16" aria-hidden="true">
      <use href="#${icon}"></use>
    </svg>
    <div class="cxd-search-item-body">
      <div class="cxd-search-item-title">${title}</div>
      ${excerpt ? `<div class="cxd-search-item-excerpt">${excerpt}</div>` : ''}
    </div>
  </a>
`

// ─── Custom elements ──────────────────────────────────────────────────────────

class CxdSearchInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input')
    if (!this.input) return

    this.inputEl = this.input
    instance.registerInput(this, { keyboardNavigation: true })

    this._onInput = this._onInput.bind(this)
    this._onKeydown = this._onKeydown.bind(this)
    this.input.addEventListener('input', this._onInput)
    this.input.addEventListener('keydown', this._onKeydown)

    this.input.addEventListener(
      'focus',
      () => {
        instance.triggerLoad()
      },
      { once: true }
    )
  }

  disconnectedCallback() {
    this.input?.removeEventListener('input', this._onInput)
    this.input?.removeEventListener('keydown', this._onKeydown)
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

    this._onKeydown = this._onKeydown.bind(this)
    this._onClick = this._onClick.bind(this)
    this.addEventListener('keydown', this._onKeydown)
    this.addEventListener('click', this._onClick)

    this._renderEmpty()
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this._onKeydown)
    this.removeEventListener('click', this._onClick)
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
        <ol class="list flush cxd-search-results-list">
          ${recents
            .map((visit) => {
              const isSubLink = visit.url.includes('#')
              return `
              <li class="cxd-search-result">
                ${renderItem({
                  url: visit.url,
                  title: escapeHtml(visit.title),
                  excerpt: escapeHtml(visit.excerpt),
                  icon: isSubLink ? 'hashtag-outline' : 'file-outline',
                  sub: isSubLink
                })}
              </li>
            `
            })
            .join('')}
        </ol>
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

    this.innerHTML = `
      <ol class="list flush cxd-search-results-list">
        ${data.map((result) => this._renderResult(result)).join('')}
      </ol>
    `
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
            ${renderItem({ url: sub.url, title: escapeHtml(sub.title), excerpt: sub.excerpt, icon: 'hashtag-outline', sub: true })}
          </li>
        `
          )
          .join('')}
      </ul>
    `

    return `
      <li class="list-item cxd-search-result">
        ${renderItem({ url: result.url, title: escapeHtml(title), excerpt: result.excerpt, icon: 'file-outline' })}
        ${subResultsHtml}
      </li>
    `
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
