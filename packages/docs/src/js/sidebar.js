/*
 * JavaScript for Chassis's docs (https://chassis-ui.com/)
 * Copyright 2011-2025 The Chassis Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 * For details, see https://creativecommons.org/licenses/by/3.0/.
 */

;(() => {
  // Scroll the active sidebar link into view
  const sidenav = document.querySelector('.cxd-sidebar')
  const sidenavActiveLink = document.querySelector('.cxd-links-nav .active')

  if (!sidenav || !sidenavActiveLink) {
    return
  }

  const sidenavHeight = sidenav.clientHeight
  const sidenavActiveLinkTop = sidenavActiveLink.offsetTop
  const sidenavActiveLinkHeight = sidenavActiveLink.clientHeight
  const viewportTop = sidenavActiveLinkTop
  const viewportBottom = viewportTop - sidenavHeight + sidenavActiveLinkHeight

  if (sidenav.scrollTop > viewportTop || sidenav.scrollTop < viewportBottom) {
    sidenav.scrollTop = viewportTop - sidenavHeight / 2 + sidenavActiveLinkHeight / 2
  }
})()
