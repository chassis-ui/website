import fs from 'node:fs'
import { load } from 'js-yaml'
import { z } from 'zod'
import { zVersionSemver } from './validation'

// The config schema used to validate the config file content and ensure all values required by the site are valid.
const configSchema = z.object({
  analytics: z.object({
    google_id: z.string()
  }),
  anchors: z.object({
    min: z.number(),
    max: z.number()
  }),
  authors: z.string(),
  baseURL: z.url(),
  blog: z.object({
    pageSize: z.number()
  }),
  current_version: zVersionSemver,
  description: z.string(),
  // docs_version: zVersionMajorMinor,
  docsDir: z.string(),
  docsPath: z.string(),
  github_org: z.url(),
  repo: z.url(),
  subtitle: z.string(),
  title: z.string(),
  toc: z.object({
    min: z.number(),
    max: z.number()
  }),
  x: z.string()
})

let config: Config | undefined

// A helper to get the config loaded fom the `config.yml` file. If the config does not match the `configSchema`, an
// error is thrown to indicate that the config file is invalid and some action is required.
export function getConfig(): Config {
  if (config) {
    // Returns the config if it has already been loaded.
    return config
  }

  try {
    // Load the config from the `config.yml` file.
    const rawConfig = load(fs.readFileSync('./config.yml', 'utf8'))

    // Parse the config using the config schema to validate its content and get back a fully typed config object.
    config = configSchema.parse(rawConfig)

    return config
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('The `config.yml` file content is invalid:', error.issues)
    }

    throw new Error('Failed to load configuration from `config.yml`', { cause: error })
  }
}

type Config = z.infer<typeof configSchema>
