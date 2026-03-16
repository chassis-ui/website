import fs from 'node:fs'
import path from 'node:path'
import { getConfig } from './config'
import { fileURLToPath } from 'node:url'

// The docs directory path relative to the root of the project.
export const docsDirectory = getConfig().docsDir

export function getDocsFsPath() {
  return path.join(process.cwd(), docsDirectory)
}

export function getDocsRelativePath(inputPath: string) {
  return path.join(docsDirectory, inputPath)
}

export function getChassisAssetsFsPath() {
  return path.join('../../vendor/assets/dist/web/docs', 'chassis')
}

export function getChassisTokensFsPath() {
  return path.join('../../node_modules/@chassis-ui/tokens/dist/tokens/web/docs', 'chassis')
}

export function getChassisCSSFsPath() {
  return path.join('node_modules/@chassis-ui/css/dist')
}

export function getChassisIconsFsPath() {
  return path.join('node_modules/@chassis-ui/icons')
}

export function getDocsStaticFsPath() {
  return path.join(getDocsFsPath(), 'static')
}

export function getDocsPublicFsPath() {
  return path.join(getDocsFsPath(), 'public')
}

// A list of all the docs paths that were generated during a build.
const generatedVersionedDocsPaths: string[] = []

export function getChassisDocsPath(inputPath: string): string {
  const { docsPath } = getConfig()

  const sanitizedInputPath = inputPath.replace(/^\//, '')

  if (import.meta.env.PROD) {
    generatedVersionedDocsPaths.push(sanitizedInputPath)
  }

  // return `/docs/${docs_version}/${sanitizedDocsPath}`
  return `${docsPath}/${sanitizedInputPath}`
}

// Validate that all the generated versioned docs paths point to an existing page or asset.
// This is useful to catch typos in docs paths.
// Note: this function is only called during a production build.
// Note: this could at some point be refactored to use Astro list of generated `routes` accessible in the
// `astro:build:done` integration hook. Although as of 03/14/2023, this is not possible due to the route's data only
// containing information regarding the last page generated page for dynamic routes.
// @see https://github.com/withastro/astro/issues/5802
export function validateChassisDocsPaths(distUrl: URL) {
  const { docsPath } = getConfig()

  for (const generatedDocsPath of generatedVersionedDocsPaths) {
    const sanitizedInputPath = sanitizeChassisDocsPathForValidation(generatedDocsPath)
    const absoluteDocsPath = fileURLToPath(
      // new URL(path.join('./docs', docs_version, sanitizedDocsPath), distUrl)
      new URL(path.join('.', docsPath, sanitizedInputPath), distUrl)
    )

    const docsPathExists = fs.existsSync(absoluteDocsPath)

    if (!docsPathExists) {
      throw new Error(
        `A docs path was generated but does not point to a valid page or asset: '${generatedDocsPath}'.`
      )
    }
  }
}

function sanitizeChassisDocsPathForValidation(inputPath: string) {
  // Remove the hash part of the path if any.
  let sanitizedInputPath = inputPath.split('#')[0]

  // Append the `index.html` part if the path doesn't have an extension.
  if (!sanitizedInputPath.includes('.')) {
    sanitizedInputPath = path.join(sanitizedInputPath, 'index.html')
  }

  return sanitizedInputPath
}
