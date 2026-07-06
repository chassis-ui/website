/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-twbs-bootstrap'],
  ignoreFiles: [
    '**/*.min.css',
    '**/dist/**',
    '**/tests/**',
    '**/coverage/**',
    '_site/**',
    'packages/website/.astro/**',
    'packages/website/public/**',
    'packages/website/static/**',
    'vendor/**'
  ],
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  overrides: [
    {
      files: ['**/*.scss'],
      rules: {
        'declaration-property-value-disallowed-list': {
          border: 'none',
          outline: 'none'
        },
        'function-disallowed-list': ['lighten', 'darken'],
        'property-disallowed-list': [
          'font-size',
          'border-radius',
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-right-radius',
          'border-bottom-left-radius',
          'transition'
        ],
        'scss/at-function-named-arguments': ['never', { ignoreFunctions: ['if'] }],
        'scss/dollar-variable-default': [true, { ignore: 'local' }],
        'scss/selector-no-union-class-name': true
      }
    },
    {
      files: ['packages/**/*.scss'],
      rules: {
        'scss/dollar-variable-default': null
      }
    }
  ]
}
