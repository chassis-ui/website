import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import astroPlugin from 'eslint-plugin-astro'

export default defineConfig([
  // Global ignores
  {
    ignores: [
      '**/dist/',
      '_site/',
      '**/.astro/',
      'packages/website/public/',
      '.cache/',
      'docs/',
      'vendor/'
    ]
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  astroPlugin.configs.recommended,
  astroPlugin.configs['jsx-a11y-recommended'],
  prettierPlugin,
  {
    plugins: { import: importPlugin, unicorn: unicornPlugin },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-useless-escape': 'warn',
      'prettier/prettier': 'warn'
    }
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser }
    }
  },
  {
    files: ['api/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
      parser: tseslint.parser,
      parserOptions: {
        project: './api/tsconfig.json'
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.astro/*.js'],
    ignores: ['api/**'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parser: tseslint.parser,
      parserOptions: {
        project: './packages/website/tsconfig.json'
      }
    }
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parser: astroPlugin.parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
        project: './packages/website/tsconfig.json'
      }
    }
  },
  {
    files: ['packages/docs/**/*.ts', 'packages/docs/**/*.astro/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parser: tseslint.parser,
      parserOptions: {
        project: './packages/docs/tsconfig.json'
      }
    }
  },
  {
    files: ['packages/docs/**/*.astro'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parser: astroPlugin.parser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
        project: './packages/docs/tsconfig.json'
      }
    }
  },
  {
    files: ['packages/website/**/*.js', 'packages/website/**/*.cjs'],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['examples/**'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser }
    }
  }
])
