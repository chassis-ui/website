import { Tooltip } from '@chassis-ui/css'

// Helper to detect the user's preferred theme
function getPreferredTheme() {
  // First check localStorage
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme && storedTheme !== 'auto') {
    return storedTheme
  }

  // Then check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Direct theme toggle function that's globally accessible
function toggleTheme(button) {
  const example = button.closest('.cxd-example-snippet').querySelector('.cxd-example')
  if (!example) return

  // Get current theme - try from element, then use detection logic if not set
  let currentTheme = example.getAttribute('data-cx-theme')
  if (!currentTheme) {
    // If element doesn't have theme set, use preferred theme
    currentTheme = getPreferredTheme()
  }

  // Toggle to the opposite
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  // Get system preferred theme
  const preferredTheme = getPreferredTheme()

  // If the new theme matches the preferred system theme, remove the attribute
  // to let it naturally follow system preference
  if (newTheme === preferredTheme) {
    example.removeAttribute('data-cx-theme')
  } else {
    // Otherwise, explicitly set the theme
    example.setAttribute('data-cx-theme', newTheme)
  }

  // Update the icon to match the theme
  const iconUse = button.querySelector('use')
  if (iconUse) {
    const iconHref = newTheme === 'dark' ? 'sun-solid' : 'moon-solid'
    iconUse.setAttribute('href', `/static/icons/chassis-icons.svg#${iconHref}`)
  }
}

// Expose globally for inline onclick="toggleTheme(this)" handlers in Example.astro
window.toggleTheme = toggleTheme

// Initialize theme icons for all buttons based on current theme
document.addEventListener('DOMContentLoaded', () => {
  const preferredTheme = getPreferredTheme()

  document.querySelectorAll('.button-mode').forEach((button) => {
    // Initialize tooltip
    Tooltip.getOrCreateInstance(button)

    // Set initial icon based on theme
    const iconUse = button.querySelector('use')
    if (iconUse) {
      const example = button.closest('.cxd-example-snippet')?.querySelector('.cxd-example')
      const currentTheme = example?.getAttribute('data-cx-theme') || preferredTheme
      const iconHref = currentTheme === 'dark' ? 'sun-solid' : 'moon-solid'
      iconUse.setAttribute('href', `/static/icons/chassis-icons.svg#${iconHref}`)
    }

    // Add event listener if not already set through onclick
    if (!button.hasAttribute('onclick')) {
      button.addEventListener('click', () => toggleTheme(button))
    }
  })
})
