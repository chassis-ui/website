import fs from 'node:fs'
import path from 'node:path'
import { CommandError } from './shared.js'

/** The default output folder of a Chassis site. */
export const DEFAULT_PATHS = ['_site']

/**
 * The folders to skip when no `--ignore` is given: `static/icons` of each path, the files
 * that a site copies from `@chassis-ui/icons`. They include a preview page of their own.
 * @param {string[]} paths
 */
export function defaultIgnores(paths) {
  return paths.map((dir) => path.join(dir, 'static/icons'))
}

/**
 * Whether `file` is one of `ignores` or inside one of them.
 * @param {string} file
 * @param {string[]} ignores
 */
export function isIgnored(file, ignores) {
  const target = path.resolve(file)

  return ignores.some((ignore) => isInside(target, path.resolve(ignore)))
}

function isInside(target, dir) {
  const relative = path.relative(dir, target)

  return relative === '' || (relative.split(path.sep)[0] !== '..' && !path.isAbsolute(relative))
}

function checkExists(paths) {
  for (const entry of paths) {
    if (!fs.existsSync(entry)) {
      throw new CommandError(`${entry} does not exist. Build the site first.`)
    }
  }
}

/**
 * Lists the HTML files in `paths`, which are files or folders, leaving out `ignores` and
 * `node_modules`.
 * @param {string[]} paths
 * @param {string[]} ignores
 * @returns {string[]}
 */
export function findHtmlFiles(paths, ignores) {
  const files = []

  const visit = (entry) => {
    if (isIgnored(entry, ignores)) return

    if (fs.statSync(entry).isDirectory()) {
      for (const name of fs.readdirSync(entry).sort()) {
        if (name !== 'node_modules') visit(path.join(entry, name))
      }
    } else if (entry.endsWith('.html')) {
      files.push(entry)
    }
  }

  checkExists(paths)
  paths.forEach(visit)

  return files
}

/**
 * Returns `paths` with `ignores` taken out. A folder that contains an ignored path is
 * replaced by its entries, so that a checker that walks folders never reaches it.
 * @param {string[]} paths
 * @param {string[]} ignores
 * @returns {string[]}
 */
export function expandPaths(paths, ignores) {
  const result = []

  const visit = (entry) => {
    if (isIgnored(entry, ignores)) return

    const target = path.resolve(entry)
    const containsIgnored = ignores.some((ignore) => isInside(path.resolve(ignore), target))

    if (containsIgnored && fs.statSync(entry).isDirectory()) {
      for (const name of fs.readdirSync(entry).sort()) visit(path.join(entry, name))
    } else {
      result.push(entry)
    }
  }

  checkExists(paths)
  paths.forEach(visit)

  return result
}
