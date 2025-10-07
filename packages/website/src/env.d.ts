/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly VERCEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
