---
'@chassis-ui/docs': minor
---

The sections of a package home page are components, under `@chassis-ui/docs/sections/`: `Hero`, `Section`, `Rows`, `Steps`, `Cards`, `Doors`, `Facts` and `RailItem`. A page lists the sections it needs in its own order, and puts a section of its own inside a `<Section>`, so it lines up with the others. They are the sections of the home page of chassis-ui.com, which now uses them. See "Home page sections" in the README; the home page of the starter site has all of them.

`Hero` takes a `kicker` and a `command`, a line with a copy button, beside the claim, the lead and its slots. A hero with nothing under its row ends with the padding it starts with (96px, 64px on phones); one with a rail under it, as on chassis-ui.com, keeps 24px. Its `illustration` names an SVG of the static files, which it inlines: the heroes of the Chassis sites are `images/illustrations/hero-<name>.svg` of chassis-ui/website-assets, so a site needs a release of the assets that has them. The components load their styles (`@chassis-ui/docs/scss/sections`). `@chassis-ui/docs/scss/motion` and `@chassis-ui/docs/scss/backdrop` give a site's own stylesheets the timing of the motion and the backdrop of a dark band, and `@chassis-ui/docs/js/reveal.js` plays the motion of what scrolls into view.

The copy button of a code block shows its check mark again: `initCopyButtons()` kept the path of the sprite file when it changed the icon.

`chassis-docs vendor` reads `CHASSIS_ASSETS_CHECKOUT` from `.env.local` in the root of the repository too, after the environment, so a developer keeps the path of their checkout of the assets there and every run copies its build. A path that is not absolute is from the root, where it was from the working directory. The copy is complete before it replaces the old one, and the removal of the old folder is tried again when macOS writes a file into it, which failed the command with `ENOTEMPTY`.

The eyebrows, the kicker and the meta line of the hero, and the labels of rows, steps, cards and doors are set in capitals with CSS (`text-uppercase`): write them in normal case. `Cards` names its action `Explore` by default.

`Section` and `Hero` take their title and lead as text or as markup, in the `title` and `lead` slots: a word in italics, a highlighted word or line (`<mark>`, in the highlight colour of the design) or a link. Each `<span>` child of a title is a line that breaks from `lg`.
