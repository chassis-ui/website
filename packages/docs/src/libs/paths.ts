import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Public paths of the package and the directories behind them. They match `exports` in
// `package.json`.
const publicDirectories: Record<string, string> = {
  components: 'src/components',
  js: 'src/js',
  layouts: 'src/layouts',
  scss: 'src/scss',
  shortcodes: 'src/components/shortcodes'
}

/**
 * Absolute path of the package on disk.
 *
 * Only correct in code that runs while Astro loads its configuration. Pages and components
 * are bundled, so they use `getPackageFilePath()` from `@chassis-ui/docs/site`.
 */
export function getPackageRoot(): string {
  return fileURLToPath(new URL('../../', import.meta.url))
}

/**
 * Absolute path of a file of the package, named by its public path.
 *
 * @param file Path as it is imported, without the package name, e.g. `"js/color-modes.js"`
 * or `"shortcodes/Code.astro"`.
 * @param packageRoot Absolute path of the package.
 */
export function resolvePackageFilePath(file: string, packageRoot = getPackageRoot()): string {
  const [directory, ...rest] = file.split('/')
  const target = publicDirectories[directory]

  if (!target) {
    throw new Error(
      `'${file}' is not a public path of @chassis-ui/docs. Expected a path that starts with one of: ${Object.keys(publicDirectories).join(', ')}.`
    )
  }

  return path.join(packageRoot, target, ...rest)
}

// The repository root is the nearest ancestor with a `.git` entry or a pnpm workspace file.
function getSearchDirectories(root: string): string[] {
  const directories: string[] = []
  let current = path.resolve(root)

  while (true) {
    directories.push(current)

    const isRepositoryRoot =
      fs.existsSync(path.join(current, '.git')) ||
      fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))
    const parent = path.dirname(current)

    if (isRepositoryRoot || parent === current) {
      return directories
    }

    current = parent
  }
}

/**
 * Every `node_modules` directory between the site's root and the root of the repository,
 * nearest first. For tools that resolve package names without Vite, such as the Sass API.
 */
export function getNodeModulesFsPaths(root = process.cwd()): string[] {
  return getSearchDirectories(root)
    .map((directory) => path.join(directory, 'node_modules'))
    .filter((directory) => fs.existsSync(directory))
}

function findUp(root: string, candidates: string[], description: string): string {
  const searched = getSearchDirectories(root)

  for (const directory of searched) {
    for (const candidate of candidates) {
      const candidatePath = path.join(directory, candidate)

      if (fs.existsSync(candidatePath)) {
        return candidatePath
      }
    }
  }

  throw new Error(
    `Could not find ${description}. Looked for ${candidates.map((c) => `'${c}'`).join(' or ')} in:\n${searched.map((d) => `  - ${d}`).join('\n')}`
  )
}

export interface ChassisPathOptions {
  /**
   * The site's root. The search starts here and stops at the root of the repository.
   * @default process.cwd()
   */
  root?: string
  /**
   * The directory to use, when it is not where the search would find it. A relative path is
   * resolved from `root`.
   */
  dir?: string
}

function resolveDir({ root = process.cwd(), dir }: ChassisPathOptions): string | undefined {
  return dir ? path.resolve(root, dir) : undefined
}

/**
 * Directory of an installed package. Finds the package whether `node_modules` is in the
 * site's root or hoisted to the root of the repository.
 */
export function getInstalledPackageFsPath(name: string, root = process.cwd()): string {
  return findUp(root, [path.join('node_modules', name)], `the package '${name}'`)
}

/**
 * The docs build of `@chassis-ui/tokens`. The folder moved from `dist/tokens/web/docs` to
 * `dist/web/docs` between releases of the tokens package, and both are found.
 */
export function getChassisTokensFsPath(options: ChassisPathOptions = {}): string {
  const tokens =
    resolveDir(options) ?? getInstalledPackageFsPath('@chassis-ui/tokens', options.root)

  return findUp(
    tokens,
    ['dist/web/docs/chassis', 'dist/tokens/web/docs/chassis'],
    'the docs build of @chassis-ui/tokens'
  )
}

/**
 * The docs build of `chassis-assets`: in the `vendor/assets` submodule, or in `dist` for the
 * site of `chassis-assets` itself.
 */
export function getChassisAssetsFsPath(options: ChassisPathOptions = {}): string {
  return (
    resolveDir(options) ??
    findUp(
      options.root ?? process.cwd(),
      ['vendor/assets/dist/web/docs/chassis', 'dist/web/docs/chassis'],
      'the docs build of chassis-assets'
    )
  )
}

/** The `dist` folder of `@chassis-ui/css`. */
export function getChassisCSSFsPath(options: ChassisPathOptions = {}): string {
  return (
    resolveDir(options) ??
    path.join(getInstalledPackageFsPath('@chassis-ui/css', options.root), 'dist')
  )
}

/** The folder of `@chassis-ui/icons`. */
export function getChassisIconsFsPath(options: ChassisPathOptions = {}): string {
  return resolveDir(options) ?? getInstalledPackageFsPath('@chassis-ui/icons', options.root)
}
