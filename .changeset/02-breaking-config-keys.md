---
'@chassis-ui/docs': minor
---

**Breaking.** The keys of `config.yml` are camelCase: `currentVersion`, `githubOrg`, `figmaHandle`, `xUsername` and `analytics.googleId`. An old name fails the build with a message that names the new one. The `docsDir` key is removed: the site root is the Astro root.
