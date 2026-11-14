// What is below the window when the page loads waits, and plays its motion when it scrolls
// into view (scss/_motion.scss). What is in the window or above it stays as it is.
// An element takes part with `data-reveal`; the value names its motion in the styles.
if (
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
  'IntersectionObserver' in window
) {
  const observer = new IntersectionObserver(
    (entries) => {
      // The place of an element among those that arrive together.
      let place = 0

      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.style.setProperty('--cxd-reveal-delay', `${place++ * 0.15}s`)
        entry.target.classList.replace('is-pending', 'is-revealed')
        observer.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -15% 0px' }
  )

  for (const element of document.querySelectorAll('[data-reveal]')) {
    if (element.getBoundingClientRect().top < window.innerHeight) continue
    element.classList.add('is-pending')
    observer.observe(element)
  }
}
