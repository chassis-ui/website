import { z } from 'astro/zod'

// Sites extend the schemas below. They must use this `z`, so that the site and the package
// share one copy of Zod.
export { z }

export const zVersionMajorMinor = z.string().regex(/^\d+\.\d+$/)

// https://ihateregex.io/expr/semver/
const unboundSemverRegex =
  /(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/

export const zVersionSemver = z.string().regex(new RegExp(`^${unboundSemverRegex.source}$`))
export const zPrefixedVersionSemver = z
  .string()
  .regex(new RegExp(`^v${unboundSemverRegex.source}$`))

export const zLanguageCode = z.string().regex(/^[a-z]{2}(?:-[a-zA-Z]{2})?$/)

const zHeadingRange = z.object({
  min: z.number().int().min(1).max(6),
  max: z.number().int().min(1).max(6)
})

/**
 * The keys of `config.yml` that the package reads.
 *
 * The schema is strict: a key that is not in it fails the build. A site with keys of its own
 * extends the schema and passes the result to the integration.
 *
 * @example
 * ```ts
 * import { configSchema, z } from '@chassis-ui/docs/schema'
 *
 * export const siteConfigSchema = configSchema.extend({
 *   blog: z.object({ pageSize: z.number() })
 * })
 * ```
 */
export const configSchema = z.strictObject({
  /** Google Analytics is offered in production builds when `googleId` is set, and loads after the visitor accepts. */
  analytics: z.strictObject({ googleId: z.string().optional() }).default({}),
  /** Heading levels that get an anchor link. */
  anchors: zHeadingRange.default({ min: 2, max: 5 }),
  authors: z.string(),
  /** Canonical URL of the site, e.g. `"https://chassis-ui.com/css"`. */
  baseURL: z.url(),
  /** Version of the release that the site documents. Links to source files use its tag. */
  currentVersion: zVersionSemver,
  description: z.string(),
  /** URL path of the docs pages, e.g. `"/css/docs"`. */
  docsPath: z.string().startsWith('/'),
  /** Figma Community handle, without the `@`. The header links to it when set. */
  figmaHandle: z.string().optional(),
  /** GitHub organisation or user name, not a URL. The header links to it when set. */
  githubOrg: z
    .string()
    .regex(/^[\w.-]+$/, 'Expected a GitHub organisation name, not a URL')
    .optional(),
  /** Repository URL, e.g. `"https://github.com/chassis-ui/css"`. */
  repo: z.url(),
  /** The branch that "View on GitHub" links to. */
  siteBranch: z.string().default('main'),
  /** The site's root from the root of the repository, e.g. `"packages/site"`. */
  sitePath: z.string().optional(),
  /**
   * Directory that the `file` props of `<ScssDocs>`, `<ScssDocsSimple>`, `<JsDocs>` and
   * `<Code>` are relative to, itself relative to the site's root, e.g. `"../css"`.
   */
  sourceDir: z.string().default('.'),
  /** The same directory from the root of the repository, e.g. `"packages/css"`. */
  sourcePath: z.string().optional(),
  /**
   * URL path that the pages load the static files from, e.g. `"/css/static"`. The files stay
   * in `static/` of the `public` directory: a site under a prefix of another host sets this
   * and rewrites the path to `/static`.
   */
  staticPath: z
    .string()
    .regex(/^\/(.*[^/])?$/, 'Expected a URL path that starts with "/" and has no trailing slash')
    .refine((value) => value !== '/', 'Expected a path below the root, such as "/static"')
    .default('/static'),
  subtitle: z.string(),
  title: z.string(),
  /** Heading levels that the table of contents lists. */
  toc: zHeadingRange.default({ min: 2, max: 6 }),
  /** X handle, without the `@`. Used in the social meta tags when set. */
  xUsername: z.string().optional()
})

/** The parsed `config.yml`, limited to the keys that the package reads. */
export type ChassisConfig = z.infer<typeof configSchema>

/** A schema that a site passes to the integration: `configSchema` or an extension of it. */
export type ChassisConfigSchema = z.ZodType<ChassisConfig>

/**
 * Keys that were renamed in 0.6.0. Loading a `config.yml` that still has one of them fails
 * with a message that names the new key.
 */
export const renamedConfigKeys: Record<string, string> = {
  'analytics.google_id': 'analytics.googleId',
  current_version: 'currentVersion',
  figma_handle: 'figmaHandle',
  github_org: 'githubOrg',
  x_username: 'xUsername'
}

/** Keys that were removed in 0.6.0, with the reason. */
export const removedConfigKeys: Record<string, string> = {
  docsDir: 'The site root is the Astro root. Delete the key.'
}

// A key that was renamed in 0.6.0. The schemas below are not strict, so the old key would
// be dropped silently. This makes it fail, with a message that names the new key.
function renamedTo(newKey: string) {
  return z.never({ error: `This key was renamed to \`${newKey}\`.` }).optional()
}

const sidebarMetaSchema = z.object({ added: z.string() }).array().optional()

/** The entries of `data/sidebar.yml`. */
export const sidebarSchema = z
  .object({
    title: z.string(),
    section: z.string().optional(),
    icon: z.string().optional(),
    iconColor: z.string().optional(),
    icon_color: renamedTo('iconColor'),
    pages: z
      .object({
        title: z.string().optional(),
        href: z.string().optional(),
        group: z.string().optional(),
        meta: sidebarMetaSchema,
        pages: z
          .object({
            title: z.string(),
            meta: sidebarMetaSchema
          })
          .array()
          .optional()
      })
      .array()
      .optional()
  })
  .array()

export type Sidebar = z.infer<typeof sidebarSchema>
export type SidebarGroup = Sidebar[number]
export type SidebarItem = NonNullable<SidebarGroup['pages']>[number]
export type SidebarSubItem = NonNullable<SidebarItem['pages']>[number]

/**
 * Frontmatter of a page in the `docs` collection.
 *
 * @example
 * ```ts
 * // src/content.config.ts
 * import { defineCollection } from 'astro:content'
 * import { glob } from 'astro/loaders'
 * import { calloutsSchema, docsSchema } from '@chassis-ui/docs/schema'
 *
 * export const collections = {
 *   docs: defineCollection({
 *     loader: glob({ pattern: '**\/*.{md,mdx}', base: './content/docs' }),
 *     schema: docsSchema
 *   }),
 *   callouts: defineCollection({
 *     loader: glob({ pattern: '**\/*.md', base: './content/callouts' }),
 *     schema: calloutsSchema
 *   })
 * }
 * ```
 */
export const docsSchema = z
  .object({
    added: z
      .object({
        showBadge: z.boolean().optional(),
        show_badge: renamedTo('showBadge'),
        version: z.string()
      })
      .optional(),
    aliases: z.string().or(z.string().array()).optional(),
    description: z.string(),
    direction: z.literal('rtl').optional(),
    extraJs: z
      .object({
        async: z.boolean().optional(),
        src: z.string()
      })
      .array()
      .optional(),
    extra_js: renamedTo('extraJs'),
    sections: z
      .object({
        description: z.string(),
        title: z.string(),
        slug: z.string().optional()
      })
      .array()
      .optional(),
    thumbnail: z.string().optional(),
    title: z.string(),
    toc: z.boolean().optional()
  })
  .partial()

export type DocsFrontmatter = z.infer<typeof docsSchema>

/** Frontmatter of an entry in the `callouts` collection. */
export const calloutsSchema = z.object({})

/** An entry of the `docs` collection, as far as the package reads it. */
export interface DocsPage {
  id: string
  data: DocsFrontmatter
  /** Path of the source file from the site's root. */
  filePath?: string
}
