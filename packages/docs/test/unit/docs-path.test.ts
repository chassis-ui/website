import { describe, expect, test } from 'vitest'
import { joinDocsPath } from '../../src/libs/docs-path'

describe('joinDocsPath', () => {
  test('joins the docs path and the page path with one slash', () => {
    expect(joinDocsPath('/css/docs', '/components/button/')).toBe('/css/docs/components/button/')
    expect(joinDocsPath('/css/docs/', 'components/button/')).toBe('/css/docs/components/button/')
  })

  test('returns the docs path for an empty page path', () => {
    expect(joinDocsPath('/css/docs', '')).toBe('/css/docs')
    expect(joinDocsPath('/css/docs', '/')).toBe('/css/docs')
  })

  test('keeps a hash', () => {
    expect(joinDocsPath('/docs', '/layout/grid#columns')).toBe('/docs/layout/grid#columns')
  })

  test('uses forward slashes on every platform', () => {
    expect(joinDocsPath('/docs', 'a/b')).not.toContain('\\')
  })
})
