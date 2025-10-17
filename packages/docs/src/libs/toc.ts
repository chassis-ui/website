import type { MarkdownHeading } from 'astro'

// Global registry for config getter
let globalConfigGetter: (() => any) | null = null

// Registration function for consuming sites to provide their config function
export function registerTocConfig(getConfig: () => any) {
  globalConfigGetter = getConfig
}

// Generate a tree like structure from a list of headings.
export function generateToc(allHeadings: MarkdownHeading[], config?: any) {
  const tocConfig = config || (globalConfigGetter ? globalConfigGetter() : null)

  if (!tocConfig) {
    throw new Error(
      'TOC config not provided and not registered. Pass config as parameter or call registerTocConfig() first.'
    )
  }

  const headings = allHeadings.filter(
    (heading) => heading.depth >= tocConfig.toc.min && heading.depth <= tocConfig.toc.max
  )

  const toc: TocEntry[] = []

  for (const heading of headings) {
    if (toc.length === 0) {
      toc.push({ ...heading, children: [] })
      continue
    }

    const previousEntry = toc[toc.length - 1]

    if (heading.depth === previousEntry.depth) {
      toc.push({ ...heading, children: [] })
      continue
    }

    const children = getEntryChildrenAtDepth(previousEntry, heading.depth - previousEntry.depth)
    children.push({ ...heading, children: [] })
  }

  return toc
}

function getEntryChildrenAtDepth(entry: TocEntry, depth: number): TocEntry['children'] {
  if (!entry) {
    return []
  }

  return depth === 1
    ? entry.children
    : getEntryChildrenAtDepth(entry.children[entry.children.length - 1], depth - 1)
}

export interface TocEntry extends MarkdownHeading {
  children: TocEntry[]
}
