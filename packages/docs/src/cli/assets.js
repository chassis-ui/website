import fs from 'node:fs'
import path from 'node:path'
import { CommandError, log, run as defaultRun } from './shared.js'

/** Where every Chassis site has chassis-assets as a submodule. */
export const ASSETS_PATH = 'vendor/assets'

/** The docs build of chassis-assets, inside the submodule. `getChassisAssetsFsPath()` reads it. */
export const ASSETS_OUTPUT = 'dist/web/docs/chassis'

/** The branch of chassis-assets that the docs sites follow. */
export const DEFAULT_BRANCH = 'app/docs'

/** The package of the build inside the submodule, which names the packages its options load. */
export const ASSETS_PACKAGE = './packages/assets'

/**
 * The root of the repository that contains the working directory, so that the commands
 * work from a site's folder too.
 * @param {typeof defaultRun} run
 */
function repositoryRoot(run) {
  return run('git', ['rev-parse', '--show-toplevel'], { quiet: true }).trim()
}

/**
 * Checks out `vendor/assets` at the commit that the repository pins, and builds it.
 * @param {{ root?: string, subset?: string[], split?: boolean, run?: typeof defaultRun }} [options]
 */
export function buildAssets({
  run = defaultRun,
  root = repositoryRoot(run),
  subset = [],
  split
} = {}) {
  const fonts = fontOptions(subset, split)

  log(`Building ${ASSETS_PATH} at the pinned commit`)
  run('git', ['submodule', 'update', '--init', ASSETS_PATH], { cwd: root })
  buildCheckout(root, run, fonts)
}

/**
 * Moves `vendor/assets` to the latest commit of `branch`, and builds it. The repository
 * then has a changed submodule pointer to commit.
 * @param {{ root?: string, branch?: string, subset?: string[], split?: boolean, run?: typeof defaultRun }} [options]
 */
export function syncAssets({
  run = defaultRun,
  root = repositoryRoot(run),
  branch = DEFAULT_BRANCH,
  subset = [],
  split
} = {}) {
  const fonts = fontOptions(subset, split)
  const dir = path.join(root, ASSETS_PATH)
  const git = (args, quiet = true) => run('git', args, { cwd: dir, quiet })

  log(`Moving ${ASSETS_PATH} to the latest ${branch}`)

  if (!fs.existsSync(path.join(dir, '.git'))) {
    run('git', ['submodule', 'update', '--init', ASSETS_PATH], { cwd: root })
  }

  if (git(['rev-parse', '--abbrev-ref', 'HEAD']).trim() !== branch) {
    if (git(['status', '--porcelain']).trim()) {
      throw new CommandError(
        `${ASSETS_PATH} has uncommitted changes. Commit or discard them, then run the command again.`
      )
    }

    // A fresh checkout, as on CI, has the submodule at a detached HEAD, fetched for the
    // pinned commit only: there is neither a local branch nor a remote-tracking one.
    git(['fetch', 'origin', branch])

    if (hasLocalBranch(git, branch)) {
      git(['checkout', branch])
    } else {
      git(['checkout', '-b', branch, 'FETCH_HEAD'])
    }
  }

  git(['pull', '--ff-only', 'origin', branch])
  buildCheckout(root, run, fonts)

  const commit = git(['rev-parse', '--short', 'HEAD']).trim()
  const moved = run('git', ['status', '--porcelain', '--', ASSETS_PATH], {
    cwd: root,
    quiet: true
  }).trim()

  if (moved) {
    log(`${ASSETS_PATH} is at ${commit}. Check the site, then commit ${ASSETS_PATH} on its own.`)
  } else {
    log(`${ASSETS_PATH} is already at the latest ${branch}, ${commit}.`, 'success')
  }
}

function hasLocalBranch(git, branch) {
  try {
    git(['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`])
    return true
  } catch {
    return false
  }
}

/**
 * The options of the build for the fonts: the ranges of `--subset`, then `--split` or
 * `--no-split` when the site decides it, and nothing when the fonts stay whole. Without
 * either of the two, the build takes `split` of `chassis.subset` of chassis-assets.
 * @param {string[]} subset
 * @param {boolean} [split]
 * @returns {string[]}
 */
function fontOptions(subset, split) {
  if (subset.length === 0) {
    if (split !== undefined) {
      throw new CommandError('--split and --no-split need --subset: a font is split by its ranges.')
    }

    return []
  }

  const decided = split === undefined ? [] : [split ? '--split' : '--no-split']

  return ['--subset', ...subset, ...decided]
}

function buildCheckout(root, run, fonts = []) {
  const dir = path.join(root, ASSETS_PATH)

  // The images are stored with Git LFS. Without it they are pointer files.
  run('git', ['lfs', 'install', '--local'], { cwd: dir, quiet: true })
  run('git', ['lfs', 'pull'], { cwd: dir })

  if (fonts.length > 0) {
    // The subsetter is a package that the build loads, so the package of the build is
    // installed, without the tools of its tests. Where an install without the workspace
    // ran before, pnpm removes its modules first, and would ask.
    run(
      'pnpm',
      ['install', '--filter', ASSETS_PACKAGE, '--prod', '--config.confirmModulesPurge=false'],
      { cwd: dir }
    )
    run('pnpm', ['assets:site', ...fonts], { cwd: dir })
  } else {
    run('pnpm', ['install', '--ignore-workspace'], { cwd: dir })
    run('pnpm', ['assets:site'], { cwd: dir })
  }

  const output = path.join(dir, ASSETS_OUTPUT)

  if (!fs.existsSync(output)) {
    throw new CommandError(`The build of ${ASSETS_PATH} wrote nothing to ${ASSETS_OUTPUT}.`)
  }

  log(`Built ${path.join(ASSETS_PATH, ASSETS_OUTPUT)}`, 'success')
}
