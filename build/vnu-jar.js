#!/usr/bin/env node

/*!
 * HTML Validation Script using vnu-jar
 *
 * Validates HTML files using the Nu Html Checker if Java is available.
 *
 * Copyright 2025 Ozgur Gunes
 * Licensed under MIT
 */

import { execFile, spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import vnu from 'vnu-jar'
import picocolors from 'picocolors'

execFile('java', ['-version'], (error, stdout, stderr) => {
  if (error) {
    console.log(picocolors.yellow('⚠️  Java not found, skipping HTML validation'))
    return
  }

  console.log(picocolors.cyan('🔍 Running HTML validation...'))

  const is32bitJava = !/64-Bit/.test(stderr)

  const ignoredPaths = [
    'static/icons' // vendor-generated assets (e.g. icons preview.html)
  ]

  const getSitePaths = (base = '') =>
    readdirSync(`_site${base ? `/${base}` : ''}`).flatMap((entry) => {
      const rel = base ? `${base}/${entry}` : entry
      if (ignoredPaths.includes(rel)) return []
      if (ignoredPaths.some((p) => p.startsWith(`${rel}/`))) return getSitePaths(rel)
      return [`_site/${rel}`]
    })

  // vnu-jar accepts multiple ignores joined with a `|`.
  // Also note that the ignores are string regular expressions.
  const ignores = ['Trailing slash on void elements.*'].join('|')

  const args = [
    '-jar',
    `"${vnu}"`,
    '--asciiquotes',
    '--skip-non-html',
    '--Werror',
    `--filterpattern "${ignores}"`,
    ...getSitePaths()
  ]

  // For 32-bit Java we need to pass -Xss512k
  if (is32bitJava) {
    args.splice(0, 0, '-Xss512k')
  }

  spawn('java', args, {
    shell: true,
    stdio: 'inherit'
  }).on('exit', (code) => {
    if (code === 0) {
      console.log(picocolors.green('✅ HTML validation completed successfully'))
    } else {
      console.log(picocolors.red('❌ HTML validation failed'))
    }
    process.exit(code || 0)
  })
})
