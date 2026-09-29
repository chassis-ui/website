import { execFile, spawn } from 'node:child_process'
import fs from 'node:fs'
import { CommandError, importPeer, log } from './shared.js'
import { expandPaths } from './files.js'

/** Messages that every Chassis site produces. Astro writes void elements with a slash. */
export const DEFAULT_FILTERS = ['Trailing slash on void elements.*']

/**
 * Reads a filter file: one regular expression per line. Blank lines and lines that start
 * with `#` are skipped.
 * @param {string} file
 */
export function readFilterFile(file) {
  let text

  try {
    text = fs.readFileSync(file, 'utf8')
  } catch (error) {
    throw new CommandError(`Could not read ${file}: ${error.message}`, { cause: error })
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

/**
 * The arguments for `java`.
 * @param {{ jar: string, paths: string[], filters: string[], is32bit?: boolean }} options
 */
export function vnuArgs({ jar, paths, filters, is32bit = false }) {
  return [
    // 32-bit Java needs a smaller thread stack
    ...(is32bit ? ['-Xss512k'] : []),
    '-jar',
    jar,
    '--skip-non-html',
    '--Werror',
    '--filterpattern',
    filters.join('|'),
    ...paths
  ]
}

function javaVersion() {
  return new Promise((resolve) => {
    // `java -version` prints to stderr
    execFile('java', ['-version'], (error, _stdout, stderr) => resolve(error ? null : stderr))
  })
}

/**
 * Validates `paths` with the Nu Html Checker. Skips, and succeeds, when Java is missing.
 * Returns the exit code.
 * @param {{ paths: string[], ignores: string[], filters?: string[], filterFile?: string }} options
 */
export async function vnu({ paths, ignores, filters = [], filterFile }) {
  const { default: jar } = await importPeer('vnu-jar')
  const allFilters = [
    ...DEFAULT_FILTERS,
    ...filters,
    ...(filterFile ? readFilterFile(filterFile) : [])
  ]
  const targets = expandPaths(paths, ignores)
  const version = await javaVersion()

  if (version === null) {
    log('Java is not installed. Skipping the Nu Html Checker.', 'warning')
    return 0
  }

  log('Validating HTML with the Nu Html Checker')

  const args = vnuArgs({
    jar,
    paths: targets,
    filters: allFilters,
    is32bit: !/64-Bit/.test(version)
  })

  const code = await new Promise((resolve) => {
    spawn('java', args, { stdio: 'inherit' }).on('exit', (exitCode) => resolve(exitCode ?? 1))
  })

  if (code === 0) {
    log('Every HTML file is valid.', 'success')
  } else {
    log('The Nu Html Checker found errors.', 'error')
  }

  return code
}
