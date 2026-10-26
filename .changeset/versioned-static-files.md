---
'@chassis-ui/docs': patch
---

The head links the Chassis CSS, `icons/chassis-icons.css` and `fonts/fonts.css` with `?v=` and the first 8 characters of the MD5 hash of the file, and the `<Icon>` shortcode, the icons of `<Example>` and `<ResizableExample>`, the search results and the color mode button of the examples load the sprite the same way: `/static/css/chassis.min.css?v=8e2106f6`. A new file is a new URL, so a host can let the browser keep these files for good, and a new CSS reaches a visitor with the pages that need it. The hash is read from the file of the site's `public` directory at the path of the URL; without that file the URL has no version, as before. `getVersionedStaticPath(file)` of `@chassis-ui/docs/site` returns such a URL, `replaceIconsInHtml()` takes the sprite as a third argument, and `virtual:chassis-docs/static` exports `spritePath`.
