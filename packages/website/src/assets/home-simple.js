import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Home page animations using GSAP ScrollTrigger
 * Handles section pinning and feature card animations
 */
class HomeAnimations {
  constructor() {
    this.headerHeight = document.querySelector('header')?.offsetHeight || 0
    this.breakpointLarge = 992
    this.isDesktop = false
    this.animationsInitialized = false
    this.scrollTriggers = [] // Store ScrollTrigger instances for cleanup
    this.init()
  }

  // Check if screen width is `this.breakpointLarge` or larger
  checkBreakpoint() {
    return window.innerWidth >= this.breakpointLarge
  }

  // Initialize or destroy animations based on breakpoint
  handleBreakpoint() {
    const shouldBeDesktop = this.checkBreakpoint()

    if (shouldBeDesktop !== this.isDesktop) {
      this.isDesktop = shouldBeDesktop

      if (this.isDesktop && !this.animationsInitialized) {
        // Enable animations for desktop
        this.setupAnimations()
        this.animationsInitialized = true
        console.log(`Animations enabled for desktop (>=${this.breakpointLarge}px)`)
      } else if (!this.isDesktop && this.animationsInitialized) {
        // Disable animations for mobile/tablet
        this.destroyAnimations()
        this.animationsInitialized = false
        console.log(`Animations disabled for mobile/tablet (<${this.breakpointLarge}px)`)
      }
    }
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeBreakpointCheck())
    } else {
      this.initializeBreakpointCheck()
    }
  }

  initializeBreakpointCheck() {
    // Initial check
    this.handleBreakpoint()

    // Listen for window resize
    window.addEventListener('resize', () => {
      this.handleBreakpoint()
    })
  }

  setupAnimations() {
    const sections = gsap.utils.toArray(
      // '.home-section:not(.hero-section):not(#gallery-section):not(#figma-section)'
      '#gallery-section > .gallery-content, #figma-carousel'
    )

    if (sections.length === 0) {
      console.warn('No home sections found for animation')
      return
    }

    sections.forEach((section) => {
      const galleryTrigger = this.createGalleryAnimation(section)
      if (galleryTrigger) {
        this.scrollTriggers.push(galleryTrigger)
      }
    })

    // Create gallery animation and store its ScrollTrigger
  }

  destroyAnimations() {
    // Kill all ScrollTrigger instances
    this.scrollTriggers.forEach((trigger) => {
      if (trigger && trigger.kill) {
        trigger.kill()
      }
    })
    this.scrollTriggers = []

    // Kill any remaining ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

    // Clear any GSAP timelines
    gsap.globalTimeline.clear()

    console.log('All animations destroyed')
  }

  createGalleryAnimation(gallery) {
    // gsap.set(gallery, { position: 'relative', zIndex: 0 })
    const animation = gsap.fromTo(
      gallery,
      {
        y: '-50%'
      },
      {
        y: '25%',
        scrollTrigger: {
          trigger: gallery.parentElement,
          start: `top bottom`,
          end: `bottom top`,
          // end: () => `+=${gallery.offsetHeight}`,
          // pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          scrub: true,
          markers: false // Set to true for debugging
        }
      }
    )

    // Return the ScrollTrigger instance for cleanup
    return animation.scrollTrigger
  }
}

// Initialize animations when module loads
const homeAnimations = new HomeAnimations()

// Export for potential external control
export default homeAnimations
