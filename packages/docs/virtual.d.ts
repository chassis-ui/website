// Modules that the integration provides. A site gets these declarations from the
// integration. This file is for type-checking the package on its own.

declare module 'virtual:chassis-docs/config' {
  const config: import('./src/libs/schema').ChassisConfig
  export default config
}

declare module 'virtual:chassis-docs/sidebar' {
  const sidebar: import('./src/libs/schema').Sidebar
  export default sidebar
}

declare module 'virtual:chassis-docs/paths' {
  /** The site's root. */
  export const root: string
  /** The site's `public` directory. */
  export const publicDir: string
  /** The directory that `file` props are relative to. */
  export const sourceDir: string
  /** The directory of `@chassis-ui/docs`. */
  export const packageRoot: string
}

declare module 'virtual:chassis-docs/static' {
  /** `staticPath` of the config, for scripts that run in the browser. */
  export const staticPath: string
}

declare module 'virtual:chassis-docs/styles' {}
