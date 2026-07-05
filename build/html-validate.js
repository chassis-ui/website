#!/usr/bin/env node

/*!
 * HTML Validation Script using html-validate
 *
 * Validates HTML files using the html-validate Node.js package.
 *
 * Copyright 2025 Ozgur Gunes
 * Licensed under MIT
 */

import { HtmlValidate, Severity } from 'html-validate'
import { globby } from 'globby'

const htmlValidate = new HtmlValidate({
  extends: ['html-validate:recommended', 'html-validate:document'],
  rules: {
    // Allow void elements with trailing slashes (Astro)
    'void-style': 'off',
    // Shiki syntax highlighting uses inline styles for code blocks
    'no-inline-style': 'off',
    // Homepage slider use role="region"
    'prefer-native-element': ['error', { exclude: ['region'] }],
    // Rules from the `html-validate:document` preset
    // Dialogs use h2, but the preset requires h1 for the sectioning roots
    'heading-level': ['error', { minInitialRank: 'h2', sectioningRoots: [] }],
    // SRI is not required for local assets in the docs
    'require-sri': 'off'
  }
})

// Simple concurrency limiter — avoids hitting fd limits when validating
// hundreds of files simultaneously with Promise.all
async function withConcurrency(concurrency, items, fn) {
  const results = []
  const executing = new Set()
  for (const item of items) {
    const p = fn(item).then((r) => {
      executing.delete(p)
      return r
    })
    executing.add(p)
    results.push(p)
    if (executing.size >= concurrency) await Promise.race(executing)
  }
  return Promise.all(results)
}

async function validateHTML() {
  try {
    console.log('Running html-validate...')

    const files = await globby(['_site/**/*.html', '!_site/static/icons/**'], {
      ignore: ['**/node_modules/**']
    })

    console.log(`Validating ${files.length} HTML files...`)

    const results = await withConcurrency(10, files, (file) =>
      htmlValidate.validateFile(file).then((report) => ({ file, report }))
    )

    let errorCount = 0
    let errorFileCount = 0

    for (const { file, report } of results) {
      // report.results[0] holds all messages for the file; absent means no issues
      const messages = report.results[0]?.messages ?? []
      // Severity.WARN === 1; this excludes only DISABLED (0), matching --Werror behaviour
      const issues = messages.filter((msg) => msg.severity >= Severity.WARN)

      if (issues.length > 0) {
        errorFileCount++
        errorCount += issues.length
        console.error(`\nIssues in ${file}:`)

        for (const msg of issues) {
          const level = msg.severity === Severity.ERROR ? 'error' : 'warning'
          console.error(
            `  Line ${msg.line}:${msg.column} - [${level}] ${msg.message} (${msg.ruleId})`
          )
        }
      }
    }

    if (errorCount > 0) {
      console.error(
        `\nHTML validation failed: ${errorCount} issue(s) across ${errorFileCount} file(s).`
      )
      process.exit(1)
    } else {
      console.log('✓ All HTML files are valid!')
    }
  } catch (error) {
    console.error('HTML validation crashed:', error)
    process.exit(2)
  }
}

validateHTML()
