import { describe, expect, test } from 'vitest'
import { highlightCode } from '../../src/libs/highlight'

describe('highlightCode', () => {
  test('uses the astro-code class instead of shiki', async () => {
    const { html } = await highlightCode('const a = 1', 'js')

    expect(html).toContain('class="astro-code')
    expect(html).not.toMatch(/class="shiki/)
    expect(html).not.toContain('shiki-themes')
  })

  test('uses the light and the dark theme', async () => {
    const { html } = await highlightCode('const a = 1', 'js')

    expect(html).toContain('github-light')
    expect(html).toContain('github-dark')
  })

  test('marks every line of a shell snippet', async () => {
    const { html } = await highlightCode('# install\npnpm add @chassis-ui/docs', 'bash')

    expect(html.match(/<span class="line">/g)).toHaveLength(2)
  })

  test('runs extra transformers', async () => {
    const { html } = await highlightCode('a', 'txt', [
      {
        name: 'mark',
        pre(node) {
          node.properties['data-marked'] = 'yes'
        }
      }
    ])

    expect(html).toContain('data-marked="yes"')
  })
})
