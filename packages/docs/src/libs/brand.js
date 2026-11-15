import fs from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'

/** The file of a site that pins the release of the assets, from the root of the repository. */
export const ASSETS_PIN = 'vendor/assets.json'

/** The repository whose releases hold the assets of the Chassis sites. */
export const DEFAULT_REPOSITORY = 'chassis-ui/website-assets'

/** The brand that `@chassis-ui/css` compiles its `dist` for. */
export const DEFAULT_BRAND = 'chassis'

/** The app of the docs sites, in the archives of the assets and in the tokens. */
export const DEFAULT_APP = 'docs'

/** The file of a developer's own settings, in the root of the repository. Git ignores it. */
export const SETTINGS_FILE = '.env.local'

/** The variable that compiles Chassis CSS for the default brand too. */
export const COMPILE_CSS_VARIABLE = 'CHASSIS_COMPILE_CSS'

function isRepositoryRoot(directory) {
  return (
    fs.existsSync(path.join(directory, '.git')) ||
    fs.existsSync(path.join(directory, 'pnpm-workspace.yaml'))
  )
}

/**
 * The folders from `root` up to the root of the repository, nearest first. The root of the
 * repository is the nearest ancestor with a `.git` entry or a pnpm workspace file.
 * @param {string} root
 * @returns {string[]}
 */
export function getSearchDirectories(root) {
  const directories = []
  let current = path.resolve(root)

  while (true) {
    directories.push(current)

    const parent = path.dirname(current)

    if (isRepositoryRoot(current) || parent === current) {
      return directories
    }

    current = parent
  }
}

/**
 * The folder that holds `vendor/assets.json`, searching from `root` up.
 * @param {string} [root]
 * @returns {string | undefined}
 */
export function findPinRoot(root = process.cwd()) {
  return getSearchDirectories(root).find((directory) =>
    fs.existsSync(path.join(directory, ASSETS_PIN))
  )
}

function checkName(name, variable) {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
    throw new Error(`${variable} is '${name}'. Expected letters, digits and hyphens.`)
  }

  return name
}

// What `.env.local` sets: the file of the root of the repository, or of `root` itself where no
// folder above it is one.
function readSettingsFile(root) {
  const top = getSearchDirectories(root).at(-1)
  const base = findPinRoot(root) ?? (isRepositoryRoot(top) ? top : path.resolve(root))
  const file = path.join(base, SETTINGS_FILE)

  return fs.existsSync(file) ? parseEnv(fs.readFileSync(file, 'utf8')) : {}
}

/**
 * A setting of the Chassis commands and helpers, and where it is set: the environment of the
 * command, then `.env.local` in the root of the repository, where a developer keeps it so that
 * every run takes it. Astro and Vite do not put that file in `process.env`, so it is read here.
 * An empty value in the environment turns the file off for one command.
 * @param {string} name
 * @param {{ root?: string, file?: Record<string, string> }} [options] `file` is what the file
 *   sets, for a caller that reads more than one setting.
 * @returns {{ value?: string, from?: string }}
 */
export function readSetting(name, { root = process.cwd(), file } = {}) {
  if (process.env[name] !== undefined) {
    return { value: process.env[name], from: 'the environment' }
  }

  const value = (file ?? readSettingsFile(root))[name]

  return value === undefined ? {} : { value, from: SETTINGS_FILE }
}

/**
 * The brand and the app that a build is for: `CHASSIS_BRAND` and `CHASSIS_APP` of the
 * environment or of `.env.local` (see `readSetting()`), then `brand` and `app` of
 * `vendor/assets.json`, then `chassis` and `docs`.
 * @param {{ root?: string }} [options]
 * @returns {{ brand: string, app: string, isDefault: boolean }}
 */
export function getChassisBrand({ root = process.cwd() } = {}) {
  const pinRoot = findPinRoot(root)
  const pin = pinRoot ? JSON.parse(fs.readFileSync(path.join(pinRoot, ASSETS_PIN), 'utf8')) : {}
  const file = readSettingsFile(root)
  const pick = (name, pinned, fallback) =>
    checkName(readSetting(name, { file }).value?.trim() || pinned || fallback, name)
  const brand = pick('CHASSIS_BRAND', pin.brand, DEFAULT_BRAND)
  const app = pick('CHASSIS_APP', pin.app, DEFAULT_APP)

  return { brand, app, isDefault: brand === DEFAULT_BRAND && app === DEFAULT_APP }
}

/**
 * The start of the name of a web archive of the repository of the assets.
 * @param {string} repository
 */
export function archivePrefix(repository) {
  return `${repository.split('/')[1]}-web-`
}

/**
 * The brands that `vendor/assets.json` pins an archive of, for the app of the build, in the
 * order of their names. Empty without a pin.
 * @param {{ root?: string }} [options]
 * @returns {string[]}
 */
export function getPinnedBrands({ root = process.cwd() } = {}) {
  const pinRoot = findPinRoot(root)

  if (!pinRoot) return []

  const {
    repository = DEFAULT_REPOSITORY,
    version,
    archives = {}
  } = JSON.parse(fs.readFileSync(path.join(pinRoot, ASSETS_PIN), 'utf8'))
  const start = `${archivePrefix(repository)}${getChassisBrand({ root }).app}-`
  const end = `-${version}.zip`

  return Object.keys(archives)
    .filter((name) => name.startsWith(start) && name.endsWith(end))
    .map((name) => name.slice(start.length, -end.length))
    .toSorted()
}

/**
 * Whether the build compiles Chassis CSS from the tokens that the site installs, in place of
 * the files of `@chassis-ui/css`, which hold the tokens of the default brand: for another brand
 * or app, and for the default one when `CHASSIS_COMPILE_CSS` is `true`, in the environment or
 * in `.env.local`.
 * @param {{ root?: string }} [options]
 * @returns {boolean}
 */
export function compilesChassisCSS({ root = process.cwd() } = {}) {
  if (!getChassisBrand({ root }).isDefault) return true

  const { value, from } = readSetting(COMPILE_CSS_VARIABLE, { root })
  const normal = value?.trim().toLowerCase()

  if (!normal || normal === 'false' || normal === '0') return false
  if (normal === 'true' || normal === '1') return true

  throw new Error(`${COMPILE_CSS_VARIABLE} of ${from} is '${value}'. Expected true or false.`)
}

/**
 * The settings of a build that `.env.local` holds and the environment does not override, as
 * `NAME=value`, for a warning: a value left in the file is easy to forget.
 * @param {{ root?: string }} [options]
 * @returns {string[]}
 */
export function getFileSettings({ root = process.cwd() } = {}) {
  const file = readSettingsFile(root)

  return ['CHASSIS_BRAND', 'CHASSIS_APP', COMPILE_CSS_VARIABLE]
    .filter((name) => file[name]?.trim() && process.env[name] === undefined)
    .map((name) => `${name}=${file[name].trim()}`)
}
