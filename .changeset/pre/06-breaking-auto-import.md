---
'@chassis-ui/docs': minor
---

**Breaking.** `chassisAutoImport()` takes `{ root, dir, include, exclude }` and returns `{ imports, typeDefinitions, plugin }`. It finds the package's shortcodes from the package's own location, and the type declarations go to `.astro/`, not to `src/types/auto-import.d.ts`. Its `docsPath` and `modulesPath` options and its `integration()` are removed.
