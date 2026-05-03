/* global Swiper */
/**
 * Feature slider controller using Swiper.js
 * Handles initialization and responsive behavior of feature sliders
 */
class FeatureSliders {
  constructor() {
    this.breakpointLarge = 720
    this.isDesktop = false
    this.slidersInitialized = false
    this.swiperInstances = [] // Store Swiper instances for cleanup
    this.sliderElements = []
    this.init()
  }

  // Check if screen width is `this.breakpointLarge` or larger
  checkBreakpoint() {
    return window.innerWidth >= this.breakpointLarge
  }

  // Initialize or destroy sliders based on breakpoint
  handleBreakpoint() {
    const shouldBeDesktop = this.checkBreakpoint()

    if (shouldBeDesktop !== this.isDesktop) {
      this.isDesktop = shouldBeDesktop

      if (this.isDesktop && !this.slidersInitialized) {
        // Enable sliders for desktop
        this.setupSliders()
        this.slidersInitialized = true
        console.log(`Feature sliders enabled for desktop (>=${this.breakpointLarge}px)`)
      } else if (!this.isDesktop && this.slidersInitialized) {
        // Disable sliders for mobile/tablet
        this.destroySliders()
        this.slidersInitialized = false
        console.log(`Feature sliders disabled for mobile/tablet (<${this.breakpointLarge}px)`)
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
    // Cache slider elements
    this.sliderElements = document.querySelectorAll('.feature-slider')

    if (this.sliderElements.length === 0) {
      console.warn('No feature sliders found')
      return
    }

    // Initial check
    this.handleBreakpoint()

    // Listen for window resize with debounce
    let resizeTimeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.handleBreakpoint()
      }, 150)
    })
  }

  setupSliders() {
    this.sliderElements.forEach((element) => {
      const swiperContainer = element.querySelector('.swiper')
      const prevButton = element.querySelector('.swiper-button-prev')
      const nextButton = element.querySelector('.swiper-button-next')
      const pagination = element.querySelector('.swiper-pagination')

      if (!swiperContainer) {
        console.warn('Swiper container not found in slider element:', element)
        return
      }

      // Get gap value from parent element or default to 24
      const computedStyle = window.getComputedStyle(element.parentElement)
      const gapValue = computedStyle.getPropertyValue('gap')

      const swiperInstance = new Swiper(swiperContainer, {
        slidesPerView: 'auto',
        spaceBetween: parseFloat(gapValue) || 24,
        speed: 500,
        initialSlide: 0,
        grabCursor: true,
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton,
          disabledClass: 'invisible'
        },
        pagination: {
          el: pagination,
          type: 'bullets',
          clickable: true,
          bulletClass: 'slider-bullet',
          bulletActiveClass: 'active'
        },
        // Accessibility
        a11y: {
          enabled: true,
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          paginationBulletMessage: 'Go to slide {{index}}'
        }
      })

      this.swiperInstances.push(swiperInstance)
    })

    console.log(`Initialized ${this.swiperInstances.length} feature slider(s)`)
  }

  destroySliders() {
    // Destroy all Swiper instances
    this.swiperInstances.forEach((swiper) => {
      if (swiper && typeof swiper.destroy === 'function') {
        swiper.destroy(true, true)
      }
    })

    this.swiperInstances = []
    console.log('All feature sliders destroyed')
  }
}

// Initialize sliders when module loads
new FeatureSliders()
