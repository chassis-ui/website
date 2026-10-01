import { describe, expect, test } from 'vitest'
import { replaceIconsInHtml } from '../../src/libs/icon'

describe('replaceIconsInHtml', () => {
  test('renders an SVG sprite icon with the defaults', () => {
    expect(replaceIconsInHtml('<p><Icon name="check" /></p>')).toBe(
      '<p><svg class="icon" width="24" height="24" aria-hidden="true"><use href="/static/icons/chassis-icons.svg#check"></use></svg></p>'
    )
  })

  test('uses the size, the class and the sprite', () => {
    expect(
      replaceIconsInHtml('<Icon name="x" size="{16}" class="me-xs" sprite="/icons.svg" />')
    ).toBe(
      '<svg class="icon me-xs" width="16" height="16" aria-hidden="true"><use href="/icons.svg#x"></use></svg>'
    )
  })

  test('labels an icon with a title, and escapes it', () => {
    expect(replaceIconsInHtml('<Icon name="x" title="Close &quot;it&quot;" />')).toBe(
      '<svg class="icon" width="24" height="24"><title>Close &quot;it&quot;</title><use href="/static/icons/chassis-icons.svg#x"></use></svg>'
    )
  })

  test('loads the sprite from the static path of the site', () => {
    expect(replaceIconsInHtml('<Icon name="check" />', '/css/static')).toContain(
      '<use href="/css/static/icons/chassis-icons.svg#check">'
    )
    expect(replaceIconsInHtml('<Icon name="x" sprite="/icons.svg" />', '/css/static')).toContain(
      '<use href="/icons.svg#x">'
    )
  })

  test('renders a font icon', () => {
    expect(replaceIconsInHtml('<Icon name="check" font />')).toBe(
      '<span class="icon cx-check" aria-hidden="true"></span>'
    )
  })

  test('treats font={false} as an SVG icon', () => {
    expect(replaceIconsInHtml('<Icon name="check" font="{false}" />')).toContain('<svg')
  })

  test('fails without a name', () => {
    expect(() => replaceIconsInHtml('<Icon class="x" />')).toThrow('"name"')
  })

  test('leaves other markup alone', () => {
    expect(replaceIconsInHtml('<span class="icon"></span>')).toBe('<span class="icon"></span>')
  })
})
