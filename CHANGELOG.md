# Changelog

Changes to the website at [chassis-ui.com](https://chassis-ui.com) and to the tooling of this repository, by date. The website has no version.

The package `@chassis-ui/docs` has its own changelog, [packages/docs/CHANGELOG.md](packages/docs/CHANGELOG.md). It also holds the history of this repository up to 0.5.1, when the two shared this file.

## 2026-09-29

### Added

- Unit tests for the library modules of `packages/docs`, component tests that render in a fixture site, and tests of the contact endpoint. `pnpm test` runs them, and so does CI.
- A starter site in `packages/docs/starter`. CI packs `@chassis-ui/docs`, installs it into the starter and builds it with the site in `site/` and in `packages/site`. `pnpm test:fixtures` does the same locally.
- Changesets for the versions and the changelog of `@chassis-ui/docs`. See [Releases](CONTRIBUTING.md#releases).

### Changed

- The website uses the integration, the schemas and the helpers of `@chassis-ui/docs`. Its copies under `src/libs` are deleted. The built site is unchanged.
- `@chassis-ui/docs` is published from `main` with npm trusted publishing and provenance, after the checks of CI passed on the commit. A prerelease goes to the dist-tag named by its version, such as `next`.
