/*!
 * Color mode toggler for Chassis's docs (https://chassis-ui.com/)
 * Copyright 2011-2025 The Chassis Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

;(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme') || 'auto'
  const setStoredTheme = (theme) => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = (theme) => {
    if (theme === 'auto') {
      document.documentElement.setAttribute(
        'data-cx-theme',
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      )
    } else {
      document.documentElement.setAttribute('data-cx-theme', theme)
    }
  }

  setTheme(getPreferredTheme())

  // The page can hold more than one toggler (the navbar and the navigation dialog of small
  // screens). Each is a `[data-cxd-theme-toggler]` button with its own `.theme-icon-active`
  // and `[data-cxd-theme-text]`; the menu items of every toggler are kept in step.
  const showActiveTheme = (theme, focusFrom = null) => {
    const togglers = document.querySelectorAll('[data-cxd-theme-toggler]')

    if (togglers.length === 0) {
      return
    }

    const buttonToActive = document.querySelector(`[data-cx-theme-value="${theme}"]`)

    if (!buttonToActive) {
      return
    }

    const svgOfActiveButton = buttonToActive.querySelector('svg use').getAttribute('href')

    document.querySelectorAll('[data-cx-theme-value]').forEach((element) => {
      const selected = element.dataset.cxThemeValue === theme
      element.classList.toggle('selected', selected)
      element.setAttribute('aria-pressed', String(selected))
    })

    togglers.forEach((toggler) => {
      const text = toggler.querySelector('[data-cxd-theme-text]')
      const icon = toggler.querySelector('.theme-icon-active use')
      icon?.setAttribute('href', svgOfActiveButton)
      if (text) {
        toggler.setAttribute('aria-label', `${text.textContent.trim()} (${theme})`)
      }
    })

    if (focusFrom) {
      const menu = focusFrom.closest('.menu')
      const toggler = menu?.previousElementSibling
      ;(toggler?.matches('[data-cxd-theme-toggler]') ? toggler : togglers[0]).focus()
    }
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-cx-theme-value]').forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const theme = toggle.getAttribute('data-cx-theme-value')
        setStoredTheme(theme)
        setTheme(theme)
        showActiveTheme(theme, toggle)
      })
    })
  })
})()
