import { describe, expect, test } from 'vitest'
import { DOCS_SHIKI_THEMES, getDocsMarkdownConfig } from '../../src/libs/markdown'
import { rehypeCxTable } from '../../src/libs/rehype'

type Plugin = unknown

function getOptions(config: ReturnType<typeof getDocsMarkdownConfig>) {
  return (config.processor as unknown as { options: Record<string, Plugin[] | unknown> }).options
}

describe('getDocsMarkdownConfig', () => {
  const sitePlugin = () => () => {}

  test('adds anchor links to the configured heading levels only', () => {
    const config = getDocsMarkdownConfig({ anchors: { min: 2, max: 3 } })
    const autolink = (getOptions(config).rehypePlugins as Plugin[][])[1]
    const { test: isAnchored } = autolink[1] as { test: (_element: { tagName: string }) => unknown }

    expect(isAnchored({ tagName: 'h1' })).toBeFalsy()
    expect(isAnchored({ tagName: 'h2' })).toBeTruthy()
    expect(isAnchored({ tagName: 'h3' })).toBeTruthy()
    expect(isAnchored({ tagName: 'h4' })).toBeFalsy()
  })

  test('labels each anchor link with the heading text', () => {
    const config = getDocsMarkdownConfig({ anchors: { min: 2, max: 3 } })
    const autolink = (getOptions(config).rehypePlugins as Plugin[][])[1]
    const { properties } = autolink[1] as {
      properties: (_element: unknown) => Record<string, string>
    }

    expect(properties({ children: [{ type: 'text', value: 'Usage' }] })).toEqual({
      class: 'anchor-link',
      ariaLabel: 'Link to this section: Usage'
    })
  })

  test('runs the plugins of the site after its own', () => {
    const config = getDocsMarkdownConfig({
      anchors: { min: 2, max: 3 },
      rehypePlugins: [sitePlugin],
      remarkPlugins: [sitePlugin]
    })
    const options = getOptions(config)
    const rehypePlugins = options.rehypePlugins as Plugin[]

    expect(rehypePlugins.at(-2)).toBe(rehypeCxTable)
    expect(rehypePlugins.at(-1)).toBe(sitePlugin)
    expect(options.remarkPlugins).toEqual([sitePlugin])
  })

  test('passes remarkRehype through only when it is set', () => {
    const handlers = { custom: () => undefined }

    expect(getOptions(getDocsMarkdownConfig({ anchors: { min: 2, max: 3 } })).remarkRehype).toEqual(
      {}
    )
    expect(
      getOptions(getDocsMarkdownConfig({ anchors: { min: 2, max: 3 }, remarkRehype: { handlers } }))
        .remarkRehype
    ).toMatchObject({ handlers })
  })

  test('highlights with Shiki in both themes, without a default colour', () => {
    const config = getDocsMarkdownConfig({ anchors: { min: 2, max: 3 } })

    expect(config.syntaxHighlight).toBe('shiki')
    expect(config.shikiConfig?.themes).toEqual(DOCS_SHIKI_THEMES)
    expect(config.shikiConfig?.defaultColor).toBe(false)
    expect(config.shikiConfig?.transformers?.map((transformer) => transformer.name)).toEqual(
      expect.arrayContaining(['add-language-attribute', 'focusable-pre'])
    )
  })
})
