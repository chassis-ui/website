import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { calloutsSchema, docsSchema } from '@chassis-ui/docs/schema'

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './content/docs' }),
    schema: docsSchema
  }),
  callouts: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './content/callouts' }),
    schema: calloutsSchema
  })
}
