/**
 * Chassis Icons SVG Sprite Loader
 *
 * Efficiently loads and caches the chassis-icons.svg sprite using localStorage.
 * This reduces page size by avoiding inline SVG and enables browser caching.
 *
 * Features:
 * - localStorage caching with version control
 * - Automatic fallback on cache miss or corruption
 * - Network request deduplication
 * - Small footprint and fast execution
 */

;(function () {
  'use strict'

  // Configuration
  const CACHE_KEY = 'chassis-icons-sprite'
  const VERSION_KEY = 'chassis-icons-version'
  const CURRENT_VERSION = '1.0.0' // Update when icons change
  const SVG_URL = '/static/icons/chassis-icons.svg' // Icons SVG sprite path

  // State management
  let loadPromise = null

  /**
   * Get SVG sprite from localStorage cache
   * @returns {string|null} Cached SVG content or null if not found/invalid
   */
  function getCachedSprite() {
    try {
      const cachedVersion = localStorage.getItem(VERSION_KEY)
      const cachedSprite = localStorage.getItem(CACHE_KEY)

      if (cachedVersion === CURRENT_VERSION && cachedSprite) {
        return cachedSprite
      }
    } catch (error) {
      console.warn('Failed to read icon cache:', error)
    }

    return null
  }

  /**
   * Store SVG sprite in localStorage cache
   * @param {string} spriteContent - SVG content to cache
   */
  function setCachedSprite(spriteContent) {
    try {
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      localStorage.setItem(CACHE_KEY, spriteContent)
    } catch (error) {
      console.warn('Failed to cache icon sprite:', error)
      // Handle localStorage quota exceeded or other errors
      // Clear old cache and try again
      try {
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(VERSION_KEY)
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
        localStorage.setItem(CACHE_KEY, spriteContent)
      } catch (retryError) {
        console.warn('Failed to cache icon sprite after retry:', retryError)
      }
    }
  }

  /**
   * Fetch SVG sprite from network
   * @returns {Promise<string>} Promise resolving to SVG content
   */
  async function fetchSprite() {
    const response = await fetch(SVG_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch icon sprite: ${response.status} ${response.statusText}`)
    }

    const spriteContent = await response.text()

    // Basic validation - ensure it's actually SVG content
    if (!spriteContent.includes('<svg') || !spriteContent.includes('</svg>')) {
      throw new Error('Invalid SVG content received')
    }

    return spriteContent
  }

  /**
   * Inject SVG sprite into the DOM
   * @param {string} spriteContent - SVG content to inject
   */
  function injectSprite(spriteContent) {
    // Remove any existing sprite container
    const existingContainer = document.getElementById('chassis-icons-sprite')
    if (existingContainer) {
      existingContainer.remove()
    }

    // Create hidden container for the sprite
    const container = document.createElement('div')
    container.id = 'chassis-icons-sprite'
    container.style.display = 'none'
    container.setAttribute('aria-hidden', 'true')

    // Use DOMParser to safely parse SVG content instead of innerHTML
    const parsed = new DOMParser().parseFromString(spriteContent, 'image/svg+xml')
    const svgEl = parsed.querySelector('svg')
    if (svgEl) {
      container.appendChild(svgEl)
    } else {
      // Fallback: should not happen given fetchSprite validation
      container.innerHTML = spriteContent
    }

    // Insert at the end of body
    document.body.appendChild(container)
  }

  /**
   * Load and inject the icon sprite
   * @returns {Promise<void>} Promise that resolves when sprite is loaded
   */
  function loadIconSprite() {
    // Return existing promise if already loading
    if (loadPromise) {
      return loadPromise
    }

    // Check cache first
    const cachedSprite = getCachedSprite()
    if (cachedSprite) {
      injectSprite(cachedSprite)
      return Promise.resolve()
    }

    // Fetch from network
    loadPromise = fetchSprite()
      .then((spriteContent) => {
        // Cache the content
        setCachedSprite(spriteContent)

        // Inject into DOM
        injectSprite(spriteContent)
      })
      .catch((error) => {
        console.error('Failed to load icon sprite:', error)
        // Don't throw - let the page continue to work without icons
      })
      .finally(() => {
        loadPromise = null
      })

    return loadPromise
  }

  /**
   * Initialize icon loading
   * Runs immediately if DOM is ready, or waits for DOMContentLoaded
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadIconSprite)
    } else {
      loadIconSprite()
    }
  }

  // Public API for manual cache management
  window.ChassisIcons = {
    /**
     * Manually reload the icon sprite (bypasses cache)
     * @returns {Promise<void>}
     */
    reload: async function () {
      try {
        // Clear cache
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(VERSION_KEY)

        // Force reload
        loadPromise = null
        await loadIconSprite()
      } catch (error) {
        console.error('Failed to reload icon sprite:', error)
      }
    },

    /**
     * Clear the icon cache
     */
    clearCache: function () {
      try {
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(VERSION_KEY)
      } catch (error) {
        console.warn('Failed to clear icon cache:', error)
      }
    },

    /**
     * Get cache information
     * @returns {object} Cache status and size info
     */
    getCacheInfo: function () {
      try {
        const version = localStorage.getItem(VERSION_KEY)
        const sprite = localStorage.getItem(CACHE_KEY)
        return {
          version: version,
          cached: !!sprite,
          size: sprite ? sprite.length : 0,
          currentVersion: CURRENT_VERSION
        }
      } catch (error) {
        return {
          version: null,
          cached: false,
          size: 0,
          currentVersion: CURRENT_VERSION,
          error: error.message
        }
      }
    }
  }

  // Initialize
  init()
})()
