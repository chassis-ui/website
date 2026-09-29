---
'@chassis-ui/docs': minor
---

**Breaking.** `exports` lists the supported import paths only: the root entry, `integration`, `schema`, `site`, the four layouts and six components by name, `shortcodes/*`, `js/*`, `scss/main` and `scss/vars`. These no longer resolve: `libs/*`, the other partials under `scss/`, the folders under `layouts/`, and `components/shortcodes/*`. Import a shortcode as `@chassis-ui/docs/shortcodes/Icon.astro`.
