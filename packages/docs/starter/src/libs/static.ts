import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'
import {
  getChassisAssetsFsPath,
  getChassisCSSFsPath,
  getChassisIconsFsPath
} from '@chassis-ui/docs'

/**
 * Copies the files that the layouts link to under `/static/` into `public/static/`:
 *
 * - the logo, favicons, fonts and social image, from the docs build of `chassis-assets`. A
 *   site has it as the `vendor/assets` submodule, on the `app/docs` branch of
 *   https://github.com/chassis-ui/assets
 * - the CSS of `@chassis-ui/css`
 * - the icon font and sprite of `@chassis-ui/icons`
 * - the site's own files, from `static/`: a web app manifest with the starter's name, in
 *   place of `other/manifest.json` of the docs build. They are copied last, so one replaces
 *   a file of the same name
 */
export function chassisStatic(): AstroIntegration {
  let root: string
  let publicDir: string

  return {
    name: 'chassis-static',
    hooks: {
      'astro:config:setup': ({ config }) => {
        root = fileURLToPath(config.root)
        publicDir = fileURLToPath(config.publicDir)
      },
      'astro:config:done': () => {
        const destination = path.join(publicDir, 'static')

        fs.rmSync(destination, { force: true, recursive: true })
        fs.mkdirSync(destination, { recursive: true })
        fs.cpSync(getChassisAssetsFsPath({ root }), destination, { recursive: true })
        fs.cpSync(getChassisCSSFsPath({ root }), destination, { recursive: true })
        fs.cpSync(
          path.join(getChassisIconsFsPath({ root }), 'icons'),
          path.join(destination, 'icons'),
          { recursive: true }
        )
        fs.cpSync(path.join(root, 'static'), destination, { recursive: true })
      }
    }
  }
}
