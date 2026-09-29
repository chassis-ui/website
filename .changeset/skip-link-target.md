---
'@chassis-ui/docs': patch
---

The "Skip to main content" link of the header has a target on every page. `BaseLayout` gives its `<main>` the id `content`, which only the docs layout had set, on its title. A page that fills the `main` slot of `BaseLayout` sets the id on an element of its own.
