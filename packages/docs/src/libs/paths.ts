import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getChassisBrand, getSearchDirectories } from './brand.js'

export { getChassisBrand }

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
 * The tokens of the brand and the app of the build, in `@chassis-ui/website-tokens` or in the
 * tokens that `dir` names. See `getChassisBrand()`.
 */
export function getChassisTokensFsPath(options: ChassisPathOptions = {}): string {
  const tokens =
    resolveDir(options) ?? getInstalledPackageFsPath('@chassis-ui/website-tokens', options.root)
  const { brand, app } = getChassisBrand({ root: options.root })

  return findUp(tokens, [`dist/web/${app}/${brand}`], 'the docs build of the tokens')
}

/**
 * A Sass load path with the `_chassis-tokens.scss` of the brand of the build, written for it,
 * or nothing for the default brand, which the default token source of `@chassis-ui/css` loads.
 */
export function getBrandTokensLoadPath(root = process.cwd()): string | undefined {
  const { brand, app, isDefault } = getChassisBrand({ root })

  if (isDefault) return undefined

  const tokens = path.join(getChassisTokensFsPath({ root }), 'main')
  const directory = path.join(root, 'node_modules/.cache/chassis-docs/tokens', app, brand)
  const forward = path.relative(directory, tokens).split(path.sep).join('/')

  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, '_chassis-tokens.scss'), `@forward "${forward}";\n`)

  return directory
}

/**
 * The assets of the brand and the app of the build: in `vendor/assets`, where `chassis-docs
 * vendor` unpacks them, or in `dist` of a repository that builds them. See `getChassisBrand()`.
 */
export function getChassisAssetsFsPath(options: ChassisPathOptions = {}): string {
  if (options.dir) return resolveDir(options) as string

  const { brand, app } = getChassisBrand({ root: options.root })

  return findUp(
    options.root ?? process.cwd(),
    [`vendor/assets/dist/web/${app}/${brand}`, `dist/web/${app}/${brand}`],
    'the assets of the site. Run chassis-docs vendor'
  )
}

/** The `dist` folder of `@chassis-ui/css`. */
export function getChassisCSSFsPath(options: ChassisPathOptions = {}): string {
  return (
    resolveDir(options) ??
    path.join(getInstalledPackageFsPath('@chassis-ui/css', options.root), 'dist')
  )
}

/**
 * The `dist/web` folder of `@chassis-ui/website-icons`, with the icon font, its stylesheets
 * and the SVG sprite, or the folder of icons that `dir` names.
 */
export function getChassisIconsFsPath(options: ChassisPathOptions = {}): string {
  return (
    resolveDir(options) ??
    path.join(getInstalledPackageFsPath('@chassis-ui/website-icons', options.root), 'dist/web')
  )
}
