import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { calloutsSchema, docsSchema } from '../../../src/libs/schema'

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './content/docs' }),
    schema: docsSchema
  }),
  callouts: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './content/callouts' }),
    schema: calloutsSchema
  })
}
