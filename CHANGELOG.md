# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
