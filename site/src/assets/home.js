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
    this.isDesktop = false
    this.animationsInitialized = false
    this.scrollTriggers = [] // Store ScrollTrigger instances for cleanup
    this.init()
  }

  // Check if screen width is 1200px or larger
  checkBreakpoint() {
    return window.innerWidth >= 1200
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
        console.log('Animations enabled for desktop (>=1200px)')
      } else if (!this.isDesktop && this.animationsInitialized) {
        // Disable animations for mobile/tablet
        this.destroyAnimations()
        this.animationsInitialized = false
        console.log('Animations disabled for mobile/tablet (<1200px)')
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
      '.home-section:not(.hero-section):not(#gallery-section):not(#figma-section)'
    )

    if (sections.length === 0) {
      console.warn('No home sections found for animation')
      return
    }

    sections.forEach((section) => {
      this.createSectionAnimation(section)
    })

    // Create gallery animation and store its ScrollTrigger
    const gallery = document.querySelector('#gallery-section > .gallery-content')
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
        y: '-50%'
      },
      {
        y: '0',
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

  createSectionAnimation(section) {
    const features = section.querySelectorAll('.features > .feature-item')
    const asideItems = section.querySelectorAll('.section-aside > .media-stack > *')

    if (features.length === 0) {
      return // Skip sections without features
    }

    // Create timeline for this section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: `top ${this.headerHeight}px`,
        end: () => `+=${section.offsetHeight}`,
        pin: true,
        anticipatePin: 1,
        scrub: true,
        markers: false // Set to true for debugging
      }
    })

    // Store the ScrollTrigger for cleanup
    this.scrollTriggers.push(tl.scrollTrigger)

    // Set up features container and initial states
    this.setupFeaturesContainer(section, features)

    // Set up aside items initial states
    this.setupAsideItems(section, asideItems)

    // Create feature animations (appear then disappear)
    this.createFeatureAnimations(tl, features)

    // Create aside item animations (appear then disappear)
    this.createAsideAnimations(tl, asideItems)
  }

  setupFeaturesContainer(section, features) {
    const featuresContainer = section.querySelectorAll('.features')

    if (featuresContainer) {
      gsap.set(featuresContainer, { position: 'relative' })
      // gsap.set(section.querySelector('.section-features > *'), { position: 'relative' })
    }

    // Set initial states for all features
    gsap.set(features, {
      opacity: 0,
      y: 100,
      position: 'absolute',
      top: '100%',
      // left: 0,
      // right: 0,
      zIndex: 1
    })
  }

  setupAsideItems(section, asideItems) {
    const asideContainer = section.querySelectorAll('.section-aside > .media-stack')

    if (asideContainer) {
      gsap.set(asideContainer, { position: 'relative' })
    }
    // gsap.set(aside.querySelectorAll('.aside-stack'), { position: 'relative' })

    // Set initial states for all aside items
    gsap.set(asideItems, {
      position: 'absolute',
      opacity: 0,
      y: 50,
      left: 0,
      right: 0,
      zIndex: 1
      // scale: 0.95
    })
  }

  createFeatureAnimations(timeline, features) {
    features.forEach((feature, index) => {
      // Feature appears
      timeline.to(
        feature,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power2.out'
        },
        index * 1.2
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

  createAsideAnimations(timeline, asideItems) {
    asideItems.forEach((item, index) => {
      // Aside item appears - start after first feature but with different timing
      timeline.to(
        item,
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out'
        },
        index * 1.5 // Stagger every 1.5s
      )

      if (item.nextElementSibling == undefined) {
        return // Skip disappearance for aside features
      }

      timeline.to(
        item,
        {
          opacity: 0,
          y: -30
        },
        1.5 + index * 1.5 // Start disappearing at 1.5s, stagger every 2s
      )
    })

    // Add disappearances separately with staggered timing
    // asideItems.forEach((item, index) => {
    //   timeline.to(
    //     item,
    //     {
    //       opacity: 0,
    //       y: -30
    //     },
    //     1.5 + index * 1.5 // Start disappearing at 1.5s, stagger every 2s
    //   )
    // })
  }
}

// Initialize animations when module loads
const homeAnimations = new HomeAnimations()

// Export for potential external control
export default homeAnimations
