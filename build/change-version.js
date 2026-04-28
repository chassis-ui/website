#!/usr/bin/env node

/*!
 * Version Change Script
 *
 * Changes version numbers across project files and package.json.
 *
 * Usage:
 *   node change-version.js <old_version> <new_version> [--dry-run]
 *   node change-version.js --patch [--dry-run]
 *   node change-version.js --minor [--dry-run]
 *   node change-version.js --major [--dry-run]
 *
 * Examples:
 *   node change-version.js 1.0.0 1.1.0
 *   node change-version.js 1.0.0 1.1.0 --dry
 *   node change-version.js --minor
 *   node change-version.js --major --dry-run
 *
 * Copyright 2025-2026 Ozgur Gunes
 * Licensed under MIT
 */

import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

// Configuration: Files that contain version references to be updated
// These files contain hardcoded version numbers that need to be kept in sync
const FILES = ['packages/docs/package.json', 'packages/docs/README.md']

const SEMVER_RE = /^\d+\.\d+\.\d+$/
const KNOWN_FLAGS = new Set(['--dry', '--dry-run', '--patch', '--minor', '--major', '--help', '-h'])

const execFileAsync = promisify(execFile)

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry') || args.includes('--dry-run')
const HELP = args.includes('--help') || args.includes('-h')

// RegExp utilities for safe string replacement
// TC39 proposal for RegExp.escape is still pending: https://github.com/benjamingr/RegExp.escape/issues/37
function regExpQuote(string) {
  return string.replace(/[$()*+-.?[\\\]^{|}]/g, '\\$&')
}

function regExpQuoteReplacement(string) {
  return string.replace(/\$/g, '$$')
}

/**
 * Reads the current version from the project's package.json
 * @returns {Promise<string>} The current version string
 */
async function readCurrentVersion() {
  const pkgPath = path.resolve('packages/docs/package.json')
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'))

  if (!pkg.version || !SEMVER_RE.test(pkg.version)) {
    console.error(`❌ Invalid or missing version in package.json: "${pkg.version}"`)
    process.exit(1)
  }

  return pkg.version
}

/**
 * Bumps a semver version string by the given increment type
 * @param {string} version - Current semver version (e.g. "1.2.3")
 * @param {'patch'|'minor'|'major'} type - The increment type
 * @returns {string} The bumped version string
 */
function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number)

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
    default:
      throw new Error(`Unknown bump type: ${type}`)
  }
}

/**
 * Updates version references in a single file using regex replacement
 * @param {string} file - Path to the file to update
 * @param {string} oldVersion - Current version to replace
 * @param {string} newVersion - New version to use
 * @returns {Promise<boolean>} True if file was updated, false if no changes needed
 */
async function replaceInFile(file, oldVersion, newVersion) {
  try {
    const originalString = await fs.readFile(file, 'utf8')
    const newString = originalString.replace(
      new RegExp(regExpQuote(oldVersion), 'g'),
      regExpQuoteReplacement(newVersion)
    )

    if (originalString === newString) {
      return false
    }

    if (DRY_RUN) {
      console.log(`🔍 Found ${oldVersion} → ${newVersion} in ${file}`)
      return true
    }

    await fs.writeFile(file, newString, 'utf8')
    console.log(`📄 Updated ${oldVersion} → ${newVersion} in ${file}`)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️ Skipped missing file: ${file}`)
      return false
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
    console.log(`📄 Would update package.json to v${newVersion}`)
    return
  }

  try {
    await execFileAsync('npm', ['version', newVersion, '--no-git-tag-version'])
    console.log(`📄 Package.json updated to v${newVersion}`)
  } catch (error) {
    console.error(`❌ Failed to update package.json: ${error.message}`)
    process.exit(1)
  }
}

function showUsage() {
  console.log('USAGE: change-version <old_version> <new_version> [--dry-run]')
  console.log('       change-version --patch | --minor | --major [--dry-run]')
  console.log('')
  console.log('Examples:')
  console.log('  change-version 1.0.0 1.1.0')
  console.log('  change-version 1.0.0 2.0.0 --dry')
  console.log('  change-version --minor')
  console.log('  change-version --major --dry-run')
  console.log('')
  process.exit(0)
}

async function main() {
  if (HELP) {
    showUsage()
  }

  // Check for unknown flags
  const unknownFlags = args.filter((arg) => arg.startsWith('-') && !KNOWN_FLAGS.has(arg))

  if (unknownFlags.length > 0) {
    console.error(
      `❌ Unknown flag${unknownFlags.length > 1 ? 's' : ''}: ${unknownFlags.join(', ')}`
    )
    console.error('')
    showUsage()
  }

  // Separate flags from positional arguments
  const positional = args.filter((arg) => !KNOWN_FLAGS.has(arg))
  const bumpFlags = ['--major', '--minor', '--patch'].filter((flag) => args.includes(flag))

  if (bumpFlags.length > 1) {
    console.error(`❌ Cannot combine multiple bump flags: ${bumpFlags.join(', ')}`)
    process.exit(1)
  }

  if (bumpFlags.length === 1 && positional.length > 0) {
    console.error(`❌ Cannot combine ${bumpFlags[0]} with explicit version arguments`)
    process.exit(1)
  }

  const bumpType = bumpFlags.length === 1 ? bumpFlags[0].slice(2) : null

  let oldVersion
  let newVersion

  if (bumpType && positional.length === 0) {
    // Auto-detect mode: read current version from package.json
    oldVersion = await readCurrentVersion()
    newVersion = bumpVersion(oldVersion, bumpType)
  } else if (!bumpType && positional.length === 2) {
    // Explicit mode: old and new versions provided
    ;[oldVersion, newVersion] = positional.map((arg) => (arg.startsWith('v') ? arg.slice(1) : arg))

    if (!SEMVER_RE.test(oldVersion) || !SEMVER_RE.test(newVersion)) {
      console.error(`❌ Invalid version format. Expected: x.y.z (e.g. 1.0.0)`)
      console.error(`   Got: ${oldVersion}, ${newVersion}`)
      process.exit(1)
    }

    // Verify oldVersion matches current package.json version
    const currentVersion = await readCurrentVersion()

    if (oldVersion !== currentVersion) {
      console.warn(
        `⚠️  Warning: old_version (${oldVersion}) does not match package.json (${currentVersion})`
      )
    }
  } else {
    showUsage()
  }

  if (oldVersion === newVersion) {
    console.error(`❌ Old and new versions are the same: ${oldVersion}`)
    process.exit(1)
  }

  console.log(`🚀 Bumping version ${oldVersion} → ${newVersion}${DRY_RUN ? ' (DRY RUN)' : ''}`)
  console.log('')

  await bumpNpmVersion(newVersion)

  try {
    const results = await Promise.all(
      FILES.map((file) => replaceInFile(file, oldVersion, newVersion))
    )

    const updatedCount = results.filter(Boolean).length
    const totalCount = updatedCount + 1 // +1 for package.json

    console.log('')

    if (DRY_RUN) {
      console.log(
        `ℹ️  Summary: Would update ${totalCount} file${totalCount === 1 ? '' : 's'} (including package.json)`
      )
    } else {
      console.log(
        `✅ Complete: Updated ${totalCount} file${totalCount === 1 ? '' : 's'} successfully (including package.json)`
      )
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(`❌ Unexpected error: ${error.message}`)
  process.exit(1)
})
