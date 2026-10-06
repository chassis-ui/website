import fs from 'node:fs'
import { load } from 'js-yaml'
import { describe, expect, test } from 'vitest'

interface Importer {
  dependencies?: Record<string, unknown>
  devDependencies?: Record<string, unknown>
}

interface Lockfile {
  importers: Record<string, Importer>
  packages: Record<string, unknown>
}

// The workspace that the package is developed in, not the package: the website builds with
// the package from the workspace, and `chassis-docs` loads its peers from the package.
const root = new URL('../../../../', import.meta.url)
const manifest = JSON.parse(fs.readFileSync(new URL('packages/docs/package.json', root), 'utf8'))
const lockfile = load(fs.readFileSync(new URL('pnpm-lock.yaml', root), 'utf8')) as Lockfile
const peers = Object.keys(manifest.peerDependencies)

/** The versions of a package in the lockfile. Its keys are `name@version`. */
function versions(name: string) {
  return Object.keys(lockfile.packages)
    .filter((key) => key.slice(0, key.lastIndexOf('@')) === name)
    .map((key) => key.slice(key.lastIndexOf('@') + 1))
}

describe('peer dependencies in the workspace', () => {
  // pnpm keeps the version that the lockfile has for a peer while the range accepts it. An
  // update of the website alone leaves the package on the old version, and CI passes without
  // running the new one: `chassis-docs vnu` validated with vnu-jar 26.9.27 next to 26.10.2.
  // To fix a failure, give both the same range and run `pnpm install`, or `pnpm dedupe`.
  test('the lockfile has one version of each', () => {
    const others = peers
      .map((name) => [name, versions(name)] as const)
      .filter(([, found]) => found.length !== 1)

    expect(Object.fromEntries(others)).toEqual({})
  })

  // Dependabot updates the ranges of dependencies and devDependencies, in every package.json
  // that has one, and no range of peerDependencies. A peer that is a devDependency too moves
  // with the website.
  test('each one that another package installs is a devDependency', () => {
    const installed = (importer: Importer) => ({
      ...importer.dependencies,
      ...importer.devDependencies
    })
    const shared = peers.filter((name) =>
      Object.entries(lockfile.importers).some(
        ([path, importer]) => path !== 'packages/docs' && name in installed(importer)
      )
    )

    expect(shared.filter((name) => !(name in manifest.devDependencies))).toEqual([])
  })
})
