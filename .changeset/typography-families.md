---
'@chassis-ui/docs': minor
---

**Breaking.** The package needs `@chassis-ui/css` 0.10.0 or later: the peer range was `>=0.6.0`. css 0.10 names the font families by their job and holds every text role in one group, and it removes the old Sass names without a deprecation step, so the styles of the package read `$font-lead` in place of `$font-context-lead`, and the footer and the docs sidebar use `.font-h6` and `.font-h5` in place of `.h6` and `.h5`, which css 0.10 deprecates. The roles keep their values, so the pages look as before. css 0.10 reads its tokens from the `@chassis-ui/tokens` that a site installs, which must be 0.10 too. See [UPGRADING.md](https://github.com/chassis-ui/website/blob/main/packages/docs/UPGRADING.md#from-08-to-09) for the dependencies and the names to replace in a site's own pages and styles: `.h1` to `.h6`, `.font-text`, the `--cx-*-text-*` and `--cx-*-html-*` properties and the `$font-context-*` maps.
