import fs from 'node:fs'
import { CommandError, importPeer, log } from './shared.js'
import { findHtmlFiles } from './files.js'

/** What the layouts and shortcodes of the package need. A site adds its own on top. */
export const defaultConfig = {
  extends: ['html-validate:recommended', 'html-validate:document'],
  rules: {
    // Astro writes void elements with a trailing slash
    'void-style': 'off',
    // Shiki highlights code with inline styles
    'no-inline-style': 'off',
    // The dialogs start at h2, and the `document` preset expects h1 in each sectioning root
    'heading-level': ['error', { minInitialRank: 'h2', sectioningRoots: [] }],
    // The layouts load their files from the site itself
    'require-sri': 'off'
  }
}

/**
 * Adds a site's config to the default one: `extends` is appended, `rules` are merged,
 * and `elements` is replaced.
 * @param {Record<string, any>} base
 * @param {Record<string, any>} [extra]
 * @returns {Record<string, any>}
 */
export function mergeConfig(base, extra = {}) {
  return {
    ...base,
    ...extra,
    extends: [...(base.extends ?? []), ...(extra.extends ?? [])],
    rules: { ...base.rules, ...extra.rules }
  }
}

/**
 * Reads a config file of html-validate.
 * @param {string} file
 */
export function readConfig(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    throw new CommandError(`Could not read ${file}: ${error.message}`, { cause: error })
  }
}

// Validating hundreds of files at once runs out of file descriptors.
async function mapWithConcurrency(limit, items, fn) {
  const results = []
  const running = new Set()

  for (const item of items) {
    const promise = fn(item).finally(() => running.delete(promise))

    running.add(promise)
    results.push(promise)

    if (running.size >= limit) await Promise.race(running)
  }

  return Promise.all(results)
}

/**
 * Validates the HTML files in `paths` with html-validate. Returns the exit code.
 * @param {{ paths: string[], ignores: string[], config?: string }} options
 */
export async function htmlValidate({ paths, ignores, config }) {
  const { HtmlValidate, Severity } = await importPeer('html-validate')
  const validator = new HtmlValidate(mergeConfig(defaultConfig, config && readConfig(config)))
  const files = findHtmlFiles(paths, ignores)

  log(`Validating ${files.length} HTML files with html-validate`)

  const reports = await mapWithConcurrency(10, files, async (file) => ({
    file,
    report: await validator.validateFile(file)
  }))

  let issueCount = 0
  let fileCount = 0

  for (const { file, report } of reports) {
    const messages = (report.results[0]?.messages ?? []).filter(
      (message) => message.severity >= Severity.WARN
    )

    if (messages.length === 0) continue

    fileCount++
    issueCount += messages.length
    console.error(`\n${file}`)

    for (const message of messages) {
      const level = message.severity === Severity.ERROR ? 'error' : 'warning'

      console.error(
        `  ${message.line}:${message.column}  ${level}  ${message.message}  (${message.ruleId})`
      )
    }
  }

  if (issueCount > 0) {
    log(`\n${issueCount} issues in ${fileCount} files.`, 'error')
    return 1
  }

  log('Every HTML file is valid.', 'success')
  return 0
}
