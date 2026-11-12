import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { getChassisAssetsFsPath, getChassisTokensFsPath } from '@chassis-ui/docs'

/**
 * The second brand of the brand preview on the home page (the Switch section). The page never
 * names it: its cards read "Your Brand".
 */
export const previewBrand = 'sinefil'

/** The class that scopes the preview brand's CSS. */
export const previewBrandClass = 'home-brand-preview'

/** URL paths, under the static path of the site, of the files the preview loads. */
export const previewBrandFiles = {
  css: `brands/${previewBrand}/brand.css`,
  fonts: `brands/${previewBrand}/fonts/fonts.css`
}

/**
 * Writes the CSS and the fonts of the preview brand into `destination` (the `static` folder
 * of `public`): the custom properties and the components the Switch cards use, compiled from
 * the tokens of the brand and scoped to `previewBrandClass`, and the fonts of its assets.
 */
export function writeBrandPreview({ root, destination }: { root: string; destination: string }) {
  const tokens = path.join(path.dirname(getChassisTokensFsPath({ root })), previewBrand, 'main')
  const assets = path.join(path.dirname(getChassisAssetsFsPath({ root })), previewBrand)
  const fonts = path.join(assets, 'fonts')

  if (!fs.existsSync(fonts)) {
    throw new Error(
      `The assets of the brand '${previewBrand}' are missing in ${assets}. Run pnpm vendor.`
    )
  }

  fs.cpSync(fonts, path.join(destination, path.dirname(previewBrandFiles.fonts)), {
    recursive: true
  })

  const options = {
    root,
    tokens,
    selector: `.${previewBrandClass}`,
    file: path.join(destination, previewBrandFiles.css)
  }

  try {
    execFileSync(
      process.execPath,
      [path.join(root, 'src/libs/brand-preview-css.js'), JSON.stringify(options)],
      { stdio: 'inherit' }
    )
  } catch (error) {
    throw new Error(`Could not compile the CSS of the brand '${previewBrand}'.`, { cause: error })
  }
}
