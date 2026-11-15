---
'@chassis-ui/docs': patch
---

`CHASSIS_BRAND` and `CHASSIS_APP` are read from `.env.local` in the root of the repository too, after the environment, as `CHASSIS_ASSETS_CHECKOUT` is, so a developer who previews another brand for a while keeps it there and every command takes it: `chassis-docs vendor`, the asset and token paths, `writeBrandCSS()` and the Sass tokens of the integration. Astro does not put that file in `process.env`, so `getChassisBrand()` reads it. An empty value in the environment, as in `CHASSIS_BRAND= pnpm dev`, turns the file off for one command. `vendor` and `writeBrandCSS()` print a warning that names the settings the file holds.

`CHASSIS_COMPILE_CSS=true`, in the environment or in `.env.local`, compiles `css/chassis.css` and `css/chassis.min.css` for the default brand too, from the `@chassis-ui/website-tokens` that the site installs, in place of the files of `@chassis-ui/css`, for work with tokens newer than those of the release of the CSS. The Sass tokens of the integration follow it. Another value than `true`, `false`, `1` or `0` fails the build.

`chassis-docs vendor --all` unpacks the archive of every brand that `vendor/assets.json` has for the app of the build, the brand of the build first, for a site that shows more than one brand, and `getPinnedBrands()` returns those brands by name. So a site names no brand but the default one in its scripts or code. The docs use `acme` as a placeholder for the name of another brand.
