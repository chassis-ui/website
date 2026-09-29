import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { calloutsSchema, docsSchema, z } from '@chassis-ui/docs/schema'

const blogSchema = z.object({
  author: z.string(),
  description: z.string(),
  extraJs: z
    .object({
      async: z.boolean().optional(),
      src: z.string()
    })
    .array()
    .optional(),
  image: z.object({
    url: z.string(),
    alt: z.string()
  }),
  pubDate: z.date(),
  published: z.boolean().optional(),
  tags: z.string().optional(),
  title: z.string()
})

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/blog' }),
  schema: blogSchema.partial()
})

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
  schema: docsSchema
})

const calloutsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/callouts' }),
  schema: calloutsSchema
})

export const collections = {
  blog: blogCollection,
  docs: docsCollection,
  callouts: calloutsCollection
}
