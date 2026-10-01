# Changelog

Changes to the website at [chassis-ui.com](https://chassis-ui.com) and to the tooling of this repository, by date. The website has no version.

The package `@chassis-ui/docs` has its own changelog, [packages/docs/CHANGELOG.md](packages/docs/CHANGELOG.md). It also holds the history of this repository up to 0.5.1, when the two shared this file.

## 2026-10-01

### Changed

- Lighthouse checks each URL once, on production as on staging. Three runs of each made Vercel answer 403.
- The content security policy reports to `/api/csp-report/`, which saves a redirect.

## 2026-09-29

### Added

- Unit tests for the library modules of `packages/docs`, component tests that render in a fixture site, and tests of the contact endpoint. `pnpm test` runs them, and so does CI.
- A starter site in `packages/docs/starter`. CI packs `@chassis-ui/docs`, installs it into the starter and builds it with the site in `site/` and in `packages/site`. `pnpm test:fixtures` does the same locally.
- Changesets for the versions and the changelog of `@chassis-ui/docs`. See [Releases](CONTRIBUTING.md#releases).
- A "Getting started" guide of three pages in place of the test pages of the docs section.
- The vanilla HTML example, rewritten for Chassis CSS 0.5 and served at `/examples/vanilla-html/`.
- A privacy page at `/privacy/`, linked from the footer and the contact form. Google Analytics loads only after the visitor accepts it in a consent banner.
- Security headers, with the content security policy in report-only mode. `/api/csp-report` logs its reports.
- The React docs at `/react/`, and path-based routes for the static files of each project, next to the referrer-based ones.
- React in the header and the footer.
- Checks of the built site in CI: both HTML validators, the link checker and axe. The link checker also crawls each deployment. There it lists a broken link into a proxied project, and a project behind Vercel's login, as warnings under that project. Lighthouse on staging tests the staging domain.
- Reusable workflows for lint, type check and site build, which CI calls and the sibling repositories can call.
- A canary that builds the sites of the sibling repositories with a new version of `@chassis-ui/docs` before it is published.
- Community files, issue forms, Dependabot and a pre-commit hook for ESLint and Prettier.
- `ref/OPERATIONS.md`, for rollbacks, a proxied site that is down and credential rotation.

### Changed

- The website uses the integration, the schemas and the helpers of `@chassis-ui/docs`. Its copies under `src/libs` are deleted. The built site is unchanged.
- `@chassis-ui/docs` is published from `main` with npm trusted publishing and provenance, after the checks of CI passed on the commit. A prerelease goes to the dist-tag named by its version, such as `next`.
- One set of top-level scripts, Node 24 in `.nvmrc`, and a spell check in the lint. `pnpm dev` no longer moves the `vendor/assets` pin.
- The build scripts under `build/` are replaced by the `chassis-docs` commands of `@chassis-ui/docs`.
- The website uses `@chassis-ui/tokens` 0.6. The built site is unchanged.
- The checks of CI are named `Lint / Lint`, `Type Check / Type Check` and `Build / Build`, and the ruleset requires those names.

### Fixed

- The contact endpoint checks the origin, limits the size of the request and of each field, and escapes the message. A firewall rule limits the requests per address.
- The links of the About page to the repositories, the image names of the home page gallery for small screens, and the "View Documentation" button of the icons section.
- Code blocks that scroll sideways can be scrolled with a keyboard.
