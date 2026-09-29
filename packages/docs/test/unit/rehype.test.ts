import type { Element, Root } from 'hast'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'
import { rehypeCxTable } from '../../src/libs/rehype'

function table(): Element {
  return { type: 'element', tagName: 'table', properties: { id: 'data' }, children: [] }
}

function wrapper(attributes: unknown[], child: Element) {
  return { type: 'mdxJsxFlowElement', name: 'CxTable', attributes, children: [child] }
}

async function run(tree: unknown): Promise<Root> {
  return (await unified()
    .use(rehypeCxTable)
    .run(tree as Root)) as Root
}

describe('rehypeCxTable', () => {
  test('gives a wrapped table the class "table" by default', async () => {
    const node = table()
    await run({ type: 'root', children: [wrapper([], node)] })

    expect(node.properties).toEqual({ id: 'data', class: 'table' })
  })

  test('uses the class of the <CxTable> wrapper', async () => {
    const node = table()
    await run({
      type: 'root',
      children: [
        wrapper([{ type: 'mdxJsxAttribute', name: 'class', value: 'table striped' }], node)
      ]
    })

    expect(node.properties.class).toBe('table striped')
  })

  test('leaves a class expression alone', async () => {
    const node = table()
    const expression = { type: 'mdxJsxAttributeValueExpression', value: 'classes' }
    await run({
      type: 'root',
      children: [wrapper([{ type: 'mdxJsxAttribute', name: 'class', value: expression }], node)]
    })

    expect(node.properties).toEqual({ id: 'data' })
  })

  test('leaves a table outside <CxTable> alone', async () => {
    const node = table()
    await run({ type: 'root', children: [node] })

    expect(node.properties).toEqual({ id: 'data' })
  })
})
