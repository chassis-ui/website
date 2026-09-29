---
'@chassis-ui/docs': minor
---

The integration puts the default `chassis-tokens` of `@chassis-ui/css`, in its `scss/vendor` folder, on the Sass load path, after the site's own load paths. A site can delete the load path it set for it. A site with tokens of its own keeps the folder of its `_chassis-tokens.scss` in its config.
