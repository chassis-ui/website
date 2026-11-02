import fs from 'node:fs'
import path from 'node:path'

/** The file of a site that pins the release of the assets, from the root of the repository. */
export const ASSETS_PIN = 'vendor/assets.json'

/** The brand that `@chassis-ui/css` compiles its `dist` for. */
export const DEFAULT_BRAND = 'chassis'

/** The app of the docs sites, in the archives of the assets and in the tokens. */
export const DEFAULT_APP = 'docs'

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

/**
 * The brand and the app that a build is for: `CHASSIS_BRAND` and `CHASSIS_APP`, then `brand`
 * and `app` of `vendor/assets.json`, then `chassis` and `docs`.
 * @param {{ root?: string }} [options]
 * @returns {{ brand: string, app: string, isDefault: boolean }}
 */
export function getChassisBrand({ root = process.cwd() } = {}) {
  const pinRoot = findPinRoot(root)
  const pin = pinRoot ? JSON.parse(fs.readFileSync(path.join(pinRoot, ASSETS_PIN), 'utf8')) : {}
  const brand = checkName(
    process.env.CHASSIS_BRAND?.trim() || pin.brand || DEFAULT_BRAND,
    'CHASSIS_BRAND'
  )
  const app = checkName(process.env.CHASSIS_APP?.trim() || pin.app || DEFAULT_APP, 'CHASSIS_APP')

  return { brand, app, isDefault: brand === DEFAULT_BRAND && app === DEFAULT_APP }
}
