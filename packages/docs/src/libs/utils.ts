import { slug } from 'github-slugger'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString } from 'mdast-util-to-string'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

/** Returns `str` with its first character uppercased. */
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Generates an inclusive numeric sequence from `start` to `end` with the given `step`.
 *
 * @example getSequence(1, 5)      // [1, 2, 3, 4, 5]
 * @example getSequence(0, 10, 2)  // [0, 2, 4, 6, 8, 10]
 */
export function getSequence(start: number, end: number, step = 1) {
  const sequence = []

  for (let i = start; i <= end; i += step) {
    sequence.push(i)
  }

  return sequence
}

/**
 * Converts a string to a URL-safe slug, collapsing consecutive hyphens.
 *
 * Used by the docs sidebar to derive page slugs from sidebar entry titles and
 * by `DocsLayout` to resolve frontmatter section slugs.
 *
 * @remarks
 * **Known limitation:** the sidebar relies on slugified custom titles matching
 * the actual filenames on disk, which is fragile. The long-term fix is to move
 * slug generation into MDX frontmatter and have `sidebar.yml` reference file
 * names directly. See the `DocsSidebar` component for related context.
 */
export function getSlug(str: string) {
  return slug(str).replace(/--+/g, '-')
}

/** Removes leading and trailing slashes from a URL path segment. */
export function trimLeadingAndTrailingSlashes(str: string) {
  return str.replace(/^\/+|\/+$/g, '')
}

/**
 * Strips Markdown formatting from a string, returning plain text.
 * Useful for generating clean meta descriptions from Markdown content.
 */
export function stripMarkdown(str: string) {
  return toString(fromMarkdown(str))
}

/**
 * Converts a Markdown string to an HTML string synchronously.
 * Intended for short inline content such as page descriptions.
 */
export function processMarkdownToHtml(markdown: string): string {
  const result = remark().use(remarkHtml).processSync(markdown)
  return result.toString()
}

/**
 * Converts a string to title case (first letter of each word uppercased,
 * remaining letters lowercased).
 *
 * @example titleCase('hello world') // 'Hello World'
 */
export function titleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
}
