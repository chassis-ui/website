import { getCollection } from 'astro:content'

export const docsPages = await getCollection('docs')

export const aliasedDocsPages = await getCollection('docs', ({ data }) => {
  return data.aliases !== undefined
})

// Hide unpublished and future-dated blog posts in production builds. In dev they
// remain visible so drafts can be previewed locally.
const now = Date.now()
export const blogPages = await getCollection('blog', ({ data }) => {
  if (!import.meta.env.PROD) return true
  if (data.published === false) return false
  const pubDate = data.pubDate ? new Date(data.pubDate).getTime() : 0
  return pubDate <= now
})
