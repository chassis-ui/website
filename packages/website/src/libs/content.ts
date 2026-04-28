import { getCollection, getEntry } from 'astro:content'

export const docsPages = await getCollection('docs')
export const callouts = await getCollection('callouts')

export const aliasedDocsPages = await getCollection('docs', ({ data }) => {
  return data.aliases !== undefined
})

// Hide future-dated blog posts in production builds. In dev they remain visible
// so drafts can be previewed locally.
const now = Date.now()
export const blogPages = await getCollection('blog', ({ data }) => {
  if (!import.meta.env.PROD) return true
  const pubDate = data.pubDate ? new Date(data.pubDate).getTime() : 0
  return pubDate <= now
})

export function getCalloutByName(name: string) {
  return getEntry('callouts', name)
}

// Type for callout names
export type CalloutName = 'css-docs' | 'tokens-docs' | 'assets-docs' | 'icons-docs'
