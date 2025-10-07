import { z, defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'

const blogSchema = z.object({
  author: z.string(),
  description: z.string(),
  extra_js: z
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
  sections: z
    .object({
      description: z.string(),
      title: z.string()
    })
    .array()
    .optional(),
  tags: z.string().optional(),
  title: z.string(),
  thumbnail: z.string().optional(),
  toc: z.boolean().optional()
})

const docsSchema = z.object({
  added: z
    .object({
      show_badge: z.boolean().optional(),
      version: z.string()
    })
    .optional(),
  aliases: z.string().or(z.string().array()).optional(),
  description: z.string(),
  direction: z.literal('rtl').optional(),
  extra_js: z
    .object({
      async: z.boolean().optional(),
      src: z.string()
    })
    .array()
    .optional(),
  sections: z
    .object({
      description: z.string(),
      title: z.string()
    })
    .array()
    .optional(),
  thumbnail: z.string().optional(),
  title: z.string(),
  toc: z.boolean().optional()
})

const calloutsSchema = z.object({})

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/blog' }),
  schema: blogSchema.partial()
})

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
  schema: docsSchema.partial()
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
