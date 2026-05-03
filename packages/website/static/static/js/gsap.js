/* global gsap, ScrollTrigger */
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
    const sections = gsap.utils.toArray('.home-section:not(.hero-section):not(#gallery-section)')

    if (sections.length === 0) {
      console.warn('No home sections found for animation')
      return
    }

    sections.forEach((section) => {
      this.createSectionAnimation(section)
    })

    // Create gallery animation and store its ScrollTrigger
    const gallery = document.querySelector('#gallery-section .gallery-image')
    if (gallery) {
      const galleryTrigger = this.createGalleryAnimation(gallery)
      if (galleryTrigger) {
        this.scrollTriggers.push(galleryTrigger)
      }
    }
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
        // x: '-10%',
        y: '-75%',
        scale: 1.25
      },
      {
        // x: '20%',
        y: '-25%',
        scale: 1.25,
        scrollTrigger: {
          trigger: gallery.parentElement,
          start: `top bottom`,
          end: `bottom top+${this.headerHeight}`,
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

  createSectionAnimation(section) {
    const features = section.querySelectorAll('.section-features > .feature-slider')

    if (features.length === 0) {
      return // Skip sections without features
    }

    // Create timeline for this section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: `top 75%`,
        // end: () => `+=${section.offsetHeight}`,
        end: () => `bottom bottom`,
        // pin: true,
        // anticipatePin: 1,
        // markers: true, // Set to true for debugging
        scrub: true
      }
    })

    // Store the ScrollTrigger for cleanup
    this.scrollTriggers.push(tl.scrollTrigger)

    // Set up features container and initial states
    this.setupFeaturesContainer(section, features)

    // Create feature animations (appear then disappear)
    this.createFeatureAnimations(tl, features)
  }

  setupFeaturesContainer(section, features) {
    const featuresContainer = section.querySelectorAll('.section-features')

    if (featuresContainer) {
      gsap.set(featuresContainer, { position: 'relative' })
      // gsap.set(section.querySelector('.section-features > *'), { position: 'relative' })
    }

    // Set initial states for all features
    gsap.set(features, {
      opacity: 1,
      x: '25%',
      // position: 'absolute',
      // top: '100%',
      // left: 0,
      // right: 0,
      zIndex: 1
    })
  }

  createFeatureAnimations(timeline, features) {
    features.forEach((feature, index) => {
      // Feature appears
      timeline.to(
        feature,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: 'power2.out'
        },
        index
      )

      console.log(feature.parentNode.parentNode.className)

      if (
        feature.parentNode.parentNode.className.includes('section-features') ||
        feature.nextElementSibling == undefined
      ) {
        return // Skip disappearance for aside features
      }

      // Feature disappears (maintains original behavior)
      timeline.to(feature, {
        opacity: 0
      })
    })
  }
}

// Initialize animations when module loads
new HomeAnimations()
