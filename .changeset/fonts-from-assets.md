---
'@chassis-ui/docs': minor
---

**Breaking.** The pages load their fonts from the site's own static files, no longer from Google Fonts. `Head.astro` links `fonts/text.css`, `fonts/display.css` and `fonts/code.css` under the static path, `/static/` by default, in place of the Google Fonts stylesheet and the `preconnect` links to `fonts.googleapis.com` and `fonts.gstatic.com`. The three stylesheets and the font files they load are in the docs build of `chassis-assets`, which a site copies into `static/` already. A site moves its `vendor/assets` submodule to `77912ed` of `app/docs` or later, with `pnpm sync-submodules`: from that commit the stylesheets declare Inter, Archivo Narrow and Fira Code as variable fonts, with every weight the styles use. With an older commit they declare four weights of each family. A site that does not copy the docs build provides the three stylesheets itself.
