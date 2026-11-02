import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  getBrandTokensLoadPath,
  getChassisAssetsFsPath,
  getChassisBrand,
  getChassisCSSFsPath,
  getChassisIconsFsPath,
  getChassisTokensFsPath,
  getInstalledPackageFsPath,
  getNodeModulesFsPaths,
  getPackageRoot,
  resolvePackageFilePath
} from '../../src/libs/paths'
import { createTempDir } from '../helpers/temp'

afterEach(() => {
  vi.unstubAllEnvs()
})

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
  test('finds the docs build of @chassis-ui/website-tokens', () => {
    const { site } = repository({
      'packages/site/node_modules/@chassis-ui/website-tokens/dist/web/docs/chassis/': ''
    })

    expect(getChassisTokensFsPath({ root: site })).toBe(
      path.join(site, 'node_modules/@chassis-ui/website-tokens/dist/web/docs/chassis')
    )
  })

  test('does not fall back to @chassis-ui/tokens, the builder', () => {
    const { site } = repository({
      'packages/site/node_modules/@chassis-ui/tokens/dist/web/docs/chassis/': ''
    })

    expect(() => getChassisTokensFsPath({ root: site })).toThrow(
      "Could not find the package '@chassis-ui/website-tokens'"
    )
  })

  test('uses dir, from the root', () => {
    const { site } = repository({
      'packages/site/node_modules/@chassis-ui/tokens/dist/web/docs/chassis/': ''
    })

    expect(getChassisTokensFsPath({ root: site, dir: 'node_modules/@chassis-ui/tokens' })).toBe(
      path.join(site, 'node_modules/@chassis-ui/tokens/dist/web/docs/chassis')
    )
  })
})

describe('getChassisBrand', () => {
  test('is the default brand without a pin', () => {
    const { site } = repository({})

    expect(getChassisBrand({ root: site })).toEqual({
      brand: 'chassis',
      app: 'docs',
      isDefault: true
    })
  })

  test('reads the pin at the root of the repository', () => {
    const { site } = repository({
      'vendor/assets.json': JSON.stringify({ brand: 'sinefil', app: 'demo' })
    })

    expect(getChassisBrand({ root: site })).toEqual({
      brand: 'sinefil',
      app: 'demo',
      isDefault: false
    })
  })

  test('takes the variables over the pin', () => {
    const { site } = repository({ 'vendor/assets.json': JSON.stringify({ brand: 'sinefil' }) })

    vi.stubEnv('CHASSIS_BRAND', 'acme')
    vi.stubEnv('CHASSIS_APP', 'demo')

    expect(getChassisBrand({ root: site })).toMatchObject({ brand: 'acme', app: 'demo' })
  })

  test('rejects a brand that is no name', () => {
    vi.stubEnv('CHASSIS_BRAND', '../up')

    expect(() => getChassisBrand()).toThrow('Expected letters, digits and hyphens')
  })
})

describe('getBrandTokensLoadPath', () => {
  test('is nothing for the default brand', () => {
    const { site } = repository({})

    expect(getBrandTokensLoadPath(site)).toBeUndefined()
  })

  test('forwards the tokens of the brand', () => {
    const { site } = repository({
      'packages/site/node_modules/@chassis-ui/website-tokens/dist/web/docs/sinefil/main.scss': ''
    })

    vi.stubEnv('CHASSIS_BRAND', 'sinefil')

    const directory = getBrandTokensLoadPath(site) as string
    const [, target] = /"(.+)"/.exec(
      fs.readFileSync(path.join(directory, '_chassis-tokens.scss'), 'utf8')
    ) as RegExpExecArray

    expect(fs.existsSync(`${path.resolve(directory, target)}.scss`)).toBe(true)
  })

  test('fails on a brand that the tokens do not have', () => {
    const { site } = repository({
      'packages/site/node_modules/@chassis-ui/website-tokens/dist/web/docs/chassis/': ''
    })

    vi.stubEnv('CHASSIS_BRAND', 'acme')

    expect(() => getBrandTokensLoadPath(site)).toThrow('dist/web/docs/acme')
  })
})

describe('getChassisAssetsFsPath', () => {
  test('finds the folder of the brand', () => {
    const { root, site } = repository({
      'vendor/assets/dist/web/docs/chassis/': '',
      'vendor/assets/dist/web/docs/sinefil/': ''
    })

    vi.stubEnv('CHASSIS_BRAND', 'sinefil')

    expect(getChassisAssetsFsPath({ root: site })).toBe(
      path.join(root, 'vendor/assets/dist/web/docs/sinefil')
    )
  })

  test('finds the assets at the root of the repository', () => {
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
