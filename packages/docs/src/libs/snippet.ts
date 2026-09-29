/**
 * Returns the text between `// <kind>-docs-start <name>` and the first
 * `// <kind>-docs-end <name>` after it, or `undefined` when the file has no such part.
 *
 * The end marker has to name the part exactly: the part `make-col` ends at
 * `// scss-docs-end make-col`, not at `// scss-docs-end make-col-auto`.
 */
export function extractDocsSnippet(
  content: string,
  kind: 'js' | 'scss',
  name: string
): string | undefined {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = content.match(
    new RegExp(
      `// ${kind}-docs-start ${escapedName}\\n([\\s\\S]*?)// ${kind}-docs-end ${escapedName}(?![\\w-])`
    )
  )

  return matches?.[1] || undefined
}
