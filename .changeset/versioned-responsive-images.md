---
'@chassis-ui/docs': patch
---

`<ResponsiveImage>` links both files of an image with `?v=` and the hash of the file in the site's `public` directory, like the shared stylesheets, so a host can let the browser keep them for good. A path without a file in `public` is linked as before. `getVersionedPublicPath(urlPath)` of `@chassis-ui/docs/site` versions a URL path that a page or a prop already holds, such as `/static/images/home/hero.webp`.
