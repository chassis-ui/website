import type { AstroUserConfig } from 'astro'
import type { Element, Text } from 'hast'
import type { ShikiTransformer } from 'shiki'
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark'
import type { UnifiedProcessorOptions } from '@astrojs/markdown-remark'
import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeCxTable } from './rehype'

type MarkdownConfig = NonNullable<AstroUserConfig['markdown']>

/**
 * Shiki theme pair used for both programmatic highlighting (`highlightCode`) and
 * the Astro markdown pipeline (`getDocsMarkdownConfig`). Defined once here to
 * keep both in sync.
 */
export const DOCS_SHIKI_THEMES = {
  light: 'github-light' as const,
  dark: 'github-dark' as const
}

/**
 * Shiki transformer that exposes the current language as a `data-language`
 * attribute on `<pre>` elements. The `Code` component reads this attribute when
 * rendering inline markdown code blocks so it can display the correct language
 * label without requiring an explicit `lang` prop.
 */
const addLanguageAttributeTransformer: ShikiTransformer = {
  name: 'add-language-attribute',
  pre(node) {
    const lang = this.options.lang
    if (lang) {
      node.properties['dataLanguage'] = lang
    }
  }
}

/**
 * Options accepted by `getDocsMarkdownConfig`.
 */
export interface DocsMarkdownConfigOptions {
  /**
   * Heading depth range used to determine which headings receive an autolink
   * anchor. Typically sourced from the project's `config.yml` `anchors` section.
   *
   * @example { min: 2, max: 4 } // anchors h2–h4
   */
  anchors: {
    min: number
    max: number
  }
  /** Additional project-specific rehype plugins, appended after the base set. */
  rehypePlugins?: UnifiedProcessorOptions['rehypePlugins']
  /** Additional project-specific remark plugins, appended after the base set. */
  remarkPlugins?: UnifiedProcessorOptions['remarkPlugins']
  /**
   * Passed directly to `remark-rehype`. Shallow-merged so individual handler
   * overrides don't discard base handlers.
   */
  remarkRehype?: UnifiedProcessorOptions['remarkRehype']
}

/**
 * Returns the shared Astro markdown configuration for Chassis docs sites.
 *
 * Includes the following base rehype plugins (in order):
 * - `rehypeHeadingIds` — adds `id` attributes to all headings.
 * - `rehypeAutolinkHeadings` — appends anchor links to headings in the
 *   `anchors.min`–`anchors.max` depth range.
 * - `rehypeCxTable` — applies CSS classes to `<CxTable>`-wrapped tables.
 * - _(any `options.rehypePlugins`)_
 *
 * @example
 * ```ts
 * // astro.config.ts
 * import { getDocsMarkdownConfig } from '@chassis-ui/docs'
 * import { getConfig } from './src/libs/config'
 *
 * export default defineConfig({
 *   markdown: getDocsMarkdownConfig({
 *     anchors: getConfig().anchors,
 *     rehypePlugins: [myExtraPlugin],
 *     remarkPlugins: [remarkCxConfig, remarkDefinitionList],
 *     remarkRehype: { handlers: defListHastHandlers }
 *   })
 * })
 * ```
 */
export function getDocsMarkdownConfig(options: DocsMarkdownConfigOptions): MarkdownConfig {
  const headingsRangeRegex = new RegExp(`^h[${options.anchors.min}-${options.anchors.max}]$`)

  return {
    processor: unified({
      smartypants: false,
      rehypePlugins: [
        rehypeHeadingIds,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            content: [{ type: 'text', value: ' ' }],
            properties: (element: Element) => ({
              class: 'anchor-link',
              ariaLabel: `Link to this section: ${(element.children[0] as Text).value}`
            }),
            test: (element: Element) => element.tagName.match(headingsRangeRegex)
          }
        ],
        rehypeCxTable,
        ...(options.rehypePlugins ?? [])
      ],
      remarkPlugins: options.remarkPlugins ?? [],
      ...(options.remarkRehype && {
        remarkRehype: options.remarkRehype
      })
    }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: DOCS_SHIKI_THEMES,
      defaultColor: false,
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        addLanguageAttributeTransformer
      ]
    }
  }
}
