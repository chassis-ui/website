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
    ignores: ['**/dist/', '_site/', 'site/.astro/', 'site/public/', '.cache/', 'docs/', 'vendor/']
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  astroPlugin.configs.recommended,
  astroPlugin.configs['jsx-a11y-recommended'],
  prettierPlugin,
  {
    plugins: { import: importPlugin, unicorn: unicornPlugin },
    rules: {
      'no-unused-vars': 'warn',
      'no-useless-escape': 'warn',
      'prettier/prettier': 'warn'
    }
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['**/*.ts', '**/*.astro/*.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parser: tseslint.parser,
      parserOptions: {
        project: './site/tsconfig.json'
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
        project: './site/tsconfig.json'
      }
    }
  },
  {
    files: ['site/**/*.js', 'site/**/*.cjs'],
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
