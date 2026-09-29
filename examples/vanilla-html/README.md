# Vanilla HTML example

A single HTML page styled with Chassis CSS and Chassis Icons. It uses no framework
and no bundler.

The page shows:

- context classes that re-color a card and its content
- a contact form built from form fields, with a small script that shows a sent
  state
- button and badge sizes and styles
- icon font glyphs in buttons, cards and the header

The source is in `src/`. The build copies it to `dist/`, together with
`chassis.min.css` from `@chassis-ui/css` and the icon font stylesheet and font
files from `@chassis-ui/icons`.

## Build

From the repository root:

```sh
pnpm install
pnpm --filter chassis-example-vanilla-html build
```

Then open `dist/index.html` in a browser.

The website serves this example at `/examples/vanilla-html/`.
