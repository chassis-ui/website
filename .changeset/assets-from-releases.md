---
'@chassis-ui/docs': minor
---

**Breaking.** `chassis-docs vendor` takes the assets from a release of `chassis-ui/website-assets` in place of building a `vendor/assets` submodule. A site pins the release in `vendor/assets.json`, with the SHA-256 of each web archive; the command downloads the archive once into a cache outside the repository, checks it against the pin, and unpacks it into `vendor/assets/dist/web/<app>/<brand>`. `chassis-docs sync-assets [--version] [--repository]` replaces `chassis-docs sync-submodules`, and writes the pin. The `--subset`, `--split`, `--no-split` and `--branch` options and the `SUBMODULE_BRANCH` variable are gone: a release has made that choice. `CHASSIS_ASSETS_CHECKOUT` names a local checkout of the assets, whose build is copied instead. See UPGRADING.md.

A build can be for another brand or app, for a preview: `CHASSIS_BRAND` and `CHASSIS_APP` override `brand` and `app` of the pin, and `getChassisBrand()` returns them. `getChassisAssetsFsPath()`, `getChassisTokensFsPath()` and the Sass tokens of the integration follow them, and `writeBrandCSS()` of `@chassis-ui/docs/integration` compiles Chassis CSS for a brand other than `chassis`, over the files of the package. For that it needs the new optional peers `postcss`, `autoprefixer` and `postcss-prefix-custom-properties`. A build of the default brand is unchanged and needs none of them.
