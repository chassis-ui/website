import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { unzipSync } from 'fflate'
import {
  ASSETS_PIN,
  DEFAULT_APP,
  DEFAULT_BRAND,
  findPinRoot,
  getChassisBrand
} from '../libs/brand.js'
import { CommandError, log, run as defaultRun } from './shared.js'

/** Where every Chassis site unpacks the assets. Not committed. */
export const ASSETS_PATH = 'vendor/assets'

/** The repository whose releases hold the assets of the Chassis sites. */
export const DEFAULT_REPOSITORY = 'chassis-ui/website-assets'

/** The variable that names a local checkout of the assets, to use its build in place of a release. */
export const CHECKOUT_VARIABLE = 'CHASSIS_ASSETS_CHECKOUT'

/** The files of the root that may set the variable, the later one first. Git ignores them. */
export const CHECKOUT_FILES = ['.env.local', '.env']

/**
 * The folder of a brand, under `vendor/assets` and in a build of the assets.
 * @param {{ app: string, brand: string }} selection
 */
export function assetsOutput({ app, brand }) {
  return `dist/web/${app}/${brand}`
}

/** The root of the repository, for a command that runs before the repository has a pin. */
function repositoryRoot(run) {
  return findPinRoot() ?? run('git', ['rev-parse', '--show-toplevel'], { quiet: true }).trim()
}

function selectionOf(root) {
  try {
    return getChassisBrand({ root })
  } catch (error) {
    throw new CommandError(error.message, { cause: error })
  }
}

function readPin(root) {
  const file = path.join(root, ASSETS_PIN)

  if (!fs.existsSync(file)) {
    throw new CommandError(`${ASSETS_PIN} is missing. Run chassis-docs sync-assets to write it.`)
  }

  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/** The start of the name of a web archive of the repository. */
function archivePrefix(repository) {
  return `${repository.split('/')[1]}-web-`
}

// Downloads are kept outside the repository, by repository and name, as the name holds the
// version. Keyed by the version alone, a cache served the archive of another repository.
function defaultCacheDir() {
  return path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'chassis-docs')
}

function sha256(data) {
  return `sha256:${createHash('sha256').update(data).digest('hex')}`
}

async function download(url, fetcher, options) {
  const response = await fetcher(url, options).catch((error) => {
    throw new CommandError(`${url}: ${error.message}`, { cause: error })
  })

  if (!response.ok) {
    throw new CommandError(`${url}: HTTP ${response.status}`)
  }

  return response
}

// The archive from the cache, or downloaded into it. A file of the cache that does not match
// the pin is replaced. A download that does not match fails, and stays out of the cache.
async function fetchArchive({ repository, version, name, digest, cacheDir, fetcher }) {
  const cached = path.join(cacheDir, 'assets', repository.replace('/', '-'), name)

  if (fs.existsSync(cached)) {
    const data = fs.readFileSync(cached)

    if (sha256(data) === digest) return data

    fs.rmSync(cached)
  }

  log(`Downloading ${name} from ${repository}`)

  const url = `https://github.com/${repository}/releases/download/v${version}/${name}`
  const response = await download(url, fetcher)
  const data = Buffer.from(await response.arrayBuffer())
  const actual = sha256(data)

  if (actual !== digest) {
    throw new CommandError(`${name}: the SHA-256 is ${actual}, and ${ASSETS_PIN} has ${digest}.`)
  }

  fs.mkdirSync(path.dirname(cached), { recursive: true })
  fs.writeFileSync(cached, data)

  return data
}

// Removes a folder. macOS may write a file into it while it is removed (Finder, Spotlight),
// and the removal of the folder then finds it not empty: it is tried again.
function removeDir(dir) {
  fs.rmSync(dir, { force: true, recursive: true, maxRetries: 10, retryDelay: 100 })
}

// Puts the folder `work` in the place of `output`.
function replaceDir(work, output) {
  removeDir(output)
  fs.renameSync(work, output)
}

// Writes the whole archive into a folder of its own, then puts that in the place of `output`.
function unpack(data, output) {
  const work = `${output}.tmp`
  const files = unzipSync(data, { filter: ({ name }) => !name.endsWith('/') })

  removeDir(work)
  fs.mkdirSync(work, { recursive: true })

  for (const [name, content] of Object.entries(files)) {
    const file = path.join(work, name)

    if (!file.startsWith(work + path.sep)) {
      throw new CommandError(`The archive has a file outside its folder: ${name}`)
    }

    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }

  replaceDir(work, output)
}

// The checkout that the variable names, and where it is set: the environment of the command,
// then `.env.local`, then `.env` of the root. A developer keeps the path of their own checkout
// in `.env.local`, so that every run takes it. An empty value in the environment turns a file
// off for one command.
function checkoutOf(root) {
  if (process.env[CHECKOUT_VARIABLE] !== undefined) {
    return { checkout: process.env[CHECKOUT_VARIABLE], from: 'the environment' }
  }

  for (const name of CHECKOUT_FILES) {
    const file = path.join(root, name)

    if (!fs.existsSync(file)) continue

    const value = parseEnv(fs.readFileSync(file, 'utf8'))[CHECKOUT_VARIABLE]

    if (value !== undefined) return { checkout: value, from: name }
  }

  return {}
}

// A build of the assets from a checkout, for work on the assets and a site at once. A path
// that is not absolute is from the root.
function copyCheckout({ checkout, from }, root, selection, output, stamp) {
  const source = path.resolve(root, checkout, assetsOutput(selection))

  if (!fs.existsSync(source)) {
    throw new CommandError(
      `${CHECKOUT_VARIABLE} of ${from} is ${checkout}, which has no ${assetsOutput(selection)}. Build it there first.`
    )
  }

  // The copy is whole before it takes the place of the old one, as an archive is.
  const work = `${output}.tmp`

  removeDir(work)
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.cpSync(source, work, { recursive: true })
  replaceDir(work, output)
  // So that the next run without the variable takes the release again.
  fs.rmSync(stamp, { force: true })
  log(
    `Copied ${source} to ${path.join(ASSETS_PATH, assetsOutput(selection))} (${CHECKOUT_VARIABLE} of ${from})`,
    'success'
  )
}

/**
 * Fills `vendor/assets/dist/web/<app>/<brand>` with the archive of the release that
 * `vendor/assets.json` pins. It does nothing when the folder already holds that archive.
 * With `CHASSIS_ASSETS_CHECKOUT`, in the environment or in `.env.local` of the root, it copies
 * the build of that checkout instead, on every run.
 * @param {{ root?: string, cacheDir?: string, fetcher?: typeof fetch, run?: typeof defaultRun }} [options]
 */
export async function vendorAssets({
  run = defaultRun,
  root = repositoryRoot(run),
  cacheDir = defaultCacheDir(),
  fetcher = fetch
} = {}) {
  const selection = selectionOf(root)
  const output = path.join(root, ASSETS_PATH, assetsOutput(selection))
  // Beside the folder and not in it: a site copies the whole folder to its static files.
  const stamp = `${output}.sha256`
  const local = checkoutOf(root)

  if (local.checkout) {
    copyCheckout(local, root, selection, output, stamp)
    return
  }

  const { repository = DEFAULT_REPOSITORY, version, archives = {} } = readPin(root)
  const prefix = archivePrefix(repository)
  const name = `${prefix}${selection.app}-${selection.brand}-${version}.zip`
  const digest = archives[name]

  if (!digest) {
    const known = Object.keys(archives)
      .map((archive) => archive.slice(prefix.length, -`-${version}.zip`.length))
      .join(', ')

    throw new CommandError(
      `${ASSETS_PIN} has no archive for the app '${selection.app}' and the brand '${selection.brand}' at ${version}. It has: ${known || 'none'}. These are <app>-<brand>.`
    )
  }

  if (fs.existsSync(output) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === digest) {
    log(`${path.join(ASSETS_PATH, assetsOutput(selection))} is at ${version}.`, 'success')
    return
  }

  const data = await fetchArchive({ repository, version, name, digest, cacheDir, fetcher })

  fs.mkdirSync(path.dirname(output), { recursive: true })
  unpack(data, output)
  fs.writeFileSync(stamp, digest)
  log(`Unpacked ${name} to ${path.join(ASSETS_PATH, assetsOutput(selection))}`, 'success')
}

/**
 * Moves `vendor/assets.json` to a release, the latest without `version`, with the digest of
 * every web archive of the release, and unpacks the archive of the build.
 * @param {{ root?: string, version?: string, repository?: string, cacheDir?: string, fetcher?: typeof fetch, run?: typeof defaultRun }} [options]
 */
export async function syncAssets({
  run = defaultRun,
  root = repositoryRoot(run),
  version,
  repository,
  cacheDir = defaultCacheDir(),
  fetcher = fetch
} = {}) {
  const file = path.join(root, ASSETS_PIN)
  const pin = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
  const source = repository ?? pin.repository ?? DEFAULT_REPOSITORY
  const release = version ? `tags/v${version}` : 'latest'
  // A token raises the limit of the GitHub API, 60 requests an hour without one
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
  const response = await download(
    `https://api.github.com/repos/${source}/releases/${release}`,
    fetcher,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    }
  )
  const { tag_name: tag, assets } = await response.json()
  const moved = tag.replace(/^v/, '')
  const prefix = archivePrefix(source)
  const web = assets.filter(({ name }) => name.startsWith(prefix) && name.endsWith('.zip'))

  if (web.length === 0) {
    throw new CommandError(`${source} ${tag} has no web archive.`)
  }

  const archives = {}

  for (const { name, digest } of web.toSorted((a, b) => a.name.localeCompare(b.name))) {
    if (!digest) {
      throw new CommandError(`GitHub reports no digest for ${name} of ${source} ${tag}.`)
    }

    archives[name] = digest
  }

  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(
    file,
    `${JSON.stringify(
      {
        repository: source,
        version: moved,
        app: pin.app ?? DEFAULT_APP,
        brand: pin.brand ?? DEFAULT_BRAND,
        archives
      },
      null,
      2
    )}\n`
  )

  await vendorAssets({ run, root, cacheDir, fetcher })

  if (moved === pin.version) {
    log(`${ASSETS_PIN} is already at ${moved}.`, 'success')
  } else {
    log(`${ASSETS_PIN} is at ${moved}. Check the site, then commit it.`)
  }
}
