import { execFileSync } from 'node:child_process'
import path from 'node:path'
import {
  getBrandTokensLoadPath,
  getChassisBrand,
  getInstalledPackageFsPath,
  getNodeModulesFsPaths,
  getPackageRoot
} from './paths'

/**
 * Compiles `css/chassis.css` and `css/chassis.min.css` into `destination` for the brand of the
 * build, over the files of `@chassis-ui/css`, which hold the tokens of the default brand. It
 * does nothing for the default brand.
 */
export function writeBrandCSS({
  root = process.cwd(),
  destination
}: {
  root?: string
  destination: string
}): void {
  const { brand, isDefault } = getChassisBrand({ root })

  if (isDefault) return

  const options = {
    loadPaths: [getBrandTokensLoadPath(root), ...getNodeModulesFsPaths(root)],
    cssDir: getInstalledPackageFsPath('@chassis-ui/css', root),
    destination
  }
  const script = path.join(getPackageRoot(), 'src/cli/brand-css.js')

  try {
    execFileSync(process.execPath, [script, JSON.stringify(options)], { stdio: 'inherit' })
  } catch (error) {
    throw new Error(`Could not compile Chassis CSS for the brand '${brand}'.`, { cause: error })
  }
}
