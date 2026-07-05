import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

// Virtual module URL served by Vite's module graph at /@id/__x00__chassis-bundle.
// Used to give the browser a single shared ESM instance of the chassis bundle in dev.
const CHASSIS_BUNDLE_VIRTUAL_URL = '/@id/__x00__chassis-bundle'

/**
 * Vite plugin that resolves `@chassis-ui/css` to a virtual module in dev so
 * both the `<script>` tag and any `import()` share one ESM instance.
 *
 * In build, `rollupOptions.external` + `paths` in the consuming `astro.config.ts`
 * handles deduplication instead.
 *
 * @param getChassisCSSFsPath - Returns the absolute path to the compiled Chassis CSS dist folder.
 */
export function chassisBundlePlugin(getChassisCSSFsPath: () => string) {
  return {
    plugin: {
      name: 'chassis-ui-css',
      enforce: 'pre',
      apply: 'serve',
      resolveId(id: string) {
        if (id === '@chassis-ui/css') return '\0@chassis-ui/css'
        if (id === '/@chassis-bundle') return '\0chassis-bundle'
      },
      load(id: string) {
        if (id === '\0@chassis-ui/css') return `export * from "/@chassis-bundle"`
        if (id === '\0chassis-bundle') {
          const bundlePath = path.join(getChassisCSSFsPath(), 'js/chassis.bundle.js')
          const content = fs.readFileSync(bundlePath, 'utf-8')
          // Strip sourceMappingURL — the map isn't resolvable from a virtual module URL.
          return content.replace(/^\/\/# sourceMappingURL=.+$/m, '')
        }
      }
    } satisfies Plugin,
    // __CHASSIS_JS_SRC__ is a @chassis-ui/docs extension point: sets the URL for the
    // chassis JS <script> tag in dev mode. Points at the virtual module so the browser
    // gets one shared ESM instance instead of a second copy from public/.
    define: {
      'globalThis.__CHASSIS_JS_SRC__': JSON.stringify(CHASSIS_BUNDLE_VIRTUAL_URL)
    }
  }
}
