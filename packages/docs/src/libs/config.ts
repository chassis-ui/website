import fs from 'node:fs'
import path from 'node:path'
import { load } from 'js-yaml'
import { z } from 'astro/zod'
import {
  configSchema,
  removedConfigKeys,
  renamedConfigKeys,
  sidebarSchema,
  type ChassisConfig,
  type Sidebar
} from './schema'

export interface LoadConfigOptions<TSchema extends z.ZodType = typeof configSchema> {
  /**
   * Path of the config file. A relative path is resolved from `root`.
   * @default 'config.yml'
   */
  file?: string
  /**
   * The site's root: the directory that holds `astro.config.ts`.
   * @default process.cwd()
   */
  root?: string
  /** `configSchema`, or an extension of it when the site has keys of its own. */
  schema?: TSchema
}

function getValueAtPath(record: unknown, keyPath: string): unknown {
  return keyPath.split('.').reduce<unknown>((value, part) => {
    return value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined
  }, record)
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.length ? issue.path.join('.') : '(root)'}: ${issue.message}`)
    .join('\n')
}

// The schema is strict, so an old key would fail as "unrecognized key". These messages say
// what to do about it.
function findOutdatedKeys(raw: unknown): string[] {
  const messages: string[] = []

  for (const [oldKey, newKey] of Object.entries(renamedConfigKeys)) {
    if (getValueAtPath(raw, oldKey) !== undefined) {
      messages.push(`  - \`${oldKey}\` was renamed to \`${newKey}\`.`)
    }
  }

  for (const [oldKey, reason] of Object.entries(removedConfigKeys)) {
    if (getValueAtPath(raw, oldKey) !== undefined) {
      messages.push(`  - \`${oldKey}\` was removed. ${reason}`)
    }
  }

  return messages
}

function readYaml(file: string): unknown {
  try {
    return load(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`Failed to read \`${file}\`.`, { cause: error })
  }
}

/**
 * Reads and validates the site's `config.yml`.
 *
 * For code that runs while Astro loads its configuration, such as `astro.config.ts` and a
 * site's own integrations. Pages and components read the config with `getConfig()` from
 * `@chassis-ui/docs/site`.
 *
 * @example
 * ```ts
 * // astro.config.ts
 * const config = loadConfig({ root: import.meta.dirname, schema: siteConfigSchema })
 * ```
 */
export function loadConfig<TSchema extends z.ZodType = typeof configSchema>(
  options: LoadConfigOptions<TSchema> = {}
): z.infer<TSchema> {
  const { file = 'config.yml', root = process.cwd(), schema = configSchema } = options
  const configPath = path.resolve(root, file)
  const raw = readYaml(configPath)

  const outdatedKeys = findOutdatedKeys(raw)

  if (outdatedKeys.length > 0) {
    throw new Error(
      `\`${configPath}\` has keys from before @chassis-ui/docs 0.6.0:\n${outdatedKeys.join('\n')}`
    )
  }

  const result = schema.safeParse(raw)

  if (!result.success) {
    throw new Error(`\`${configPath}\` is invalid:\n${formatIssues(result.error)}`)
  }

  return result.data as z.infer<TSchema>
}

export interface LoadDataOptions<TSchema extends z.ZodType> {
  /** Path of the data file. A relative path is resolved from `root`. */
  file: string
  /** @default process.cwd() */
  root?: string
  schema: TSchema
}

/** Reads and validates a YAML data file. */
export function loadData<TSchema extends z.ZodType>(
  options: LoadDataOptions<TSchema>
): z.infer<TSchema> {
  const { file, root = process.cwd(), schema } = options
  const dataPath = path.resolve(root, file)
  const result = schema.safeParse(readYaml(dataPath))

  if (!result.success) {
    throw new Error(`\`${dataPath}\` is invalid:\n${formatIssues(result.error)}`)
  }

  return result.data as z.infer<TSchema>
}

/** Reads and validates the site's `data/sidebar.yml`. */
export function loadSidebar(options: { file?: string; root?: string } = {}): Sidebar {
  return loadData({
    file: options.file ?? 'data/sidebar.yml',
    root: options.root,
    schema: sidebarSchema
  })
}

export type { ChassisConfig, Sidebar }
