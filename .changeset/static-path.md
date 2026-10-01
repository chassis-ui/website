---
'@chassis-ui/docs': patch
---

Add the `staticPath` key of `config.yml`: the URL path that the pages load the static files from, `/static` by default. A site that is served under a path of another host, such as `chassis-ui.com/css`, sets it to `/css/static` and rewrites that path to `/static`, so that its files no longer depend on the `Referer` header to be found. The layouts, the `Icon` shortcode and the scripts of the package use it, and `getStaticPath()` of `@chassis-ui/docs/site` returns a URL under it for the site's own files. See [A site under a prefix](https://github.com/chassis-ui/website/tree/main/packages/docs#a-site-under-a-prefix) in the README.
