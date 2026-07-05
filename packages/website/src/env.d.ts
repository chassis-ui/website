/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '@chassis-ui/css'
declare module 'postcss-prefix-custom-properties'

interface ImportMetaEnv {
  readonly VERCEL?: string
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv
}
