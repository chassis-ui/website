#!/usr/bin/env node

/**
 * Builds the site of each sibling repository with the version of @chassis-ui/docs in this
 * repository, before that version is published. The package is packed, and each sibling
 * whose range accepts the version installs the tarball in its place and builds its site.
 * A sibling whose range does not accept the version would not get it, and is skipped.
 *
 * Each sibling is a shallow clone of its default branch in a temporary directory. Nothing
 * is pushed. Instead of each sibling pulling and building chassis-assets, the docs build
 * of this repository's `vendor/assets` is copied into each: run `pnpm vendor` first.
 *
 * Usage: node build/canary.js [sibling ...] [--all] [--keep]
 *
 *   sibling  Build only these, e.g. `css react`
 *   --all    Build every sibling, whether its range accepts the version or not
 *   --keep   Keep the temporary directory
 *
 * Exits with 1 when a sibling that accepts the version fails to build.
 */

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import semver from 'semver'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = path.join(repositoryRoot, 'packages/docs')
const assetsBuild = path.join(repositoryRoot, 'vendor/assets/dist/web/docs/chassis')
const assetsTarget = 'vendor/assets/dist/web/docs/chassis'

// How each sibling builds its site, without moving its submodule and without Pagefind.
// `site` is the folder whose package.json names @chassis-ui/docs. Keep this in step with
// the `build` scripts of the siblings.
const siblings = {
  tokens: {
    repository: 'chassis-ui/tokens',
    site: 'packages/site',
    build: [['tokens:site'], ['--filter', 'chassis-tokens-site', 'build']]
  },
  css: {
    repository: 'chassis-ui/css',
    site: 'packages/site',
    build: [['dist'], ['astro:build']]
  },
  assets: {
    repository: 'chassis-ui/assets',
    site: 'packages/site',
    // The docs build is chassis-assets' own output, copied in place of `pnpm assets:site`,
    // which needs the Git LFS files of the repository.
    assetsTarget: 'dist/web/docs/chassis',
    build: [['astro:build']]
  },
  icons: {
    repository: 'chassis-ui/icons',
    site: '.',
    build: [['icons'], ['site:pages'], ['astro:build']]
  },
  figma: {
    repository: 'chassis-ui/figma',
    site: '.',
    build: [['astro:build']]
  },
  react: {
    repository: 'chassis-ui/react',
    site: 'packages/site',
    build: [['react:build'], ['react:generate'], ['--filter', 'chassis-react-site', 'build']]
  }
}

function run(command, args, cwd, env = {}) {
  console.log(`\n$ ${[command, ...args].join(' ')}  (in ${cwd})`)
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: process.platform === 'win32'
  })
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

function pack(tempDir) {
  run('pnpm', ['pack', '--pack-destination', tempDir], packageDir)

  const tarball = fs.readdirSync(tempDir).find((file) => file.endsWith('.tgz'))

  assert.ok(tarball, 'pnpm pack wrote no tarball')

  return path.join(tempDir, tarball)
}

function rangeOf(siteDir) {
  const manifest = readJson(path.join(siteDir, 'package.json'))

  return (
    manifest.dependencies?.['@chassis-ui/docs'] ?? manifest.devDependencies?.['@chassis-ui/docs']
  )
}

// Makes every package of the repository resolve @chassis-ui/docs to the tarball. pnpm reads
// `overrides` from pnpm-workspace.yaml when it has them, and from package.json otherwise.
function overrideDocs(repositoryDir, tarball) {
  const workspaceFile = path.join(repositoryDir, 'pnpm-workspace.yaml')
  const line = `  '@chassis-ui/docs': 'file:${tarball}'`

  if (fs.existsSync(workspaceFile)) {
    const text = fs.readFileSync(workspaceFile, 'utf8')

    if (/^overrides:\s*$/m.test(text)) {
      fs.writeFileSync(workspaceFile, text.replace(/^overrides:\s*$/m, `overrides:\n${line}`))
      return
    }
  }

  const manifestFile = path.join(repositoryDir, 'package.json')
  const manifest = readJson(manifestFile)

  manifest.pnpm = { ...manifest.pnpm }
  manifest.pnpm.overrides = { ...manifest.pnpm.overrides, '@chassis-ui/docs': `file:${tarball}` }
  writeJson(manifestFile, manifest)
}

// The version that the site resolves, to be sure that it builds the tarball.
function installedVersion(siteDir) {
  const script = `console.log(JSON.parse(require('node:fs').readFileSync(require.resolve('@chassis-ui/docs/package.json'), 'utf8')).version)`

  return execFileSync(process.execPath, ['-e', script], { cwd: siteDir, encoding: 'utf8' }).trim()
}

function canary(name, sibling, tarball, version, tempDir, all) {
  const repositoryDir = path.join(tempDir, name)
  const siteDir = path.join(repositoryDir, sibling.site)

  // Without LFS files and submodules: the canary needs neither.
  run(
    'git',
    [
      'clone',
      '--quiet',
      '--depth',
      '1',
      `https://github.com/${sibling.repository}.git`,
      repositoryDir
    ],
    tempDir,
    { GIT_LFS_SKIP_SMUDGE: '1' }
  )

  const range = rangeOf(siteDir)

  if (!range) {
    return { name, range: 'none', result: 'skipped', note: 'does not depend on the package' }
  }

  const accepts = semver.satisfies(version, range)

  if (!accepts && !all) {
    return { name, range, result: 'skipped', note: `the range does not accept ${version}` }
  }

  const target = path.join(repositoryDir, sibling.assetsTarget ?? assetsTarget)

  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.cpSync(assetsBuild, target, { recursive: true })

  overrideDocs(repositoryDir, tarball)

  try {
    run('pnpm', ['install', '--no-frozen-lockfile'], repositoryDir)

    const installed = installedVersion(siteDir)

    assert.equal(installed, version, `${name} resolves @chassis-ui/docs ${installed}`)

    for (const args of sibling.build) {
      run('pnpm', args, repositoryDir)
    }
  } catch (error) {
    return {
      name,
      range,
      accepts,
      result: 'failed',
      note: error.message.split('\n')[0]
    }
  }

  return { name, range, accepts, result: 'built', note: '' }
}

function report(results, version) {
  const rows = results.map(
    ({ name, range, result, note }) => `| ${name} | \`${range}\` | ${result} | ${note} |`
  )
  const table = [
    `### Canary of @chassis-ui/docs ${version}`,
    '',
    '| Sibling | Range | Result | Note |',
    '| ------- | ----- | ------ | ---- |',
    ...rows,
    ''
  ].join('\n')

  console.log(`\n${table}`)

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${table}\n`)
  }
}

const args = process.argv.slice(2)
const all = args.includes('--all')
const keep = args.includes('--keep')
const names = args.filter((arg) => !arg.startsWith('--'))
const selected = names.length > 0 ? names : Object.keys(siblings)

for (const name of selected) {
  assert.ok(
    Object.hasOwn(siblings, name),
    `Unknown sibling '${name}'. Expected: ${Object.keys(siblings).join(', ')}`
  )
}

assert.ok(
  fs.existsSync(assetsBuild),
  `The docs build of chassis-assets is missing from ${assetsBuild}. Run pnpm vendor first.`
)

const { version } = readJson(path.join(packageDir, 'package.json'))
const tempDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'chassis-docs-canary-')))
const results = []

try {
  const tarball = pack(tempDir)

  for (const name of selected) {
    results.push(canary(name, siblings[name], tarball, version, tempDir, all))
  }
} finally {
  if (keep) {
    console.log(`\nKept ${tempDir}`)
  } else {
    fs.rmSync(tempDir, { force: true, recursive: true })
  }
}

report(results, version)

// A sibling that was built only because of --all does not fail the run.
process.exitCode = results.some((result) => result.result === 'failed' && result.accepts) ? 1 : 0
