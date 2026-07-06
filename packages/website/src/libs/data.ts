import fs from 'node:fs'
import { load } from 'js-yaml'
import { z } from 'zod'
import { zVersionMajorMinor, zVersionSemver, zLanguageCode } from './validation'

// An object containing all the data types and their associated schema. The key should match the name of the data file
// in the `./packages/website/data/` directory.
const dataDefinitions = {
  'core-team': z
    .object({
      name: z.string(),
      user: z.string()
    })
    .array(),
  'docs-versions': z
    .object({
      group: z.string(),
      baseurl: z.url(),
      description: z.string(),
      versions: z.union([zVersionSemver, zVersionMajorMinor]).array()
    })
    .array(),
  sidebar: z
    .object({
      title: z.string(),
      section: z.string().optional(),
      icon: z.string().optional(),
      icon_color: z.string().optional(),
      pages: z
        .object({
          title: z.string().optional(),
          href: z.string().optional(),
          group: z.string().optional(),
          meta: z.object({ added: z.string() }).array().optional(),
          pages: z
            .object({
              title: z.string(),
              meta: z.object({ added: z.string() }).array().optional()
            })
            .array()
            .optional()
        })
        .array()
        .optional()
    })
    .array(),
  translations: z
    .object({
      name: z.string(),
      code: zLanguageCode,
      description: z.string(),
      url: z.url()
    })
    .array()
} satisfies Record<string, DataSchema>

// Inferred types for individual data files. Exported so consumers can avoid
// re-deriving them via `ReturnType<typeof getData<'sidebar'>>` and don't have
// to fall back to `any` when iterating nested arrays.
export type SidebarGroup = z.infer<typeof dataDefinitions.sidebar>[number]
export type SidebarItem = NonNullable<SidebarGroup['pages']>[number]
export type SidebarSubItem = NonNullable<SidebarItem['pages']>[number]

const data = new Map<DataType, z.infer<DataSchema>>()

// A helper to get data loaded fom a yml file in the `./packages/website/data/` directory. If the data does not match its associated
// schema from `dataDefinitions`, an error is thrown to indicate that the data file is invalid and some action is
// required.
export function getData<TType extends DataType>(
  type: TType
): z.infer<(typeof dataDefinitions)[TType]> {
  if (data.has(type)) {
    // Returns the data if it has already been loaded.
    return data.get(type) as z.infer<(typeof dataDefinitions)[TType]>
  }

  const dataPath = `./data/${type}.yml`

  try {
    // Load the data from the yml  file.
    const rawData = load(fs.readFileSync(dataPath, 'utf8'))

    // Parse the data using the data schema to validate its content and get back a fully typed data object.
    const parsedData = dataDefinitions[type].parse(rawData)

    // Cache the data.
    data.set(type, parsedData)

    return parsedData as z.infer<(typeof dataDefinitions)[TType]>
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`The \`${dataPath}\` file content is invalid:`, error.issues)
    }

    throw new Error(`Failed to load data from \`${dataPath}\``, { cause: error })
  }
}

type DataType = keyof typeof dataDefinitions
type DataSchema = z.ZodTypeAny
