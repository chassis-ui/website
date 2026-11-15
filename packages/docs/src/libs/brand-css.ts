import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { compilesChassisCSS, getFileSettings, SETTINGS_FILE } from './brand.js'
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
 * does nothing for the default brand, unless `CHASSIS_COMPILE_CSS` is set, in the environment or
 * in `.env.local`: then it compiles them from the tokens that the site installs, such as a newer
 * `@chassis-ui/website-tokens` than the one of the release of the CSS.
 */
export function writeBrandCSS({
  root = process.cwd(),
  destination
}: {
  root?: string
  destination: string
}): void {
  if (!compilesChassisCSS({ root })) return

  const { brand, app } = getChassisBrand({ root })
  const settings = getFileSettings({ root })
  const options = {
    loadPaths: [getBrandTokensLoadPath(root), ...getNodeModulesFsPaths(root)],
    cssDir: getInstalledPackageFsPath('@chassis-ui/css', root),
    destination,
    label: `the brand '${brand}' and the app '${app}'`,
    // A setting left in the file is easy to forget, so the build says it has one.
    warning: settings.length ? `${SETTINGS_FILE} sets ${settings.join(' and ')}.` : undefined
  }
  const script = path.join(getPackageRoot(), 'src/cli/brand-css.js')

  try {
    execFileSync(process.execPath, [script, JSON.stringify(options)], { stdio: 'inherit' })
  } catch (error) {
    throw new Error(`Could not compile Chassis CSS for the brand '${brand}'.`, { cause: error })
  }
}
