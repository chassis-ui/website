// Vanilla JavaScript for Chassis HTML example

document.addEventListener('DOMContentLoaded', function () {
  console.log('🎯 Chassis Vanilla HTML Example loaded')

  // Form handling
  const form = document.querySelector('form')
  if (form) {
    form.addEventListener('submit', handleFormSubmit)
  }

  // Button interactions
  const buttons = document.querySelectorAll('.button')
  buttons.forEach((button) => {
    button.addEventListener('click', handleButtonClick)
  })

  // Context switching demo
  initContextSwitching()

  // Animate elements on scroll
  initScrollAnimations()
})

function handleFormSubmit(event) {
  event.preventDefault()

  const button = event.target.querySelector('button[type="submit"]')
  const originalText = button.innerHTML

  // Show loading state
  button.classList.add('loading')
  button.innerHTML = '<i class="chassis-icon chassis-icon-spinner me-1"></i>Sending...'
  button.disabled = true

  // Simulate form submission
  setTimeout(() => {
    button.classList.remove('loading')
    button.innerHTML = '<i class="chassis-icon chassis-icon-check me-1"></i>Sent!'
    button.className = button.className.replace('primary', 'success')

    // Show success message
    showNotification('Message sent successfully!', 'success')

    // Reset form after delay
    setTimeout(() => {
      event.target.reset()
      button.innerHTML = originalText
      button.className = button.className.replace('success', 'primary')
      button.disabled = false
    }, 2000)
  }, 1500)
}

function handleButtonClick(event) {
  const button = event.target.closest('.button')
  if (!button) return

  // Add click animation
  button.style.transform = 'scale(0.95)'
  setTimeout(() => {
    button.style.transform = ''
  }, 150)

  // Log context information
  const context = getButtonContext(button)
  console.log('Button clicked:', {
    text: button.textContent.trim(),
    context: context,
    size: getButtonSize(button)
  })
}

function getButtonContext(button) {
  const classes = button.className
  const contexts = ['primary', 'secondary', 'success', 'warning', 'danger', 'info']
  return contexts.find((context) => classes.includes(context)) || 'default'
}

function getButtonSize(button) {
  const classes = button.className
  const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge']
  return sizes.find((size) => classes.includes(size)) || 'medium'
}

function initContextSwitching() {
  // Demo: Allow switching card contexts
  const cards = document.querySelectorAll('.card.context')
  cards.forEach((card) => {
    card.addEventListener('dblclick', () => {
      const contexts = ['primary', 'secondary', 'success', 'warning', 'danger', 'info']
      const currentContext = contexts.find((c) => card.classList.contains(c))
      const currentIndex = contexts.indexOf(currentContext)
      const nextIndex = (currentIndex + 1) % contexts.length
      const nextContext = contexts[nextIndex]

      card.classList.remove(currentContext)
      card.classList.add(nextContext)

      // Update button context too
      const button = card.querySelector('.button')
      if (button) {
        button.classList.remove(currentContext)
        button.classList.add(nextContext)
      }

      showNotification(`Switched to ${nextContext} context`, 'info')
    })
  })
}

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1'
        entry.target.style.transform = 'translateY(0)'
      }
    })
  }, observerOptions)

  // Animate cards and sections
  const elements = document.querySelectorAll('.card, section')
  elements.forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    observer.observe(el)
  })
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `notification ${type} position-fixed`
  notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `

  notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="chassis-icon chassis-icon-info-circle me-2"></i>
            <span>${message}</span>
            <button class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `

  document.body.appendChild(notification)

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }
  }, 3000)
}

// Add CSS animations
const style = document.createElement('style')
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`
document.head.appendChild(style)
