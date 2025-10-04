import { getCollection, getEntry } from 'astro:content'

export const blogPages = await getCollection('blog')
export const docsPages = await getCollection('docs')
