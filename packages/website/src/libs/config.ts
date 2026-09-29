import { configSchema, z } from '@chassis-ui/docs/schema'

// The keys of `config.yml`: the ones that `@chassis-ui/docs` reads, and the site's own.
export const siteConfigSchema = configSchema.extend({
  blog: z.object({
    pageSize: z.number()
  })
})

export type SiteConfig = z.infer<typeof siteConfigSchema>
