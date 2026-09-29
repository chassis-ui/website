import type { MarkdownHeading } from 'astro'
import { describe, expect, test } from 'vitest'
import { generateToc, type TocEntry } from '../../src/libs/toc'

const config = { toc: { min: 2, max: 4 } }

function heading(depth: number, text: string): MarkdownHeading {
  return { depth, text, slug: text.toLowerCase().replaceAll(' ', '-') }
}

// The tree as nested texts, which is easier to read in an assertion.
function outline(entries: TocEntry[]): unknown[] {
  return entries.map((entry) =>
    entry.children.length ? [entry.text, outline(entry.children)] : entry.text
  )
}

describe('generateToc', () => {
  test('nests headings by depth', () => {
    const toc = generateToc(
      [heading(2, 'A'), heading(3, 'A1'), heading(3, 'A2'), heading(4, 'A2a'), heading(2, 'B')],
      config
    )

    expect(outline(toc)).toEqual([['A', ['A1', ['A2', ['A2a']]]], 'B'])
  })

  test('leaves out headings outside the configured range', () => {
    const toc = generateToc(
      [heading(1, 'Title'), heading(2, 'A'), heading(5, 'Deep'), heading(6, 'Deeper')],
      config
    )

    expect(outline(toc)).toEqual(['A'])
  })

  test('keeps a heading that skips a level', () => {
    const toc = generateToc([heading(2, 'A'), heading(4, 'A-skipped'), heading(2, 'B')], config)

    expect(outline(toc)).toEqual([['A', ['A-skipped']], 'B'])
  })

  test('puts a heading at the top level when it is shallower than the one before', () => {
    const toc = generateToc([heading(3, 'Intro'), heading(2, 'A'), heading(3, 'A1')], config)

    expect(outline(toc)).toEqual(['Intro', ['A', ['A1']]])
  })

  test('keeps the slug and the depth of each heading', () => {
    const [entry] = generateToc([heading(2, 'Getting started')], config)

    expect(entry).toEqual({
      depth: 2,
      text: 'Getting started',
      slug: 'getting-started',
      children: []
    })
  })

  test('returns an empty list when no heading is in range', () => {
    expect(generateToc([heading(1, 'Title')], config)).toEqual([])
  })
})
