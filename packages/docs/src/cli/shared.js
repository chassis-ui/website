import { execFileSync } from 'node:child_process'
import { styleText } from 'node:util'

/** An error that the command reports in one line, without a stack trace. */
export class CommandError extends Error {}

const colors = { info: 'cyan', success: 'green', warning: 'yellow', error: 'red' }

/**
 * Prints a message in the colour of its type. Errors and warnings go to stderr.
 * @param {string} message
 * @param {'info' | 'success' | 'warning' | 'error'} [type]
 */
export function log(message, type = 'info') {
  const stream = type === 'error' || type === 'warning' ? process.stderr : process.stdout

  stream.write(`${styleText(colors[type], message)}\n`)
}

/**
 * Runs a program without a shell, except on Windows, where `pnpm` is a `.cmd` file.
 * Returns what it printed when `quiet` is set, and prints it otherwise.
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd?: string, quiet?: boolean }} [options]
 * @returns {string}
 */
export function run(command, args, { cwd = process.cwd(), quiet = false } = {}) {
  if (!quiet) {
    log(`$ ${[command, ...args].join(' ')}`)
  }

  try {
    return (
      execFileSync(command, args, {
        cwd,
        encoding: 'utf8',
        stdio: quiet ? 'pipe' : 'inherit',
        shell: process.platform === 'win32'
      }) ?? ''
    )
  } catch (error) {
    const stderr = typeof error.stderr === 'string' ? error.stderr.trim() : ''

    throw new CommandError(
      `${[command, ...args].join(' ')} failed${stderr ? `:\n${stderr}` : ''}`,
      { cause: error }
    )
  }
}

/**
 * Imports an optional peer dependency, or says how to install it.
 * @param {string} name
 */
export async function importPeer(name) {
  try {
    return await import(name)
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes(`'${name}'`)) {
      throw new CommandError(
        `${name} is not installed. Add it to the devDependencies of the site: pnpm add -D ${name}`,
        { cause: error }
      )
    }

    throw error
  }
}
