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
 * Shiki transformer that wraps non-comment lines in a `<span class="line">`
 * element. Applied only to shell languages (bash, sh, powershell) where line
 * wrapping is needed for the copy-button to correctly extract individual commands.
 */
const lineWrapperTransformer: ShikiTransformer = {
  name: 'line-wrapper',
  line(node) {
    const hasOnlyComments = node.children.every(
      (child) =>
        child.type === 'element' &&
        child.properties?.class &&
        Array.isArray(child.properties.class) &&
        child.properties.class.some((cls) => typeof cls === 'string' && cls.includes('comment'))
    )

    if (!hasOnlyComments) {
      node.properties = node.properties || {}
      const existing = node.properties.class ?? ''
      const classes = typeof existing === 'string' ? existing.split(' ') : []
      if (!classes.includes('line')) classes.push('line')
      node.properties.class = classes.join(' ').trim()
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
 * Highlights a code string using Shiki with the GitHub light/dark dual theme.
 *
 * Inline styles are converted to CSS classes via `transformerStyleToClass` so
 * that a single `<style>` block can be emitted per page rather than repeating
 * styles on every token. The returned `css` string must be injected into the
 * page (e.g. inside a `<style>` tag) for the highlighted output to render correctly.
 *
 * For shell languages (`bash`, `sh`, `powershell`) each non-comment line is
 * additionally wrapped in `<span class="line">` to support per-line copy.
 *
 * @param code - Source code to highlight.
 * @param lang - Shiki language identifier (e.g. `"html"`, `"ts"`, `"bash"`).
 * @param extraTransformers - Additional Shiki transformers to apply before the built-ins.
 * @returns An object with `html` (the highlighted markup) and `css` (the extracted styles).
 */
export async function highlightCode(
  code: string,
  lang: string,
  extraTransformers: ShikiTransformer[] = []
): Promise<{ html: string }> {
  const shouldWrapLines = ['bash', 'sh', 'powershell'].includes(lang)

  const transformers: ShikiTransformer[] = [...extraTransformers, classTransformer]
  if (shouldWrapLines) {
    transformers.push(lineWrapperTransformer)
  }

  const highlighted = await codeToHtml(code, {
    lang,
    themes: DOCS_SHIKI_THEMES,
    defaultColor: false,
    transformers
  })

  return { html: replaceShikiClasses(highlighted) }
}
