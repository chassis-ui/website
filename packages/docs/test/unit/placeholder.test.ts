import { describe, expect, test } from 'vitest'
import { getPlaceholder, replacePlaceholdersInHtml } from '../../src/libs/placeholder'

describe('getPlaceholder', () => {
  test('describes an SVG placeholder with a label by default', () => {
    const placeholder = getPlaceholder({})

    expect(placeholder.type).toBe('svg')
    expect(placeholder.props).toMatchObject({
      role: 'img',
      class: expect.stringContaining('cxd-placeholder-image')
    })
    expect(placeholder.props['aria-label']).toBeTruthy()
  })

  test('hides a placeholder without text and title from assistive technology', () => {
    const placeholder = getPlaceholder({ text: false, title: false })

    expect(placeholder.props).toMatchObject({
      'aria-hidden': 'true',
      role: undefined,
      'aria-label': undefined
    })
  })

  test('joins the title and the text in the label', () => {
    expect(getPlaceholder({ title: 'Card', text: 'Image cap' }).props['aria-label']).toBe(
      'Card: Image cap'
    )
  })

  test('describes an image placeholder with an alt text and a source', () => {
    const placeholder = getPlaceholder({ markup: 'img', title: 'Card', text: false })

    expect(placeholder.type).toBe('img')
    expect(placeholder.props).toMatchObject({ alt: 'Card' })
    expect(String((placeholder.props as { src?: string }).src)).toMatch(/^data:image\/svg\+xml/)
  })
})

describe('replacePlaceholdersInHtml', () => {
  test('replaces a <Placeholder /> with an SVG', () => {
    const html = replacePlaceholdersInHtml(
      '<div><Placeholder width="100" height="50" text="Hi" /></div>'
    )

    expect(html).toMatch(/^<div><svg /)
    expect(html).toContain('width="100"')
    expect(html).toContain('Hi')
    expect(html).not.toContain('<Placeholder')
  })

  test('leaves markup without placeholders alone', () => {
    expect(replacePlaceholdersInHtml('<p>Text</p>')).toBe('<p>Text</p>')
  })
})
