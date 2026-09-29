---
'@chassis-ui/docs': patch
---

The package installs a `chassis-docs` command with the build steps that every Chassis site shares, so that a site no longer needs its own copies of them. `chassis-docs vendor` builds the `vendor/assets` submodule at the pinned commit. `chassis-docs sync-submodules` moves it to the latest `app/docs` and builds it, and works on a fresh CI checkout too. `chassis-docs html-validate` and `chassis-docs vnu` validate the built HTML. The two validators need `html-validate` and `vnu-jar`, which are optional peer dependencies. See [Commands](https://github.com/chassis-ui/website/tree/main/packages/docs#commands) in the README.
