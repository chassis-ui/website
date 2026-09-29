# @chassis-ui/docs

## 0.6.0-next.0

### Minor Changes

- **Breaking.** The package no longer imports `@libs/config`, `@libs/content`, `@libs/data`, `@libs/path`, `@libs/clipboard` or `@scss/docs.scss` from the site. A site adds the integration instead. [UPGRADING.md](https://github.com/chassis-ui/website/blob/main/packages/docs/UPGRADING.md) has the steps.
- **Breaking.** The keys of `config.yml` are camelCase: `currentVersion`, `githubOrg`, `figmaHandle`, `xUsername` and `analytics.googleId`. An old name fails the build with a message that names the new one. The `docsDir` key is removed: the site root is the Astro root.
- **Breaking.** Three more keys are camelCase: `iconColor` in `data/sidebar.yml`, and `added.showBadge` and `extraJs` in the frontmatter of docs pages. An old name fails the build.
- **Breaking.** The schema of `config.yml` is strict. An unknown key fails the build. It was dropped silently.
- **Breaking.** `exports` lists the supported import paths only: the root entry, `integration`, `schema`, `site`, the four layouts and six components by name, `shortcodes/*`, `js/*`, `scss/main` and `scss/vars`. These no longer resolve: `libs/*`, the other partials under `scss/`, the folders under `layouts/`, and `components/shortcodes/*`. Import a shortcode as `@chassis-ui/docs/shortcodes/Icon.astro`.
- **Breaking.** `chassisAutoImport()` takes `{ root, dir, include, exclude }` and returns `{ imports, typeDefinitions, plugin }`. It finds the package's shortcodes from the package's own location, and the type declarations go to `.astro/`, not to `src/types/auto-import.d.ts`. Its `docsPath` and `modulesPath` options and its `integration()` are removed.
- **Breaking.** `getSourceFsPath()`, `getSourceUrl()` and `getSiteFileUrl()` moved from `libs/source` to `@chassis-ui/docs/site`.
- Add the `chassisDocs()` integration, at `@chassis-ui/docs/integration`. It reads `config.yml` and `data/sidebar.yml`, sets `site` and `markdown`, imports the shortcodes into MDX files and checks `[[docsref:]]` links. It finds every file from the Astro root, so the working directory of the build does not matter.
- `@chassis-ui/docs/schema` exports the schemas of `config.yml`, the sidebar and the `docs` and `callouts` collections, with their types. A site extends `configSchema` for keys of its own.
- `@chassis-ui/docs/site` exports what pages read from the site: `getConfig()`, `getSidebar()`, `getDocsPath()`, `getDocsPages()`, `getCallout()`, the path and URL helpers, `getPackageFilePath()` and `createDataLoader()`.
- The root entry exports `loadConfig()`, `loadData()`, `loadSidebar()`, the remark plugins `remarkCxConfig` and `remarkCxDocsref`, and one implementation of `getChassisTokensFsPath()`, `getChassisAssetsFsPath()`, `getChassisCSSFsPath()` and `getChassisIconsFsPath()`.
- The integration puts the default `chassis-tokens` of `@chassis-ui/css`, in its `scss/vendor` folder, on the Sass load path, after the site's own load paths. A site can delete the load path it set for it. A site with tokens of its own keeps the folder of its `_chassis-tokens.scss` in its config.
- Add `include` and `exclude` options for the shortcodes. A shortcode of the site replaces the package's shortcode of the same name.
- Add `js/clipboard.ts`, which every site carried a copy of.
- `githubOrg`, `figmaHandle`, `xUsername` and `analytics.googleId` are optional. The header links, the X meta tags and Google Analytics are left out when their key is not set.
- `anchors`, `toc`, `siteBranch` and `sourceDir` have defaults.
- Add a versioning policy to the README, and make `scss/vars` a public partial.

### Patch Changes

- The scripts of the package and of the site share one copy of `@chassis-ui/css`. In the dev server of a site that installed the package, `example-mode.js` was pre-bundled with a copy of its own, which registered every listener twice: a dialog opened and closed at once. The integration keeps both packages out of pre-bundling and dedupes `@chassis-ui/css`, so a site needs no alias for it.
- `<ScssDocs>`, `<ScssDocsSimple>` and `<JsDocs>` stop at the end marker of the part they show. A part whose name starts another name, such as `make-col` and `make-col-auto`, ran on to the end of the longer one.
- A table of contents whose first heading is deeper than a later one, such as an `<h3>` before the first `<h2>`, nested the `<h2>` under the `<h3>`.
- Packages whose types the shipped source imports are dependencies, not development dependencies.
- The README links a starter site, `packages/docs/starter` in the repository, to copy as the start of a new Chassis docs site.

Up to 0.5.1, this repository kept one changelog for the package and the website, headed by the versions of the package. The entries below are that changelog. Changesets writes the entries of later versions.

## [0.5.1] - 2026-09-29

### Added

- `packages/docs`: four optional `config.yml` keys say where files live when a site is not built from the root of its repository: `sourceDir`, `sourcePath`, `sitePath` and `siteBranch`. A site that sets none behaves as before. See the package README.
- `packages/docs`: the README lists what a site must provide: the `@libs/*` modules, the `config.yml` keys and the `docs` content collection.
- `packages/docs`: the package ships its `LICENSE` and declares Astro's Node requirement in `engines`.

### Fixed

- `packages/docs`: `<ScssDocs>`, `<ScssDocsSimple>`, `<JsDocs>` and `<Code filePath>` read and link source files relative to `sourceDir` and `sourcePath`, so they work for a site in `packages/site` ([#2](https://github.com/chassis-ui/website/issues/2)).
- `packages/docs`: "View on GitHub" links to the page's own source file. It linked to `<repo>/blob/<id>.mdx`, which never existed ([#1](https://github.com/chassis-ui/website/issues/1)).
- `packages/docs`: the README named example imports that do not exist and an outdated `@chassis-ui/css` peer range.

### Changed

- Website: moved to `@chassis-ui/css` 0.5.2 and `@chassis-ui/tokens` 0.5.3, which changes colours, border radii and dark-mode backgrounds.
- Updated dependencies within their ranges, including Astro 7.3.5. This clears every `pnpm audit` advisory, including a critical one in Astro.
- The production build uses the `vendor/assets` commit pinned in this repository instead of the latest `app/docs`.
- CI builds the site and validates its HTML. The Lighthouse run works again.

### Removed

- Stale files: `PROJECT_REVIEW.md`, the multi-platform sync tooling under `build/`, and committed build output under `examples/`.

## [0.5.0] - 2026-09-19

### Changed

- Reworked breakpoint and sizing utility classes/tokens across `packages/docs` and `packages/website` to use the shorthand naming from the updated Chassis CSS (e.g. `large:px-xsmall` → `lg:px-xs`, `medium` → `md`), spanning layouts, components, shortcodes, SCSS partials, and page templates
- Bumped `@chassis-ui/css` and `@chassis-ui/tokens` peer dependencies to `^0.5.0`

## [0.4.0] - 2026-09-15

### Changed

- Bumped `@chassis-ui/css` and `@chassis-ui/tokens` to `^0.4.0`
- `packages/docs/src/scss/_sidebar.scss`: reworked subgroup label styling (uppercase, `--cx-font-size-xsmall`, `--cx-primary-fg-main` color, adjusted spacing) and the `::before` connector line selectors to correctly handle first-child/only-child/subgroup combinations
- `packages/docs/src/scss/_search.scss`: adjusted the search dialog's large-breakpoint offset from `13rem` to `11rem` (both LTR and RTL)
- `ThemeToggler.astro` and header nav links (`Navigation.astro`): replaced `px-0 large:px-small` with `px-0 large:px-xsmall`; `ThemeToggler` also gained a `caret` class
- `SearchDialog.astro`: renamed the search icon wrapper class from `input-help` to `input-adorn`

## [0.3.10] - 2026-07-21

### Added

- Blog link to the navbar

## [0.3.9] - 2026-07-19

### Added

- `packages/docs`: new `zoom.js` script — initialises `medium-zoom` on any element tagged `[data-zoomable]`; `medium-zoom` added as a dependency
- `packages/docs/src/libs/image.ts`: new `getRemoteImageSize()` helper that fetches a remote image at build time and returns its pixel dimensions; used by `Social.astro` for CDN-hosted thumbnails
- `packages/docs/src/layouts/head/Social.astro`: `<meta property="og:site_name">` tag

### Changed

- `packages/docs/src/layouts/head/Social.astro`: supports remote thumbnail URLs — when `thumbnail` starts with `http(s)://` it uses `getRemoteImageSize()` instead of reading a local file
- `packages/docs/src/components/ResponsiveImage.astro`: forwards extra props (`...rest`) to the rendered `<img>` element
- `packages/docs/package.json`: bumped `@chassis-ui/css` peer dependency to `>=0.3.4`

## [0.3.8] - 2026-07-14

### Added

- `<link rel="preconnect">` hints for Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) in `Head.astro`, and for the jsDelivr CDN (Swiper) on the homepage

### Fixed

- `packages/docs/src/scss/main.scss`: corrected an invalid `margin--block-start` property to `margin-block-start`

## [0.3.7] - 2026-07-13

### Fixed

- `api/contact.ts`: the contact form handler now checks the `error` returned from `resend.emails.send()`'s response and returns a 500 instead of silently reporting success; previously only request-level failures (network errors, etc.) were caught, not API-level errors returned in the response body
- Support form (`SupportSection.astro`) success/error states now use the `notification` component.
- `packages/website/config.yml`: `repo` was pointing at the `chassis-ui/docs` repository; corrected to `chassis-ui/website`

### Changed

- Renamed the `x` site config key to `x_username`, changed `github_org` to hold a bare org slug instead of a full URL, and added a new `figma_handle` key (config schema updated to match)
- Docs header navigation: replaced the X/Twitter link with a new link to the Chassis Figma Community profile, alongside GitHub
- CI: bumped `pnpm/action-setup` to v6 and `softprops/action-gh-release` to v3 in `publish-packages.yml`, and renamed the docs npm publish token secret to `NPM_CHASSIS_UI`
- Bumped `@chassis-ui/css` to `^0.3.3` in `packages/docs` peerDependencies
- Bumped `@chassis-ui/icons` to `^0.3.1` in `packages/website`

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
- `Scripts.astro` now loads Chassis JS with a plain `import '@chassis-ui/css'` instead of a hand-computed dev/prod `<script is:inline>` src. Consumers who install `@chassis-ui/css` as a real dependency (e.g. `packages/website`) need no special config — the import resolves normally and Vite's own dependency optimizer dedupes it. Consumers who self-host `@chassis-ui/css` (i.e. _are_ that package) need to alias it to their own build output in dev themselves — see chassis-css's own `site/src/libs/astro.ts` for the pattern
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
