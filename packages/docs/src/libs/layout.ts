import type { HTMLAttributes, HTMLTag } from 'astro/types'

export type Layout = 'docs' | 'icons' | 'examples' | 'single' | 'blog' | undefined

export type LayoutOverridesHTMLAttributes<TTag extends HTMLTag> = HTMLAttributes<TTag> & {
  [key in `data-${string}`]: string
}
