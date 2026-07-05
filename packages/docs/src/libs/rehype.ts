import type { Root } from 'hast'
import type { Plugin } from 'unified'
import { SKIP, visit } from 'unist-util-visit'

/**
 * Rehype plugin to apply CSS classes to tables in Markdown/MDX files.
 *
 * When a `<table>` is wrapped in a `<CxTable />` MDX component, this plugin
 * reads the `class` attribute from the wrapper and applies it to the `<table>`
 * element. Defaults to `"table"` if no class is specified.
 */
export const rehypeCxTable: Plugin<[], Root> = function () {
  return function rehypeCxTablePlugin(ast) {
    visit(ast, 'element', (node, _index, parent) => {
      if (
        node.tagName !== 'table' ||
        parent?.type !== 'mdxJsxFlowElement' ||
        parent.name !== 'CxTable'
      ) {
        return SKIP
      }

      const classAttribute = parent.attributes.find(
        (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'class'
      )

      if (classAttribute && typeof classAttribute.value !== 'string') {
        return SKIP
      }

      const tableClass = typeof classAttribute?.value === 'string' ? classAttribute.value : 'table'

      if (!node.properties) {
        node.properties = {}
      }

      node.properties = {
        ...node.properties,
        class: tableClass
      }
    })
  }
}
