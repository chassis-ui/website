import { describe, expect, test } from 'vitest'
import {
  capitalizeFirstLetter,
  getSequence,
  getSlug,
  processMarkdownToHtml,
  stripMarkdown,
  titleCase,
  trimLeadingAndTrailingSlashes
} from '../../src/libs/utils'

describe('capitalizeFirstLetter', () => {
  test('uppercases the first character only', () => {
    expect(capitalizeFirstLetter('primary color')).toBe('Primary color')
  })

  test('returns an empty string unchanged', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })
})

describe('getSequence', () => {
  test('includes both ends', () => {
    expect(getSequence(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  test('uses the step', () => {
    expect(getSequence(0, 10, 5)).toEqual([0, 5, 10])
  })

  test('is empty when the start is after the end', () => {
    expect(getSequence(3, 1)).toEqual([])
  })
})

describe('getSlug', () => {
  test('slugifies like GitHub', () => {
    expect(getSlug('Getting Started')).toBe('getting-started')
  })

  test('collapses repeated hyphens', () => {
    expect(getSlug('Colors & Themes')).toBe('colors-themes')
  })
})

describe('trimLeadingAndTrailingSlashes', () => {
  test('removes every leading and trailing slash', () => {
    expect(trimLeadingAndTrailingSlashes('//docs/button//')).toBe('docs/button')
  })

  test('keeps inner slashes', () => {
    expect(trimLeadingAndTrailingSlashes('a/b/c')).toBe('a/b/c')
  })
})

describe('stripMarkdown', () => {
  test('returns the text without formatting', () => {
    expect(stripMarkdown('Use **bold** and [a link](https://example.com) and `code`.')).toBe(
      'Use bold and a link and code.'
    )
  })
})

describe('processMarkdownToHtml', () => {
  test('renders inline Markdown', () => {
    expect(processMarkdownToHtml('A *short* text.').trim()).toBe('<p>A <em>short</em> text.</p>')
  })
})

describe('titleCase', () => {
  test('uppercases the first letter of each word and lowercases the rest', () => {
    expect(titleCase('hELLO wORLD')).toBe('Hello World')
  })
})
