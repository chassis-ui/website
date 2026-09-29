import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { resolveSiteFileUrl, resolveSourceFsPath, resolveSourceUrl } from '../../src/libs/source'

const config = {
  repo: 'https://github.com/chassis-ui/css',
  currentVersion: '0.5.2',
  siteBranch: 'main',
  sitePath: 'packages/site',
  sourcePath: 'packages/css'
}

describe('resolveSourceFsPath', () => {
  test('resolves a file from the source directory', () => {
    expect(resolveSourceFsPath('/repo/packages/css', 'scss/_config.scss')).toBe(
      path.resolve('/repo/packages/css/scss/_config.scss')
    )
  })

  test('returns the source directory without a file', () => {
    expect(resolveSourceFsPath('/repo/packages/css')).toBe(path.resolve('/repo/packages/css'))
  })
})

describe('resolveSourceUrl', () => {
  test('links to the file at the tag of the current version', () => {
    expect(resolveSourceUrl(config, 'scss/_config.scss')).toBe(
      'https://github.com/chassis-ui/css/blob/v0.5.2/packages/css/scss/_config.scss'
    )
  })

  test('leaves out sourcePath when it is not set', () => {
    expect(resolveSourceUrl({ ...config, sourcePath: undefined }, 'scss/_config.scss')).toBe(
      'https://github.com/chassis-ui/css/blob/v0.5.2/scss/_config.scss'
    )
  })

  test('resolves .. in the file path', () => {
    expect(resolveSourceUrl(config, '../site/astro.config.ts')).toBe(
      'https://github.com/chassis-ui/css/blob/v0.5.2/packages/site/astro.config.ts'
    )
  })
})

describe('resolveSiteFileUrl', () => {
  test('links to the file on the site branch', () => {
    expect(resolveSiteFileUrl(config, 'content/docs/intro.mdx')).toBe(
      'https://github.com/chassis-ui/css/blob/main/packages/site/content/docs/intro.mdx'
    )
  })

  test('leaves out sitePath when it is not set', () => {
    expect(resolveSiteFileUrl({ ...config, sitePath: undefined }, 'content/docs/intro.mdx')).toBe(
      'https://github.com/chassis-ui/css/blob/main/content/docs/intro.mdx'
    )
  })

  test('turns backslashes into slashes', () => {
    expect(resolveSiteFileUrl(config, 'content\\docs\\intro.mdx')).toBe(
      'https://github.com/chassis-ui/css/blob/main/packages/site/content/docs/intro.mdx'
    )
  })
})
