/** @type {import("stylelint").Config} */
export default {
  // extends: ['stylelint-config-standard', 'stylelint-config-recess-order', '@stylistic/stylelint-config'],
  extends: ['stylelint-config-twbs-bootstrap'],
  // plugins: ['stylelint-prettier'],
  ignoreFiles: ['**/*.min.css', '_site/', '**/*.js', '**/dist/', '**/vendor/']
}
