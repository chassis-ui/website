---
'@chassis-ui/docs': minor
---

**Breaking.** `getChassisTokensFsPath()` finds the docs build of `@chassis-ui/website-tokens`, where the tokens of the Chassis sites moved, with the same `dist/` layout and token names. `@chassis-ui/tokens` becomes the builder of token repositories, and there is no fallback to it: a site that calls the helper without `dir` and has only the old package installs `@chassis-ui/website-tokens`, or passes `{ dir: 'node_modules/@chassis-ui/tokens' }` while that package still ships `dist/`. The helper finds `dist/web/docs/chassis` only, and no longer `dist/tokens/web/docs/chassis`, which no supported version of css reads.

A site that passes `dir` with its own folder in the current layout, or has a `_chassis-tokens.scss` of its own, needs no change for this package. The integration does not change, and the peer range of `@chassis-ui/css` stays `>=0.10.0`. The package is built and tested with css 0.14.0, whose default token source needs `@chassis-ui/website-tokens` installed. See UPGRADING.md.
