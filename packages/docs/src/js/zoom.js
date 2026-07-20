/*
 * Enables Medium-like click-to-zoom on any image tagged data-zoomable.
 * https://github.com/francoischalifour/medium-zoom
 */

import mediumZoom from 'medium-zoom'

mediumZoom('[data-zoomable]', {
  margin: 24,
  background: 'var(--cx-alternate-dim-main)'
})
