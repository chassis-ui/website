#!/usr/bin/env node

/*!
 * Version Change Script
 *
 * Changes version numbers across project files and package.json.
 *
 * Usage:
 *   node change-version.js <old_version> <new_version> [--dry-run]
 *
 * Examples:
 *   node change-version.js 1.0.0 1.1.0
 *   node change-version.js 1.0.0 1.1.0 --dry
 *
 * Copyright 2025 Ozgur Gunes
 * Licensed under MIT
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import { promisify } from 'node:util'

// Configuration: Files that contain version references to be updated
// These files contain hardcoded version numbers that need to be kept in sync
const FILES = [
  'README.md',
  'packages/website/config.yml',
  'packages/website/data/docs-versions.yml'
]

const execFileAsync = promisify(execFile)

const DRY_RUN = process.argv.includes('--dry') || process.argv.includes('--dry-run')

// RegExp utilities for safe string replacement
// TC39 proposal for RegExp.escape is still pending: https://github.com/benjamingr/RegExp.escape/issues/37
function regExpQuote(string) {
  return string.replace(/[$()*+-.?[\\\]^{|}]/g, '\\$&')
}

function regExpQuoteReplacement(string) {
  return string.replace(/\$/g, '$$')
}

/**
 * Updates version references in a single file using regex replacement
 * @param {string} file - Path to the file to update
 * @param {string} oldVersion - Current version to replace
 * @param {string} newVersion - New version to use
 * @returns {boolean} - True if file was updated, false if no changes needed
 */
async function replaceRecursively(file, oldVersion, newVersion) {
  try {
    const originalString = await fs.readFile(file, 'utf8')
    const newString = originalString.replace(
      new RegExp(regExpQuote(oldVersion), 'g'),
      regExpQuoteReplacement(newVersion)
    )

    // No need to move any further if the strings are identical
    if (originalString === newString) {
      return false
    }

    if (DRY_RUN) {
      console.log(`Found ${oldVersion} → ${newVersion} in ${file}`)
      return true
    }

    await fs.writeFile(file, newString, 'utf8')
    console.log(`✓ Updated ${oldVersion} → ${newVersion} in ${file}`)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false // Skip missing files silently
    }
    console.error(`❌ Error updating ${file}: ${error.message}`)
    throw error
  }
}

/**
 * Updates package.json version using npm version command
 * This ensures package-lock.json and other npm metadata is properly updated
 * @param {string} newVersion - The new version to set
 */
async function bumpNpmVersion(newVersion) {
  if (DRY_RUN) {
    console.log(`Would update package.json to v${newVersion}`)
    return
  }

  try {
    await execFileAsync('npm', ['version', newVersion, '--no-git-tag'])
    console.log(`✓ Package.json updated to v${newVersion}`)
  } catch (error) {
    console.error(`❌ Failed to update package.json: ${error.message}`)
    process.exit(1)
  }
}

function showUsage(args) {
  console.error('USAGE: bump-version <old_version> <new_version> [--dry-run]')
  console.error('')
  console.error('Examples:')
  console.error('  bump-version 1.0.0 1.1.0')
  console.error('  bump-version 1.0.0 2.0.0 --dry')
  console.error('')
  console.error('Got arguments:', args)
  console.error('')
  process.exit(1)
}

async function main(args) {
  let [oldVersion, newVersion] = args

  if (!oldVersion || !newVersion) {
    showUsage(args)
  }

  // Normalize version arguments by removing any leading 'v' prefix
  // This prevents issues with duplicate 'v' characters in version strings
  ;[oldVersion, newVersion] = [oldVersion, newVersion].map((arg) => {
    return arg.startsWith('v') ? arg.slice(1) : arg
  })

  if (oldVersion === newVersion) {
    showUsage(args)
  }

  console.log(`🚀 Bumping version ${oldVersion} → ${newVersion}${DRY_RUN ? ' (DRY RUN)' : ''}`)
  console.log('')

  await bumpNpmVersion(newVersion)

  try {
    const results = await Promise.all(
      FILES.map((file) => replaceRecursively(file, oldVersion, newVersion))
    )

    const updatedCount = results.filter(Boolean).length

    console.log('')

    if (DRY_RUN) {
      console.log(`ℹ️ Summary: Would update ${updatedCount} file${updatedCount === 1 ? '' : 's'}`)
    } else {
      console.log(
        `✅ Complete: Updated ${updatedCount} file${updatedCount === 1 ? '' : 's'} successfully`
      )
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

main(process.argv.slice(2))
