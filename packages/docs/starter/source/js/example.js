// A stand-in for the code that the site documents. `<JsDocs>` shows the part between the
// two marker comments of the same name.

// js-docs-start example-js
export function toggleExample(element) {
  element.classList.toggle('active')

  return element.classList.contains('active')
}
// js-docs-end example-js
