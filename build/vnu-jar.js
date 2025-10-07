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
import vnu from 'vnu-jar'
import picocolors from 'picocolors'

execFile('java', ['-version'], (error, stdout, stderr) => {
  if (error) {
    console.log(picocolors.yellow('⚠️  Java not found, skipping HTML validation'))
    return
  }

  console.log(picocolors.cyan('🔍 Running HTML validation...'))

  const is32bitJava = !/64-Bit/.test(stderr)

  // vnu-jar accepts multiple ignores joined with a `|`.
  // Also note that the ignores are string regular expressions.
  const ignores = [].join('|')

  const args = [
    '-jar',
    `"${vnu}"`,
    '--asciiquotes',
    '--skip-non-html',
    '--Werror',
    `--filterpattern "${ignores}"`,
    '_site/',
    'vendor/'
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
