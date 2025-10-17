import type { MarkdownHeading } from 'astro'
import { existsSync } from 'fs'

// Dynamically import config from consuming project
// Try multiple possible locations for the config file
const possiblePaths = [
  '/src/libs/config.ts', // workspace project
  '/site/src/libs/config.ts', // consuming project with site folder
  '/config.ts' // root level fallback
]

let configModule: any
let configFound = false

for (const relativePath of possiblePaths) {
  const configPath = process.cwd() + relativePath

  if (existsSync(configPath)) {
    try {
      configModule = await import(/* @vite-ignore */ configPath)
      configFound = true
      break
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}:`, error)
      continue
    }
  }
}

if (!configFound) {
  console.warn('No config file found in any expected location, using fallback')
  // Fallback - this should not happen in a properly set up consuming project
  configModule = { getConfig: () => ({ toc: { min: 2, max: 6 } }) }
}

// Generate a tree like structure from a list of headings.
export function generateToc(allHeadings: MarkdownHeading[]) {
  const headings = allHeadings.filter(
    (heading) =>
      heading.depth >= configModule.getConfig().toc.min &&
      heading.depth <= configModule.getConfig().toc.max
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
