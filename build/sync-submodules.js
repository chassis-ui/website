#!/usr/bin/env node

/*!
 * Git Submodule Sync
 *
 * Synchronizes git submodules to their latest versions.
 *
 * Configuration:
 *   SUBMODULE_BRANCH - Branch to use for submodules (default: app/docs)
 *
 * Usage:
 *   node sync-submodules.js [command]
 *   SUBMODULE_BRANCH=main node sync-submodules.js
 *
 * Commands:
 *   (none)    Sync all submodules (default)
 *   help      Show this help message
 *
 * Copyright 2025 Ozgur Gunes
 * Licensed under MIT
 */

import { execSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import picocolors from 'picocolors'

/**
 * Git submodule synchronizer with build support
 */
class SubmoduleSync {
  static COLORS = {
    info: picocolors.cyan,
    success: picocolors.green,
    error: picocolors.red,
    warning: picocolors.yellow,
    build: picocolors.magenta
  }

  static ICONS = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    build: '⚙️'
  }

  /**
   * Initialize synchronizer with configuration
   * @param {string} rootDir - Root directory of the project
   */
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir
    this.submoduleBranch = process.env.SUBMODULE_BRANCH || 'app/docs'
    this.submodules = [
      {
        name: 'chassis-assets',
        path: 'vendor/assets',
        lfs: true,
        expectedBranch: this.submoduleBranch,
        buildCommands: ['pnpm install --ignore-workspace', 'pnpm assets:site'],
        buildOutputPath: 'dist/web/chassis-docs'
      }
    ]
  }

  /**
   * Log formatted messages with icons and colors
   * @param {string} message - Message to log
   * @param {string} type - Type of message (info, success, error, warning, build)
   */
  log(message, type = 'info') {
    const colorFn = SubmoduleSync.COLORS[type] || picocolors.white
    console.log(colorFn(`${SubmoduleSync.ICONS[type]} ${message}`))
  }

  /**
   * Execute shell command with error handling
   * @param {string} command - Command to execute
   * @param {string} cwd - Working directory
   * @param {boolean} silent - Suppress output
   * @returns {string} Command output
   */
  runCommand(command, cwd = this.rootDir, silent = false) {
    try {
      if (!silent) {
        this.log(`Running: ${command}`, 'info')
      }

      const result = execSync(command, {
        cwd,
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit'
      })
      return result
    } catch (error) {
      this.log(`Command failed: ${command}`, 'error')
      this.log(`Error: ${error.message}`, 'error')
      throw error
    }
  }

  /**
   * Check if a submodule needs initialization
   * @param {Object} submodule - Submodule configuration
   * @returns {boolean} True if submodule needs to be initialized
   */
  needsInit(submodule) {
    const submodulePath = path.join(this.rootDir, submodule.path)

    if (!fs.existsSync(submodulePath) || !fs.existsSync(path.join(submodulePath, '.git'))) {
      return true
    }

    return false
  }

  /**
   * Initialize and fetch a submodule from remote
   * @param {Object} submodule - Submodule configuration
   */
  initSubmodule(submodule) {
    this.log(`Initializing ${submodule.name}...`, 'info')
    this.runCommand(`git submodule update --init --remote ${submodule.path}`, this.rootDir, true)
    const submodulePath = path.join(this.rootDir, submodule.path)
    if (submodule.lfs) {
      this.runCommand('git lfs install', submodulePath, true)
      this.runCommand('git lfs pull', submodulePath, true)
    }
  }

  /**
   * Sync a single submodule
   * @param {Object} submodule - Submodule configuration
   */
  syncSubmodule(submodule) {
    this.log(`Syncing ${submodule.name}...`, 'info')

    const submodulePath = path.join(this.rootDir, submodule.path)

    // Initialize only if the submodule folder is missing or not a git repo
    if (this.needsInit(submodule)) {
      try {
        this.initSubmodule(submodule)
      } catch (error) {
        this.log(`Failed to initialize ${submodule.name}: ${error.message}`, 'error')
        throw error
      }
    }

    // Ensure we're on the correct branch and pull latest
    try {
      if (submodule.expectedBranch) {
        const currentBranch = this.runCommand(
          'git rev-parse --abbrev-ref HEAD',
          submodulePath,
          true
        ).trim()

        if (currentBranch !== submodule.expectedBranch) {
          // Check for uncommitted changes before switching branches
          const status = this.runCommand('git status --porcelain', submodulePath, true).trim()
          if (status) {
            this.log(`${submodule.name} has uncommitted changes, skipping branch switch`, 'warning')
            return
          }

          this.log(`Switching ${submodule.name} to ${submodule.expectedBranch} branch...`, 'info')
          this.runCommand(`git checkout ${submodule.expectedBranch}`, submodulePath, true)
        }

        this.runCommand(`git pull origin ${submodule.expectedBranch}`, submodulePath, true)
        if (submodule.lfs) {
          this.runCommand('git lfs install', submodulePath, true)
          this.runCommand('git lfs pull', submodulePath, true)
        }
      } else {
        this.runCommand(
          `git submodule update --remote --merge ${submodule.path}`,
          this.rootDir,
          true
        )
      }

      this.log(`${submodule.name} synced successfully`, 'success')

      // Build the submodule if build commands are defined
      this.buildSubmodule(submodule)
    } catch (error) {
      if (
        error.message.includes('conflict') ||
        error.message.includes('diverged') ||
        error.message.includes('local changes') ||
        error.message.includes('modified')
      ) {
        this.log(`${submodule.name} has local changes, keeping current version`, 'warning')
      } else {
        this.log(`Failed to sync ${submodule.name}: ${error.message}`, 'error')
        throw error
      }
    }
  }

  /**
   * Build a submodule and verify output
   * @param {Object} submodule - Submodule configuration
   */
  buildSubmodule(submodule) {
    if (!submodule.buildCommands || submodule.buildCommands.length === 0) {
      return
    }

    const submodulePath = path.join(this.rootDir, submodule.path)

    this.log(`Building ${submodule.name}...`, 'build')

    for (const command of submodule.buildCommands) {
      try {
        this.runCommand(command, submodulePath, false)
      } catch (buildError) {
        this.log(`Build command failed: ${command}`, 'error')
        this.log(`Error: ${buildError.message}`, 'error')
        throw buildError
      }
    }

    // Verify build output if specified
    if (submodule.buildOutputPath) {
      const outputPath = path.join(submodulePath, submodule.buildOutputPath)
      if (fs.existsSync(outputPath)) {
        try {
          const result = this.runCommand(`find "${outputPath}" -type f | wc -l`, this.rootDir, true)
          const fileCount = parseInt(result.trim())
          this.log(`${submodule.name} built successfully (${fileCount} files)`, 'success')
        } catch {
          this.log(`${submodule.name} build output created successfully`, 'success')
        }
      } else {
        this.log(`Build output not found at expected location`, 'warning')
      }
    } else {
      this.log(`${submodule.name} build commands completed`, 'success')
    }
  }

  /**
   * Check for submodule changes and provide commit guidance
   */
  checkSubmoduleChanges() {
    try {
      const status = this.runCommand('git status --porcelain', this.rootDir, true)
      const hasChanges = this.submodules.some((sub) =>
        status.split('\n').some((line) => line.includes(sub.path))
      )

      console.log('')
      if (hasChanges) {
        this.log('Submodule changes detected', 'info')
        this.log(
          ' Run `git add . && git commit -m "chore: update submodules"` to commit changes',
          'warning'
        )
      } else {
        this.log('All submodules are up to date', 'success')
      }
    } catch {
      // Ignore submodule status errors
    }
  }

  /**
   * Execute the complete sync process
   */
  syncAll() {
    this.log('Syncing git submodules...', 'build')

    // Sync each submodule (init only if needed)
    for (const submodule of this.submodules) {
      this.syncSubmodule(submodule)
    }

    this.checkSubmoduleChanges()

    this.log('Submodule sync completed!', 'success')
  }
}

/**
 * CLI interface and command routing
 */
function main() {
  const command = process.argv[2]
  const sync = new SubmoduleSync()

  try {
    switch (command) {
      case 'help':
      case '--help':
      case '-h': {
        console.log(`
SubmoduleSync - Git Submodule Synchronizer

Usage:
  node sync-submodules.js [command]

Environment Variables:
  SUBMODULE_BRANCH    Branch for submodules (default: app/docs)

Commands:
  (none)    Sync all submodules (default)
  help      Show this help message
`)
        break
      }

      default: {
        sync.syncAll()
        break
      }
    }
  } catch (error) {
    console.error(picocolors.red('❌ Error:'), error.message)
    process.exit(1)
  }
}

main()

export default SubmoduleSync
