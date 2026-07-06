# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.6] - 2026-07-06

### Fixed

- Multi-site search no longer breaks entirely when a sibling Chassis site's Pagefind index is unreachable (bad deploy, rollout still in progress across the separate repos). Previously `mergeIndex` was passed up front and a single failed merge threw and corrupted the shared instance for every future search, including the current site's own results. Now the current site's own index loads first, and each sibling is probed — both its `pagefind-entry.json` and the language-specific `pagefind.<hash>.pf_meta` chunk `init()` actually requests — before `mergeIndex` is attempted, so an unreachable sibling is skipped instead of taking down search
- The site filter dropdown (`cxd-search-filter`) is now always rendered instead of only when other sites were successfully merged in at load time
- Search result item icons now reference the shared icon sprite (`/static/icons/chassis-icons.svg#…`) instead of a bare `#id` fragment, which resolved against the current page instead of the sprite
- Removed the unused `vite` devDependency from `@chassis-ui/docs`; it only backed the `chassisBundlePlugin` removed in 0.3.4 and had no remaining imports
- `@pagefind/component-ui` is no longer marked `optional` in `peerDependenciesMeta` — every docs layout unconditionally renders the search dialog and imports it, and every consuming site already installs it directly, so it was never actually optional
- `README.md`: corrected the peer dependencies list (was just `astro: ^5.0.0`; now matches the full, actual `package.json` peer set) and the `@chassis-ui/docs` exports table, which was missing `highlight`, `markdown`, `placeholder`, `shortcodes`, `site` and listed a nonexistent `chassis` module

### Changed

- Refactored `search.js`: renamed the `renderItem` params `title`/`excerpt` to `titleHtml`/`excerptHtml` to make explicit that callers must pass pre-escaped/pre-marked HTML, and extracted `renderResultsList` and `addListeners` helpers to remove repeated markup and bind/track/remove boilerplate across the custom elements

## [0.3.5] - 2026-07-06

### Added

- Multi-site Pagefind search: the docs search dialog now merges every Chassis project's index (`website`, `tokens`, `css`, `assets`, `icons`, `figma`) into one site-filterable search with a new site filter dropdown (`cxd-search-filter`) to scope results to a single project or "Everywhere"

### Changed

- `_search.scss` rules moved into `@layer custom` to fix cascade ordering against `@chassis-ui/css`
- `pagefind.yml`: added `root_selector: "main"` so indexing skips shared chrome (nav, footer) and only picks up page content

### Fixed

- `packages/website/src/scss/home.scss`: removed unused `docs`/`@chassis-ui/css/scss/config` imports and a leftover `background-image` override on `.module-item`, and dropped an unnecessary `#{calc(...)}` interpolation
- `HeroSection.astro`: added missing whitespace between the two `<h1>` text segments

## [0.3.4] - 2026-07-05

### Fixed

- Removed the dev-mode virtual-module Vite plugin (`chassisBundlePlugin`) that resolved `@chassis-ui/css` to a fake module in `Scripts.astro`. Vite's `optimizeDeps` pre-bundling of `@chassis-ui/docs/js/example-mode.js` ran before the plugin's `resolveId`/`load` hooks could apply, inlining a second, un-deduped copy of every `@chassis-ui/css` component — duplicate `document`-level `data-cx-toggle`/`data-cx-dismiss` click handlers, causing modal/drawer/etc. to double-toggle in consumers' dev servers
- `Scripts.astro` now loads Chassis JS with a plain `import '@chassis-ui/css'` instead of a hand-computed dev/prod `<script is:inline>` src. Consumers who install `@chassis-ui/css` as a real dependency (e.g. `packages/website`) need no special config — the import resolves normally and Vite's own dependency optimizer dedupes it. Consumers who self-host `@chassis-ui/css` (i.e. *are* that package) need to alias it to their own build output in dev themselves — see chassis-css's own `site/src/libs/astro.ts` for the pattern
- `packages/website/src/libs/astro.ts`: removed a call to the now-removed `chassisBundlePlugin`
- `packages/website/astro.config.ts`: removed a dead `rollupOptions.external`/`output.paths` pair that never applied — Astro 7.0.6's client build config only reads the `output` sub-key of `rolldownOptions`, never `external`, so `@chassis-ui/css` was never actually externalized despite the config implying it was
- Worked around a `@chassis-ui/css` bug (fixed upstream in `@chassis-ui/css@0.3.2`) where a missing `sideEffects` entry for its package entry point let bundlers tree-shake away components nobody imported by name (`Dialog`, `Drawer`, `Accordion`, etc.), breaking modal/drawer in `packages/website`'s production build

## [0.3.3] - 2026-07-05

### Fixed

- Corrected an incorrect `@chassis-ui/css` peer dependency version on `@chassis-ui/docs`

## [0.3.2] - 2026-07-05

### Fixed

- `<ScssDocs>` no longer drops rules when a compiled snippet mixes plain declarations with directives that emit their own selectors (e.g. `@each`); sentinel unwrapping now walks brace depth instead of matching a single block
- `<ScssDocs>` Sass compilation now resolves bare npm specifiers (e.g. `@chassis-ui/tokens/...`) by adding `node_modules` to `loadPaths`
- `change-version` script no longer bumps the root `package.json` version, which was unused and unrelated to the published `@chassis-ui/docs` version

## [0.3.1] - 2026-07-05

### Fixed

- Moved `@chassis-ui/docs`'s runtime-only dependencies (`image-size`, `github-slugger`, `remark`, `remark-html`, `mdast-util-from-markdown`, `mdast-util-to-string`, `unist-util-visit`) from `devDependencies` to `dependencies`, since consumers couldn't resolve them under `devDependencies`
- Bumped the `htmlparser2` and `sass` peer dependency ranges on `@chassis-ui/docs` to match the versions consumers actually install

## [0.3.0] - 2026-07-04

### Added

- Pagefind-powered site search, replacing the Algolia search integration
- New `Icon` component for docs/website, replacing ad-hoc icon markup across shortcodes and pages, with accessibility improvements (proper SVG titles, ARIA handling)
- New `Code`, `Example`, `ResizableExample`, and `ScssDocs` shortcode components, and a `clipboard.ts` utility for copy-to-clipboard in code blocks

### Changed

- Large-scale Chassis CSS update and SCSS variable reorganization across the docs and website packages
- Upgraded dependencies and refreshed the lockfile
- Reworked Astro config, shortcode registration, and homepage section components to match the updated design system
- Moved `example-mode.js` from the website package into docs.
- Removed the old `icon-loader.js`, `Icon` component uses path to SVG sprite
- Replaced Prism-based syntax highlighting with Shiki
- Removed the Algolia search plugin
- Rewrote reference docs to reflect the current setup
- Cleaned up code and removed unused website dependencies

### Fixed

- Astro type-check errors across docs/website pages
- `sync-submodules` build script

## [0.2.0] - 2026-05-03

### Added

- Updated test pages and containers/responsive utilities

### Changed

- Updated Chassis CSS

### Fixed

- CI workflow fixes and linting issues
- `placeholder.ts` fix

## [0.1.10] - 2026-04-28

### Added

- Staging branch deployment support
- Coming soon page for the main branch
- Docs test page and sitemap filter updates

### Changed

- Improved blog and updated layouts
- Bumped docs package version

### Fixed

- Vercel deployment configuration
- vnu (HTML validator) errors and path ignoring in `vnu-jar.js`
- Linting errors

## [0.1.0] - 2025-08-24

### Added

- Initial project setup: Astro-based website, docs package, and Chassis UI vendor submodule
- Build-time icon integration, submodule configuration, and initial CI workflows

[0.3.2]: https://github.com/chassis-ui/website/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/chassis-ui/website/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/chassis-ui/website/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/chassis-ui/website/compare/v0.1.10...v0.2.0
[0.1.10]: https://github.com/chassis-ui/website/compare/v0.1.0...v0.1.10
[0.1.0]: https://github.com/chassis-ui/website/releases/tag/v0.1.0
