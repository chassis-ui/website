import { describe, expect, test } from 'vitest'
import { extractDocsSnippet } from '../../src/libs/snippet'

const source = [
  '// scss-docs-start make-col',
  '$a: 1;',
  '// scss-docs-end make-col',
  '',
  '// scss-docs-start make-col-auto',
  '$b: 2;',
  '// scss-docs-end make-col-auto',
  '',
  '// scss-docs-start make-col',
  '$c: 3;',
  '// scss-docs-end make-col',
  ''
].join('\n')

describe('extractDocsSnippet', () => {
  test('returns the first part of that name only', () => {
    expect(extractDocsSnippet(source, 'scss', 'make-col')).toBe('$a: 1;\n')
  })

  test('does not end a part at the end marker of a longer name', () => {
    expect(extractDocsSnippet(source, 'scss', 'make-col-auto')).toBe('$b: 2;\n')
  })

  test('does not start a part at the start marker of a longer name', () => {
    const content = '// js-docs-start a-b\nx\n// js-docs-end a-b\n'

    expect(extractDocsSnippet(content, 'js', 'a')).toBeUndefined()
  })

  test('matches the kind of comment', () => {
    expect(extractDocsSnippet(source, 'js', 'make-col')).toBeUndefined()
  })

  test('treats characters of the name literally', () => {
    const content =
      '// scss-docs-start a.b\nx\n// scss-docs-end a.b\n// scss-docs-start aXb\ny\n// scss-docs-end aXb\n'

    expect(extractDocsSnippet(content, 'scss', 'a.b')).toBe('x\n')
    expect(extractDocsSnippet(content, 'scss', 'a*')).toBeUndefined()
  })

  test('returns undefined for an empty part', () => {
    expect(extractDocsSnippet('// js-docs-start e\n// js-docs-end e\n', 'js', 'e')).toBeUndefined()
  })
})
