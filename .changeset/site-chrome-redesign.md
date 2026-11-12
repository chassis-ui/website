---
'@chassis-ui/docs': minor
---

The navbar, the footer and the docs layout follow the 2026-11 redesign of chassis-ui.com, in a `container 2xl`. The navbar is a full-width bar with one bottom border: the logo, a Packages menu with the six packages, Docs, Examples, Blog and About, the search field, the Figma and GitHub links and the theme menu. The indicator of the active link sits on the border of the bar. Below `lg` it shows the logo, a search button and a menu button that opens a navigation drawer with the same links and the theme menu. The footer has the logo and a line about Chassis, the Docs, GitHub and Project columns, and the copyright with the Privacy and Cookie settings links on a hairline. The docs layout sits in a `container 2xl` instead of a fluid one, and "View on GitHub" is a medium button with the GitHub icon.

`<ThemeToggler>` takes `label`, `placement` and `class`, and a page can hold more than one: `color-modes.js` keeps every `[data-cxd-theme-toggler]` in step. The ids `cxd-theme` and `cxd-theme-text` are gone; a site that styled them uses `.cxd-theme-toggler` and `[data-cxd-theme-text]`.

`writeBrandCSS()` of `@chassis-ui/docs/integration` takes `defaultBrand: true` to compile the files of `@chassis-ui/css` for the default brand too, from the `@chassis-ui/website-tokens` that the site installs, when that is newer than the one the files were built with.
