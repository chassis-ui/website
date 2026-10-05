import { describe, expect, test } from 'vitest'
import { isHomePath, joinDocsPath, joinStaticPath } from '../../src/libs/docs-path'

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

describe('joinStaticPath', () => {
  test('joins the static path and the file with one slash', () => {
    expect(joinStaticPath('/static', 'css/chassis.css')).toBe('/static/css/chassis.css')
    expect(joinStaticPath('/css/static', '/icons/chassis-icons.svg')).toBe(
      '/css/static/icons/chassis-icons.svg'
    )
  })

  test('returns the static path for no file', () => {
    expect(joinStaticPath('/css/static')).toBe('/css/static')
  })
})

describe('isHomePath', () => {
  test('is the root for a site at the root of its domain', () => {
    expect(isHomePath('https://chassis-ui.com', '/')).toBe(true)
    expect(isHomePath('https://chassis-ui.com/', '/')).toBe(true)
    expect(isHomePath('https://chassis-ui.com', '/about/')).toBe(false)
  })

  test('is the path of the base URL for a site under a path', () => {
    expect(isHomePath('https://chassis-ui.com/css/', '/css/')).toBe(true)
    expect(isHomePath('https://chassis-ui.com/css', '/css/')).toBe(true)
    expect(isHomePath('https://chassis-ui.com/css/', '/css')).toBe(true)
  })

  test('is not the root or another page of a site under a path', () => {
    expect(isHomePath('https://chassis-ui.com/css', '/')).toBe(false)
    expect(isHomePath('https://chassis-ui.com/css', '/css/docs/')).toBe(false)
    expect(isHomePath('https://chassis-ui.com/css', '/css-grid/')).toBe(false)
  })
})
