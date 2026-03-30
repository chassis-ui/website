#!/usr/bin/env node

/*!
 * Site Builder Script for Chassis Website
 *
 * Comprehensive build tool for managing Chassis documentation site.
 * Handles vendor asset synchronization, Astro site building, and deployment validation.
 *
 * Usage:
 *   node build-site.js [command]
 *
 * Commands:
 *   (none)    Full build process (default)
 *   site      Build Astro documentation site only
 *   vendor    Update and build vendor assets
 *   clean     Remove build artifacts and node_modules
 *   validate  Validate build output
 *
 * Copyright 2025 Ozgur Gunes
 * Licensed under MIT
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import picocolors from 'picocolors'

/**
 * Chassis site builder with vendor asset management
 */
class ChassisBuilder {
  /**
   * Initialize builder with project directories
   * @param {string} rootDir - Root directory of the project
   */
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir
    this.vendorDir = path.join(rootDir, 'vendor')
    this.siteDir = path.join(rootDir, 'packages/website')
    this.outputDir = path.join(rootDir, '_site')
    this.buildCommand = 'pnpm astro:build'
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
   * Check for required project dependencies and directories
   */
  checkDependencies() {
    this.log('Checking project dependencies...', 'info')

    const requiredDirs = [
      { path: this.vendorDir, name: 'vendor (submodules)' },
      { path: this.siteDir, name: 'site (Astro project)' }
    ]

    for (const dir of requiredDirs) {
      if (fs.existsSync(dir.path)) {
        this.log(`Found: ${dir.name}`, 'success')
      } else {
        this.log(`Missing directory: ${dir.name}`, 'warning')
      }
    }

    // Check for required tools
    const requiredTools = ['pnpm', 'git']
    for (const tool of requiredTools) {
      try {
        execSync(`${tool} --version`, { stdio: 'pipe' })
        this.log(`Found: ${tool}`, 'success')
      } catch {
        this.log(`Missing required tool: ${tool}`, 'error')
        throw new Error(`Required tool '${tool}' not found in PATH`)
      }
    }
  }

  /**
   * Build the Astro documentation site
   */
  buildSite() {
    this.log('Building Astro documentation site...', 'build')

    if (!fs.existsSync(this.siteDir)) {
      throw new Error('Site directory not found')
    }

    // Build Astro site (outputs directly to _site via outDir config)
    this.log('Building Astro site...', 'info')
    this.runCommand(this.buildCommand)

    this.log('Astro site built successfully', 'success')
  }

  /**
   * Update and build vendor assets from submodules
   */
  updateVendor() {
    this.log('Updating vendor assets via sync-submodules...', 'build')
    this.runCommand('pnpm sync-submodules')
  }

  /**
   * Validate the build output and required directories
   */
  validateBuild() {
    this.log('Validating build...', 'info')

    const validationChecks = [
      {
        path: this.outputDir,
        name: 'Astro build output (_site)',
        required: true,
        checkContents: true
      },
      {
        path: this.vendorDir,
        name: 'Vendor submodules',
        required: true,
        checkContents: false
      }
    ]

    let allValid = true

    for (const check of validationChecks) {
      if (fs.existsSync(check.path)) {
        this.log(`✓ ${check.name}`, 'success')

        // Additional content validation for critical directories
        if (check.checkContents) {
          try {
            const contents = fs.readdirSync(check.path)
            const hasIndex = contents.includes('index.html')
            const hasAssets = contents.some(
              (item) => item.includes('assets') || item.includes('css') || item.includes('js')
            )

            if (hasIndex && hasAssets) {
              this.log(`✓ Found index.html and assets`, 'success')
            } else {
              this.log(
                `✕ Missing expected files (index.html: ${hasIndex}, assets: ${hasAssets})`,
                'warning'
              )
              allValid = false
            }
          } catch (error) {
            this.log(`✕ Could not read directory contents: ${error.message}`, 'error')
            allValid = false
          }
        }
      } else {
        this.log(`✕ ${check.name}`, 'error')
        if (check.required) {
          allValid = false
        }
      }
    }

    if (!allValid) {
      throw new Error('Build validation failed - missing required files or directories')
    }
  }

  /**
   * Clean build artifacts and node_modules directories
   */
  clean() {
    this.log('Cleaning build artifacts...', 'info')

    const cleanPaths = [
      this.outputDir,
      path.join(this.rootDir, 'node_modules'),
      path.join(this.siteDir, 'node_modules')
    ]

    for (const cleanPath of cleanPaths) {
      if (fs.existsSync(cleanPath)) {
        fs.rmSync(cleanPath, { recursive: true, force: true })
        this.log(`Cleaned: ${path.relative(this.rootDir, cleanPath)}`, 'info')
      }
    }
  }

  /**
   * Execute the complete build process
   */
  buildAll() {
    const startTime = Date.now()
    this.log('Starting complete build process...', 'build')

    try {
      this.checkDependencies()
      this.updateVendor()
      this.buildSite()
      this.validateBuild()

      const duration = Date.now() - startTime
      this.log(`🎉 Build completed successfully in ${duration}ms!`, 'success')
    } catch (error) {
      const duration = Date.now() - startTime
      this.log(`❌ Build failed after ${duration}ms: ${error.message}`, 'error')
      process.exit(1)
    }
  }
}

/**
 * CLI interface and command routing
 */
function main() {
  const command = process.argv[2]
  const builder = new ChassisBuilder()

  try {
    switch (command) {
      case 'site': {
        builder.buildSite()
        break
      }

      case 'vendor': {
        builder.updateVendor()
        break
      }

      case 'clean': {
        builder.clean()
        break
      }

      case 'validate': {
        builder.validateBuild()
        break
      }

      case 'help':
      case '--help':
      case '-h': {
        console.log(`
ChassisBuilder - Chassis Site Builder

Usage:
  node build-site.js [command]

Commands:
  (none)    Full build process (default)
  site      Build Astro documentation site only
  vendor    Sync and build vendor files from submodules
  clean     Remove build artifacts and node_modules
  validate  Validate build output
  help      Show this help message
`)
        break
      }

      default: {
        builder.buildAll()
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

export default ChassisBuilder
