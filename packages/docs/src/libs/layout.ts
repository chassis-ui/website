import type { HTMLAttributes, HTMLTag } from 'astro/types'

/**
 * Identifies which top-level layout a page is using. Passed down through
 * layouts and components to conditionally render layout-specific UI (e.g.
 * sidebar toggle, TOC, search).
 *
 * `undefined` means a plain page with no special layout context.
 */
export type Layout = 'docs' | 'icons' | 'examples' | 'single' | 'blog' | undefined

/**
 * Extends Astro's standard HTML element attributes with an open-ended set of
 * `data-*` attributes so that arbitrary data attributes can be passed as
 * override props without TypeScript errors.
 *
 * @example
 * const bodyProps: LayoutOverridesHTMLAttributes<'body'> = {
 *   class: 'docs-body',
 *   'data-cx-spy': 'scroll',
 * }
 */
export type LayoutOverridesHTMLAttributes<TTag extends HTMLTag> = HTMLAttributes<TTag> & {
  [key in `data-${string}`]: string //eslint-disable-line no-unused-vars
}
