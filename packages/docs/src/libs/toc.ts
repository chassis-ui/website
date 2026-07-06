import type { MarkdownHeading } from 'astro'

/**
 * Minimum configuration shape required by `generateToc`.
 * The consuming project's full config object satisfies this interface as long as
 * it contains a `toc` section with `min` and `max` depth values.
 */
export interface TocConfig {
  toc: {
    /** Minimum heading depth to include (e.g. `2` to start at `<h2>`). */
    min: number
    /** Maximum heading depth to include (e.g. `4` to stop at `<h4>`). */
    max: number
  }
}

/**
 * Generates a nested tree of TOC entries from a flat list of Markdown headings.
 *
 * Headings outside the depth range defined in `config.toc` are excluded. When
 * a heading skips one or more levels (e.g. an `<h4>` follows an `<h2>` with no
 * `<h3>` in between) it is attached to the deepest available parent rather than
 * being silently dropped.
 */
export function generateToc(allHeadings: MarkdownHeading[], config: TocConfig): TocEntry[] {
  const headings = allHeadings.filter(
    (heading) => heading.depth >= config.toc.min && heading.depth <= config.toc.max
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

/**
 * Walks down the TOC tree to find the children array at the given relative
 * `depth` below `entry`. If an intermediate level is missing (skipped heading),
 * falls back to the deepest available children array so the heading is not lost.
 */
function getEntryChildrenAtDepth(entry: TocEntry, depth: number): TocEntry['children'] {
  if (!entry) {
    return []
  }

  if (depth === 1) {
    return entry.children
  }

  const lastChild = entry.children[entry.children.length - 1]

  if (!lastChild) {
    // Heading skipped a level — attach to the current entry's children instead.
    return entry.children
  }

  return getEntryChildrenAtDepth(lastChild, depth - 1)
}

export interface TocEntry extends MarkdownHeading {
  children: TocEntry[]
}
