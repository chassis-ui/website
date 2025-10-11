/*!
 * Color mode toggler for Chassis's docs (https://chassis-ui.com/)
 * Copyright 2011-2025 The Chassis Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

;(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
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

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#cxd-theme')

    if (!themeSwitcher) {
      return
    }

    const themeSwitcherText = document.querySelector('#cxd-theme-text')
    const activeThemeIcon = document.querySelector('.theme-icon-active use')
    const buttonToActive = document.querySelector(`[data-cx-theme-value="${theme}"]`)
    const svgOfActiveButton = buttonToActive.querySelector('svg use').getAttribute('href')

    document.querySelectorAll('[data-cx-theme-value]').forEach((element) => {
      element.classList.remove('active')
      element.setAttribute('aria-pressed', 'false')
    })

    buttonToActive.classList.add('active')
    buttonToActive.setAttribute('aria-pressed', 'true')
    activeThemeIcon.setAttribute('href', svgOfActiveButton)
    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${buttonToActive.dataset.cxThemeValue})`
    themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

    if (focus) {
      themeSwitcher.focus()
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
        showActiveTheme(theme, true)
      })
    })
  })
})()
