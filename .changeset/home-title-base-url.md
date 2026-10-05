---
'@chassis-ui/docs': patch
---

The home page of a site under a path gets the home form of the title, `title · subtitle`. The layouts took the page at `/` as the home page, so a site with `baseURL` `https://chassis-ui.com/css/` never got it: its home page is at `/css/`. The home page is now the page at the path of `baseURL`. The title of such a home page changes with this release, and the `title` prop of its layout is used for the social tags only. Keep `title · subtitle` within 70 characters where the site validates its HTML.
