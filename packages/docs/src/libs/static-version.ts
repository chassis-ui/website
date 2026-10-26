import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// The hash of each file, kept until its size or time of change differs: a page of the build
// reads the same stylesheet as every other page, and the dev server sees a file copied anew.
const versions = new Map<string, { mtimeMs: number; size: number; version: string }>()

/**
 * The first 8 characters of the MD5 hash of a file's content, or `undefined` when there is
 * no file at `fsPath`.
 */
export function getFileVersion(fsPath: string): string | undefined {
  let stats: fs.Stats

  try {
    stats = fs.statSync(fsPath)
  } catch {
    return undefined
  }

  if (!stats.isFile()) return undefined

  const cached = versions.get(fsPath)

  if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size) {
    return cached.version
  }

  const version = createHash('md5').update(fs.readFileSync(fsPath)).digest('hex').slice(0, 8)
  versions.set(fsPath, { mtimeMs: stats.mtimeMs, size: stats.size, version })

  return version
}

/**
 * Adds `?v=` and the version of the file to the URL path of a file of the public directory:
 * `/static/css/chassis.min.css?v=8e2106f6`. A new content is a new URL, so the file can be
 * kept by the browser until the page names another. A path that the public directory has no
 * file at is returned as it is.
 *
 * @param urlPath URL path of the file, e.g. `"/static/css/chassis.min.css"`.
 * @param publicDir Absolute path of the site's `public` directory.
 */
export function versionStaticPath(urlPath: string, publicDir: string): string {
  const fsPath = path.join(publicDir, urlPath)

  if (path.relative(publicDir, fsPath).startsWith('..')) return urlPath

  const version = getFileVersion(fsPath)

  return version ? `${urlPath}?v=${version}` : urlPath
}
