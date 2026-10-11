# Vanilla HTML example

A single HTML page styled with Chassis CSS and Chassis Icons. It uses no framework
and no bundler, and it is built once per brand: the same page with the design tokens,
the fonts and the logo of each brand.

The page shows:

- context classes that re-color a card and its content
- a contact form built from form fields, with a small script that shows a sent
  state
- button and badge sizes and styles
- icon font glyphs in buttons and cards
- the fonts and the logo of the brand

## Brands

`chassis.build.brands` of `package.json` names the brands:

```json
{
  "chassis": {
    "build": {
      "brands": ["chassis", "sinefil"]
    }
  }
}
```

The build writes each brand to `dist/<brand>/`, and the website serves it at
`/examples/vanilla-html/<brand>/`. `dist/index.html` sends a visitor to the first brand of
the list.

To add or remove a brand, change the list. A brand has to exist in `@chassis-ui/tokens`
and in chassis-assets under the same name.

## What the build does

The source is in `src/`, the same files for every brand. `build.js` copies it to the
output of each brand, together with:

| Folder                | Files                                                                               | From                |
| --------------------- | ----------------------------------------------------------------------------------- | ------------------- |
| `vendor/css/`         | Chassis CSS, compiled from its Sass source with the tokens of the brand             | `@chassis-ui/css`   |
| `vendor/fonts/`       | `text.css`, `display.css` and `code.css`, the font files they load and the licenses | chassis-assets      |
| `vendor/images/logo/` | The logo of the brand                                                               | chassis-assets      |
| `vendor/icons/`       | The icon font stylesheet and its font files                                         | `@chassis-ui/icons` |

The files have the same names in every brand, so the page links the same paths whatever
the brand.

`chassis.min.css` in `dist/css/` of `@chassis-ui/css` is the `chassis` brand. A page that
needs no other brand links that file and compiles nothing. For another brand the CSS is
compiled as [Sass customization](https://chassis-ui.com/css/docs/customize/sass/)
describes: a `_chassis-tokens.scss` on the Sass load paths, which forwards the tokens of
the brand, then PostCSS for the `--cx-` prefix of the custom properties. The build of this
example has several brands, so it answers `chassis-tokens` with a Sass importer in place
of one file per brand.

chassis-assets is not on npm. Here it is the `vendor/assets` submodule of the repository,
and the build runs its command for the fonts and the logos of the brands. Outside this
repository, take the archive of a brand from a
[release of chassis-assets](https://github.com/chassis-ui/assets/releases).

## Build

From the repository root:

```sh
pnpm install
pnpm vendor
pnpm --filter chassis-example-vanilla-html build
```

`pnpm vendor` checks out the `vendor/assets` submodule with its Git LFS files, and
installs the package that subsets the fonts: the build keeps the characters of the
languages that are written in Latin letters, in a file per range that a page loads when
it has a character of the range. It is needed once, and again when the submodule moves.

Then open `dist/chassis/index.html` or `dist/sinefil/index.html` in a browser.
