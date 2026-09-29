import { describe, expect, test } from 'vitest'
import {
  docsSchema,
  zLanguageCode,
  zPrefixedVersionSemver,
  zVersionMajorMinor,
  zVersionSemver
} from '../../src/libs/schema'

describe('version validators', () => {
  test.each(['1.0.0', '0.5.0-0', '2.1.3-beta.1+build.5'])('accepts the version %s', (version) => {
    expect(zVersionSemver.safeParse(version).success).toBe(true)
  })

  test.each(['1.0', 'v1.0.0', '01.0.0', '1.0.0 '])('rejects the version %s', (version) => {
    expect(zVersionSemver.safeParse(version).success).toBe(false)
  })

  test('accepts a v prefix only in the prefixed validator', () => {
    expect(zPrefixedVersionSemver.safeParse('v1.2.3').success).toBe(true)
    expect(zPrefixedVersionSemver.safeParse('1.2.3').success).toBe(false)
  })

  test('accepts major.minor', () => {
    expect(zVersionMajorMinor.safeParse('0.5').success).toBe(true)
    expect(zVersionMajorMinor.safeParse('0.5.1').success).toBe(false)
  })

  test('accepts language codes with and without a region', () => {
    expect(zLanguageCode.safeParse('en').success).toBe(true)
    expect(zLanguageCode.safeParse('pt-BR').success).toBe(true)
    expect(zLanguageCode.safeParse('english').success).toBe(false)
  })
})

describe('docsSchema', () => {
  test('makes every key optional', () => {
    expect(docsSchema.parse({})).toEqual({})
  })

  test('accepts the frontmatter of a docs page', () => {
    const frontmatter = {
      title: 'Buttons',
      description: 'Buttons.',
      added: { version: '0.5', showBadge: false },
      aliases: ['/buttons/'],
      extraJs: [{ src: '/static/js/demo.js', async: true }],
      toc: true
    }

    expect(docsSchema.parse(frontmatter)).toEqual(frontmatter)
  })

  test.each([
    [{ added: { version: '0.5', show_badge: true } }, 'showBadge'],
    [{ extra_js: [{ src: 'a.js' }] }, 'extraJs']
  ])('rejects a renamed key, and names the new one', (frontmatter, newKey) => {
    const result = docsSchema.safeParse(frontmatter)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain(`renamed to \`${newKey}\``)
  })
})
