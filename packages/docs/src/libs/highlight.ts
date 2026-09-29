import { codeToHtml, type ShikiTransformer } from 'shiki'
import { DOCS_SHIKI_THEMES } from './markdown'

/**
 * Shiki transformer that renames the `shiki` CSS class on `<pre>` elements to
 * `astro-code` so that Astro's built-in syntax highlighting styles apply.
 */
const classTransformer: ShikiTransformer = {
  name: 'class-name-transformer',
  pre(node) {
    if (typeof node.properties.class === 'string') {
      node.properties.class = node.properties.class.replace(/shiki/g, 'astro-code')
    }
  }
}

/**
 * Replaces any remaining `shiki` / `shiki-themes` class strings in the
 * serialized HTML that the transformer may have missed (e.g. in inline styles
 * converted by `transformerStyleToClass`).
 */
function replaceShikiClasses(html: string): string {
  return html
    .replace(/class=(["'])shiki(\s+)/g, 'class=$1astro-code$2')
    .replace(/class=(["'])shiki(["'])/g, 'class=$1astro-code$2')
    .replace(/shiki-themes/g, 'astro-code-themes')
}

/**
 * Highlights a code string using Shiki with the GitHub light/dark dual theme. Shiki wraps
 * each line in a `<span class="line">`.
 *
 * @param code - Source code to highlight.
 * @param lang - Shiki language identifier (e.g. `"html"`, `"ts"`, `"bash"`).
 * @param extraTransformers - Additional Shiki transformers to apply before the built-ins.
 * @returns An object with `html`, the highlighted markup.
 */
export async function highlightCode(
  code: string,
  lang: string,
  extraTransformers: ShikiTransformer[] = []
): Promise<{ html: string }> {
  const highlighted = await codeToHtml(code, {
    lang,
    themes: DOCS_SHIKI_THEMES,
    defaultColor: false,
    transformers: [...extraTransformers, classTransformer]
  })

  return { html: replaceShikiClasses(highlighted) }
}
