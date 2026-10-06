# Changelog

Changes to the website at [chassis-ui.com](https://chassis-ui.com) and to the tooling of this repository, by date. The website has no version.

The package `@chassis-ui/docs` has its own changelog, [packages/docs/CHANGELOG.md](packages/docs/CHANGELOG.md). It also holds the history of this repository up to 0.5.1, when the two shared this file.

## 2026-10-06

### Changed

- The website uses `@chassis-ui/css` 0.6.0 and its CSS grid. The home page, the about page, the blog, the examples page and the privacy page use `.grid` with `col-span-*` in place of the flexbox grid, `.row` with `.col-*`, which css 0.6 deprecates. The pages look as before. Columns that had the fixed gutter of 1.5rem have the gutter of the breakpoint and move by a few pixels, and the line under a blog post in the list is as wide as the text, not 12 pixels wider on each side.
- The vanilla HTML example uses `@chassis-ui/css` 0.6.0 and the CSS grid.
- The CDN links of the installation page are for `@chassis-ui/css` 0.6.0.
- `ref/CHASSIS_CSS.md` converts Bootstrap's grid to the CSS grid.
- The five feature sliders of the home page are carousels of Chassis CSS. They were built on Swiper, whose script and stylesheet the page loaded from jsDelivr. The cards, their sizes and the two buttons are where they were. A touch, a trackpad, the buttons and the arrow keys move the row. Dragging it with the mouse no longer does.
- The frequently asked questions of the home page open and close with the height transition of the accordion of Chassis CSS: the accordion has `data-cx-accordion`.

### Fixed

- The about page and the examples page no longer scroll 4 pixels sideways between 1024 and 1535 pixels. The gutter of their rows was wider than the padding of the container.
- The five module links of the home page fit their row between 768 and 1023 pixels: a label that is wider than its column wraps onto a second line. Up to 926 pixels the fifth link, "Icon Packager", was cut off.
- The buttons of the feature sliders are on the slider between 768 and 991 pixels. They were placed against the page, far above it.
- The cards of the feature sliders run to the edges of the viewport. The container cropped them, which shows on a screen wider than 1536 pixels: the `overflow-visible` utility of the slider is in a cascade layer, so the stylesheet of Swiper, which is in none, won.
- `source-map-js` is 1.2.2 in the lockfile. Version 1.2.1 has a [security advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), which failed the Audit job. It comes with PostCSS, through `@chassis-ui/css`.

## 2026-10-05

### Added

- A check of the content security policy, `pnpm site:lint:csp <url>`: it opens pages of a deployment in Chrome, the proxied projects included, and lists what the policy blocks or would block. The Content Security Policy workflow runs it after each deployment. The reports of the policy are not stored: the check replaces them.

### Changed

- The assets submodule is at `def4a90`, which adds two docs images of chassis-figma and changes two.

### Fixed

- The canary builds the sites of chassis-css and chassis-assets again. It had skipped both since their sites moved to `packages/site`.

## 2026-10-02

### Changed

- The release workflow is `release.yml`, named Release, as in the other Chassis repositories. It was `publish-packages.yml`. A manual run publishes from `main` only, and the GitHub release is created with the GitHub CLI.
- The checks of CI are named `Lint`, `Type Check` and `Build` again, and the ruleset requires those names. A push to `develop` is no longer cancelled by a newer one.
- `pnpm check:pnpm`, and the Audit job with it, fail on the dependencies that ship, `pnpm audit --prod`. The job also reports the audit of all dependencies.
- `pnpm changeset:version` makes a version, as in the other repositories.

### Added

- A Changeset job in CI: a change to the code of `@chassis-ui/docs` needs a changeset.

### Removed

- The reusable workflows for lint, type check and site build. No repository called them.

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
