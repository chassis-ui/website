import { getCollection, getEntry } from 'astro:content'

export const blogPages = await getCollection('blog')
export const docsPages = await getCollection('docs')
export const callouts = await getCollection('callouts')

export const aliasedDocsPages = await getCollection('docs', ({ data }) => {
  return data.aliases !== undefined
})

export function getCalloutByName(name: string) {
  return getEntry('callouts', name)
}

// Type for callout names
export type CalloutName = 'css-docs' | 'tokens-docs' | 'assets-docs' | 'icons-docs'
