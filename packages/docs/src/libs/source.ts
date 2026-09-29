import path from 'node:path'
import { getConfig } from '@libs/config'

/**
 * The part of the site's `config.yml` that says where files live, on disk and on GitHub.
 *
 * All four location keys are optional. A site that sets none of them is assumed to be built
 * from the root of its repository, with its source files in that root.
 */
interface SourceConfig {
  /** Repository URL (e.g. `"https://github.com/chassis-ui/css"`). */
  repo: string
  /** Version of the release that links to source files name. */
  current_version: string
  /**
   * Directory the `file` props of `<ScssDocs>`, `<ScssDocsSimple>`, `<JsDocs>` and `<Code>` are
   * relative to, itself relative to the working directory of the build (e.g. `"../css"` for a
   * site in `packages/site`).
   */
  sourceDir?: string
  /** The same directory from the root of the repository (e.g. `"packages/css"`). */
  sourcePath?: string
  /** The site's root from the root of the repository (e.g. `"packages/site"`). */
  sitePath?: string
  /** The branch that "View on GitHub" links to. Defaults to `"main"`. */
  siteBranch?: string
}

function getSourceConfig(): SourceConfig {
  return getConfig() as SourceConfig
}

/** Joins URL segments, skipping empty ones, and resolves any `..` in them. */
function toUrl(segments: (string | undefined)[]): string {
  const url = segments.filter(Boolean).join('/').replaceAll('\\', '/')

  return new URL(url).href
}

/** Absolute path of a file or directory that a `file` prop names. */
export function getSourceFsPath(file = ''): string {
  return path.resolve(process.cwd(), getSourceConfig().sourceDir ?? '.', file)
}

/** URL of a source file on GitHub, in the tag of the current version. */
export function getSourceUrl(file: string): string {
  const { repo, current_version: version, sourcePath } = getSourceConfig()

  return toUrl([repo, 'blob', `v${version}`, sourcePath, file])
}

/**
 * URL of a file of the site on GitHub, on the site's branch.
 *
 * @param filePath Path of the file from the site's root, as Astro stores it in a content
 * entry's `filePath` (e.g. `"content/docs/getting-started/introduction.mdx"`).
 */
export function getSiteFileUrl(filePath: string): string {
  const { repo, sitePath, siteBranch = 'main' } = getSourceConfig()

  return toUrl([repo, 'blob', siteBranch, sitePath, filePath])
}
