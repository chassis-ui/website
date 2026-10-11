---
'@chassis-ui/docs': minor
---

`chassis-docs vendor` and `chassis-docs sync-submodules` take `--subset <range>`, repeatable: the fonts of the docs build of `chassis-assets` are written with the characters of the ranges only, such as `--subset latin --subset latin-ext`, and a page downloads smaller font files. With the fonts of the site served from its static files, `text.woff2` goes from 349 KB to 208 KB with these two ranges, and `code.woff2` from 109 KB to 44 KB. A character outside the ranges is drawn with the next font of the font stack. With the option the commands run `pnpm install --filter ./packages/assets --prod` in the submodule, in place of `pnpm install --ignore-workspace`, since the build loads a package to subset a font. Without the option nothing changes.
