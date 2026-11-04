---
'@chassis-ui/docs': minor
---

**Breaking.** `getChassisIconsFsPath()` returns the `dist/web` folder of `@chassis-ui/website-icons`, where the icons of the Chassis sites moved, with the same files and icon names. `@chassis-ui/icons` becomes the builder of icon sets from 0.4.0, holds no icons, and there is no fallback to it. The helper returned the root of `@chassis-ui/icons`, and a site joined `icons` to it: a site copies the folder that the helper returns into `static/icons`, and a `dir` names that folder too. The URLs under `/static/icons/` do not change. See UPGRADING.md.
