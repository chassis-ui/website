// Dynamic theme color based on scroll position
;(() => {
  'use strict'

  // Configuration
  const CONFIG = {
    scrollThreshold: 100,
    defaultColor: '#00A4CC'
  }

  // DOM elements
  const elements = {
    themeColorMeta: document.querySelector('meta[name="theme-color"]'),
    header: document.querySelector('header'),
    footer: document.querySelector('.cxd-footer')
  }

  // Early return if required elements are missing
  if (!elements.themeColorMeta || !elements.header || !elements.footer) {
    return
  }

  /**
   * Extracts RGB values from a CSS color string
   * @param {string} color - CSS color string (rgb/rgba)
   * @returns {Object|null} RGB object or null if invalid
   */
  function extractRGB(color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
    return match
      ? {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10)
        }
      : null
  }

  /**
   * Converts RGB values to hex color string
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {string} Hex color string
   */
  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  }

  /**
   * Gets the computed background color of an element as hex
   * @param {HTMLElement} element - DOM element
   * @returns {string} Hex color string or default color
   */
  function getElementBackgroundColor(element) {
    const bgColor = getComputedStyle(element).backgroundColor
    const rgb = extractRGB(bgColor)
    return rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : CONFIG.defaultColor
  }

  /**
   * Determines the current scroll position context
   * @returns {string} 'top', 'bottom', or 'middle'
   */
  function getScrollContext() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    if (scrollTop < CONFIG.scrollThreshold) {
      return 'top'
    }

    if (scrollTop + windowHeight >= documentHeight - CONFIG.scrollThreshold) {
      return 'bottom'
    }

    return 'middle'
  }

  /**
   * Updates the theme color meta tag based on scroll position
   */
  function updateThemeColor() {
    const context = getScrollContext()
    let color = CONFIG.defaultColor

    switch (context) {
      case 'top':
        color = getElementBackgroundColor(elements.header)
        break
      case 'bottom':
        color = getElementBackgroundColor(elements.footer)
        break
      case 'middle':
      default:
        color = CONFIG.defaultColor
        break
    }

    elements.themeColorMeta.setAttribute('content', color)
  }

  // Throttle function for performance optimization
  function throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  // Event listeners with throttling for better performance
  const throttledUpdate = throttle(updateThemeColor, 16) // ~60fps

  window.addEventListener('scroll', throttledUpdate, { passive: true })
  window.addEventListener('resize', throttledUpdate, { passive: true })

  // Initial update
  updateThemeColor()
})()
