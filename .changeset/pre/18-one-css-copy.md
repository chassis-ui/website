---
'@chassis-ui/docs': patch
---

The scripts of the package and of the site share one copy of `@chassis-ui/css`. In the dev server of a site that installed the package, `example-mode.js` was pre-bundled with a copy of its own, which registered every listener twice: a dialog opened and closed at once. The integration keeps both packages out of pre-bundling and dedupes `@chassis-ui/css`, so a site needs no alias for it.
