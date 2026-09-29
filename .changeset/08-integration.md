---
'@chassis-ui/docs': minor
---

Add the `chassisDocs()` integration, at `@chassis-ui/docs/integration`. It reads `config.yml` and `data/sidebar.yml`, sets `site` and `markdown`, imports the shortcodes into MDX files and checks `[[docsref:]]` links. It finds every file from the Astro root, so the working directory of the build does not matter.
