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
        expectedBranch: this.submoduleBranch,
        buildCommands: ['pnpm install', 'pnpm build'],
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
    const colors = {
      info: picocolors.cyan,
      success: picocolors.green,
      error: picocolors.red,
      warning: picocolors.yellow,
      build: picocolors.magenta
    }

    const icons = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      build: '⚙️'
    }

    const colorFn = colors[type] || picocolors.white
    console.log(colorFn(`${icons[type]} ${message}`))
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
   * Sync a single submodule
   * @param {Object} submodule - Submodule configuration
   */
  syncSubmodule(submodule) {
    this.log(`Syncing ${submodule.name}...`, 'info')

    const submodulePath = path.join(this.rootDir, submodule.path)

    if (!fs.existsSync(submodulePath)) {
      this.log(`${submodule.name} not found at ${submodule.path}`, 'warning')
      return
    }

    try {
      // Ensure we're on the correct branch if specified
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
          this.runCommand(`git pull origin ${submodule.expectedBranch}`, submodulePath, true)
        } else {
          this.runCommand(
            `git submodule update --remote --merge ${submodule.path}`,
            this.rootDir,
            true
          )
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
      if (submodule.buildCommands && submodule.buildCommands.length > 0) {
        this.log(`Building ${submodule.name}...`, 'build')

        for (const command of submodule.buildCommands) {
          try {
            this.runCommand(command, submodulePath, true)
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
            const contents = fs.readdirSync(outputPath)
            this.log(`${submodule.name} built successfully (${contents.length} files)`, 'success')
          } else {
            this.log(`Build output not found at expected location`, 'warning')
          }
        } else {
          this.log(`${submodule.name} build commands completed`, 'success')
        }
      }
    } catch (error) {
      // Check if it's a merge conflict or diverged branches vs other error
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
   * Initialize submodules if they don't exist
   */
  initializeSubmodules() {
    try {
      this.runCommand('git submodule status', this.rootDir, true)
    } catch {
      this.log('Initializing submodules...', 'info')
      try {
        this.runCommand('git submodule update --init --recursive')
      } catch {
        this.log('Some submodules may not be available or have uncommitted changes', 'warning')
        this.log('Continuing with existing submodules...', 'warning')
      }
    }
  }

  /**
   * Check for submodule changes and provide commit guidance
   */
  checkSubmoduleChanges() {
    try {
      const submoduleStatus = this.runCommand('git submodule status', this.rootDir, true)
      if (submoduleStatus.trim()) {
        console.log('')
        this.log('Submodule changes detected', 'info')
        this.log(
          'Run `git add . && git commit -m "chore: update submodules"` to commit changes',
          'warning'
        )
      } else {
        console.log('')
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

    this.initializeSubmodules()

    // Sync each submodule individually with error handling
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

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export default SubmoduleSync
