import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  getChassisAssetsFsPath,
  getChassisCSSFsPath,
  getChassisIconsFsPath,
  getChassisTokensFsPath,
  getInstalledPackageFsPath,
  getNodeModulesFsPaths,
  getPackageRoot,
  resolvePackageFilePath
} from '../../src/libs/paths'
import { createTempDir } from '../helpers/temp'

describe('getPackageRoot', () => {
  test('returns the directory of the package', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(getPackageRoot(), 'package.json'), 'utf8')
    )

    expect(manifest.name).toBe('@chassis-ui/docs')
  })
})

describe('resolvePackageFilePath', () => {
  test.each([
    ['js/color-modes.js', 'src/js/color-modes.js'],
    ['shortcodes/Code.astro', 'src/components/shortcodes/Code.astro'],
    ['components/NavLink.astro', 'src/components/NavLink.astro'],
    ['layouts/BaseLayout.astro', 'src/layouts/BaseLayout.astro'],
    ['scss/main.scss', 'src/scss/main.scss']
  ])('maps the public path %s to a file that exists', (file, target) => {
    const resolved = resolvePackageFilePath(file)

    expect(resolved).toBe(path.join(getPackageRoot(), target))
    expect(fs.existsSync(resolved)).toBe(true)
  })

  test('rejects a path that is not public', () => {
    expect(() => resolvePackageFilePath('libs/config.ts')).toThrow('is not a public path')
  })
})

// A repository with a hoisted `node_modules` and a site in `packages/site`, as in pnpm
// workspaces.
function repository(files: Record<string, string>) {
  const root = createTempDir({ 'pnpm-workspace.yaml': '', 'packages/site/': '', ...files })

  return { root, site: path.join(root, 'packages/site') }
}

describe('getInstalledPackageFsPath', () => {
  test('prefers the package in the site', () => {
    const { root, site } = repository({
      'node_modules/@chassis-ui/css/package.json': '{}',
      'packages/site/node_modules/@chassis-ui/css/package.json': '{}'
    })

    expect(getInstalledPackageFsPath('@chassis-ui/css', site)).toBe(
      path.join(root, 'packages/site/node_modules/@chassis-ui/css')
    )
  })

  test('finds a package hoisted to the root of the repository', () => {
    const { root, site } = repository({ 'node_modules/@chassis-ui/css/package.json': '{}' })

    expect(getInstalledPackageFsPath('@chassis-ui/css', site)).toBe(
      path.join(root, 'node_modules/@chassis-ui/css')
    )
  })

  test('stops at the root of the repository, and lists where it looked', () => {
    const { root, site } = repository({})
    let message = ''

    try {
      getInstalledPackageFsPath('@chassis-ui/css', site)
    } catch (error) {
      message = (error as Error).message
    }

    const searched = message
      .split('\n')
      .filter((line) => line.startsWith('  - '))
      .map((line) => line.slice(4))

    expect(searched).toEqual([site, path.join(root, 'packages'), root])
  })
})

describe('getChassisTokensFsPath', () => {
  test.each(['dist/web/docs/chassis', 'dist/tokens/web/docs/chassis'])(
    'finds the docs build in %s',
    (folder) => {
      const { site } = repository({
        [`packages/site/node_modules/@chassis-ui/tokens/${folder}/`]: ''
      })

      expect(getChassisTokensFsPath({ root: site })).toBe(
        path.join(site, 'node_modules/@chassis-ui/tokens', folder)
      )
    }
  )
})

describe('getChassisAssetsFsPath', () => {
  test('finds the submodule at the root of the repository', () => {
    const { root, site } = repository({ 'vendor/assets/dist/web/docs/chassis/': '' })

    expect(getChassisAssetsFsPath({ root: site })).toBe(
      path.join(root, 'vendor/assets/dist/web/docs/chassis')
    )
  })

  test('finds the build of the assets repository itself', () => {
    const root = createTempDir({ '.git/': '', 'dist/web/docs/chassis/': '', 'site/': '' })

    expect(getChassisAssetsFsPath({ root: path.join(root, 'site') })).toBe(
      path.join(root, 'dist/web/docs/chassis')
    )
  })

  test('uses dir, from the root', () => {
    const { site } = repository({})

    expect(getChassisAssetsFsPath({ root: site, dir: '../assets' })).toBe(
      path.join(site, '../assets')
    )
  })
})

describe('getChassisCSSFsPath and getChassisIconsFsPath', () => {
  test('return the dist folder of the CSS package and the icons package', () => {
    const { root, site } = repository({
      'node_modules/@chassis-ui/css/package.json': '{}',
      'node_modules/@chassis-ui/icons/package.json': '{}'
    })

    expect(getChassisCSSFsPath({ root: site })).toBe(
      path.join(root, 'node_modules/@chassis-ui/css/dist')
    )
    expect(getChassisIconsFsPath({ root: site })).toBe(
      path.join(root, 'node_modules/@chassis-ui/icons')
    )
  })

  test('use dir, from the root', () => {
    const { site } = repository({})

    expect(getChassisCSSFsPath({ root: site, dir: '../css/dist' })).toBe(
      path.join(site, '../css/dist')
    )
  })
})

describe('getNodeModulesFsPaths', () => {
  test('lists the node_modules folders from the site up to the repository root', () => {
    const { root, site } = repository({
      'node_modules/': '',
      'packages/site/node_modules/': ''
    })

    expect(getNodeModulesFsPaths(site)).toEqual([
      path.join(site, 'node_modules'),
      path.join(root, 'node_modules')
    ])
  })
})
