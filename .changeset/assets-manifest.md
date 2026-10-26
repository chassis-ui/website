---
'@chassis-ui/docs': minor
---

**Breaking.** The head links the web app manifest of the docs build of `chassis-assets`, `other/manifest.json` under the static path, in place of `images/manifest.json`, which each site provided itself. chassis-assets added it in `v0.5.0` of `app/docs` on 2026-10-23, with a maskable icon. A site moves its `vendor/assets` submodule to `v0.5.0` or later with `pnpm sync-submodules`, and deletes its own `images/manifest.json`; with an earlier commit the page links a manifest that is not there. The starter keeps a manifest with its own name at `static/other/manifest.json`. See [UPGRADING.md](https://github.com/chassis-ui/website/blob/main/packages/docs/UPGRADING.md#from-010-to-011).
