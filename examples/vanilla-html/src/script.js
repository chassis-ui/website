// Contact form demo: nothing is sent. On submit the form is cleared and a confirmation is shown
// until the visitor edits or resets the form.

const form = document.getElementById('contact-form')
const status = document.getElementById('contact-status')

form.addEventListener('submit', (event) => {
  event.preventDefault()
  form.reset()
  status.hidden = false
})

form.addEventListener('input', () => {
  status.hidden = true
})

form.addEventListener('reset', () => {
  status.hidden = true
})
