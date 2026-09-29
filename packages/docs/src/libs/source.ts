import path from 'node:path'
import type { ChassisConfig } from './schema'

/** The keys of `config.yml` that say where files live, on disk and on GitHub. */
export type SourceConfig = Pick<
  ChassisConfig,
  'repo' | 'currentVersion' | 'siteBranch' | 'sitePath' | 'sourcePath'
>

/** Joins URL segments, skipping empty ones, and resolves any `..` in them. */
function toUrl(segments: (string | undefined)[]): string {
  const url = segments.filter(Boolean).join('/').replaceAll('\\', '/')

  return new URL(url).href
}

/**
 * Absolute path of a file or directory that a `file` prop names.
 *
 * @param sourceDir Absolute path of the directory that `file` props are relative to.
 */
export function resolveSourceFsPath(sourceDir: string, file = ''): string {
  return path.resolve(sourceDir, file)
}

/** URL of a source file on GitHub, in the tag of the current version. */
export function resolveSourceUrl(config: SourceConfig, file: string): string {
  return toUrl([config.repo, 'blob', `v${config.currentVersion}`, config.sourcePath, file])
}

/**
 * URL of a file of the site on GitHub, on the site's branch.
 *
 * @param filePath Path of the file from the site's root, as Astro stores it in a content
 * entry's `filePath` (e.g. `"content/docs/getting-started/introduction.mdx"`).
 */
export function resolveSiteFileUrl(config: SourceConfig, filePath: string): string {
  return toUrl([config.repo, 'blob', config.siteBranch, config.sitePath, filePath])
}
