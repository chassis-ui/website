# Tasks for the Sibling Repositories

> **Purpose:** work that belongs in a sibling repository and was found while reviewing
> `chassis-website`. Nothing here is done from this repository. Each sibling's own upgrade
> project points to its section below.
>
> **Baseline:** observed 2026-09-29. File paths and line numbers are from that date.
> Re-check a task before acting on it.
>
> **Related:** [ROADMAP.md](ROADMAP.md) holds the work of this repository. Its
> [Breaking changes](ROADMAP.md#breaking-changes) section says how releases are versioned.

## How to use this document

- The package is released twice in this project. 0.5.1 is non-breaking and fixes the two
  open issues. 0.6.0 is breaking and replaces the alias contract. A sibling can take both
  in turn or go to 0.6.0 directly.
- A task with a value in "Needs" cannot start before this repository has shipped that
  release or finished that roadmap phase.
- A task with "nothing" in "Needs" can be done today.
- When a sibling finishes a task, set its status to done here. Session 5.3 of the roadmap
  removes finished tasks.
- Status values: `open`, `blocked`, `done`.

## Tasks for every sibling

These apply to each of the six repositories unless the "Applies to" column narrows them.

| ID  | Task                                                                                                                                                                                                                  | Why                                                                                                                                                            | Applies to                                     | Needs                    | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------ | ------- |
| A1  | Move to `@chassis-ui/docs` `^0.5.1`. Set `sitePath` in `config.yml`, and `siteBranch` if the default branch is not `main`. Add both keys to the site's config schema. Optional if the sibling goes to 0.6.0 directly. | Fixes the "View on GitHub" links. Takes the lockfile off the prerelease 0.5.0-0.                                                                               | all                                            | `@chassis-ui/docs` 0.5.1 | blocked |
| A2  | Pass the entry's `filePath` to `DocsLayout` from the docs page route.                                                                                                                                                 | The new link is built from it. Without it the old link stays.                                                                                                  | all with a docs route                          | `@chassis-ui/docs` 0.5.1 | blocked |
| A3  | Move to `@chassis-ui/docs` `^0.6.0`. Add the integration to `astro.config.ts`. Delete the `@libs/*` modules that the package no longer reads. Follow the upgrade guide in the package.                                | 0.6.0 replaces the alias contract. It is a breaking release.                                                                                                   | all                                            | `@chassis-ui/docs` 0.6.0 | blocked |
| A4  | Use the package's config schema, `clipboard.ts` and path helpers. Delete the site's copies. Do it together with A3.                                                                                                   | Nine library files are copied per site and have drifted.                                                                                                       | all                                            | `@chassis-ui/docs` 0.6.0 | blocked |
| A5  | Replace `build/sync-submodules.js`, `build/html-validate.js`, `build/vnu-jar.js` and `build/build-site.js` with the package's commands.                                                                               | The scripts are copied between repositories.                                                                                                                   | all                                            | roadmap session 5.1      | blocked |
| A6  | Serve the site's static files under its own prefix, for example `/css/static/`.                                                                                                                                       | The main site routes `/static/*` by the `Referer` header, which fails for requests without one. When all six are done, this repository removes those rewrites. | all                                            | roadmap session 4.2      | blocked |
| A7  | Set the Node version: `engines`, `.nvmrc` and the CI matrix.                                                                                                                                                          | CI uses 18, 20, 22 and 24 across the repositories.                                                                                                             | all                                            | roadmap decision D7      | blocked |
| A8  | Upgrade Astro to 7.2.4 or later.                                                                                                                                                                                      | 7.0.6 has a critical advisory.                                                                                                                                 | assets, icons, figma                           | nothing                  | open    |
| A9  | Accept `@chassis-ui/tokens` 0.6.                                                                                                                                                                                      | Every range is `^0.5.x`.                                                                                                                                       | all that depend on tokens                      | nothing                  | open    |
| A10 | Move the assets submodule to the current commit. Decide whether the site needs it.                                                                                                                                    | Three different pins exist. The sync script installs dependencies inside the submodule on every build.                                                         | tokens, css, icons, figma, react               | roadmap decision D9      | blocked |
| A11 | Add `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CONTRIBUTING.md`, issue forms and a pull request template. Copy from `chassis-tokens` and adjust.                                                                           | The files are missing. They live in each repository, under roadmap decision D10.                                                                               | assets, icons, figma                           | nothing                  | open    |
| A12 | Add Dependabot or Renovate. Group the `@chassis-ui/*` packages.                                                                                                                                                       | A release of one package should open one pull request per consumer.                                                                                            | assets, icons, figma. Grouping applies to all. | nothing                  | open    |
| A13 | Fix `check:lockfile`. It looks for `package-lock.json`. The repository uses `pnpm-lock.yaml`.                                                                                                                         | The script checks a file that does not exist.                                                                                                                  | assets, icons, figma                           | nothing                  | open    |
| A14 | Call the reusable workflows of `chassis-ui/website` for lint, type check and site build. Optional.                                                                                                                    | Less workflow code per repository.                                                                                                                             | any                                            | roadmap session 5.2      | blocked |
| A15 | Adopt the consent mechanism of the analytics component. Add a link to the privacy page.                                                                                                                               | Google Analytics loads for every visitor without consent.                                                                                                      | all                                            | roadmap session 4.3      | blocked |

## chassis-css

| ID   | Task                                                                                                                                                             | Evidence                                                                                                                                                                         | Needs                    | Status  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| CSS1 | Delete `patches/@chassis-ui__docs@0.5.0-0.patch` and the `patchedDependencies` entry. Keep `sourceDir` and `sourcePath` in `config.yml`. Do it together with A1. | `package.json:131-133`. The patch is the fix for issue 2 and is part of 0.5.1.                                                                                                   | `@chassis-ui/docs` 0.5.1 | blocked |
| CSS2 | Replace the path into `node_modules` with the package's path helper.                                                                                             | `packages/site/content/docs/customize/color-modes.mdx:181` reads `node_modules/@chassis-ui/docs/src/js/color-modes.js`. The layout under `src/` is not guaranteed from 0.6.0 on. | `@chassis-ui/docs` 0.6.0 | blocked |
| CSS3 | Nothing to change for `scss/vars`. The package makes it a public partial.                                                                                        | `packages/site/src/scss/_examples.scss:1`.                                                                                                                                       | `@chassis-ui/docs` 0.6.0 | blocked |
| CSS4 | Review the workarounds for the package after the move to 0.6.0. Some may no longer be needed.                                                                    | `packages/site/src/libs/astro.ts:73-90` aliases `@chassis-ui/css` and excludes the package from `optimizeDeps`. `astro.config.ts:47-66` adds a Sass importer.                    | `@chassis-ui/docs` 0.6.0 | blocked |

## chassis-tokens

| ID   | Task                                                       | Evidence                                                                                 | Needs   | Status |
| ---- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------- | ------ |
| TOK1 | Remove the commented import of a file that does not exist. | `packages/site/src/pages/tokens/index.astro:10` names `@chassis-ui/docs/scss/home.scss`. | nothing | open   |

This repository is the reference for tooling. It has Changesets, provenance publishing,
Dependabot, `CODEOWNERS` and the full set of community files.

## chassis-react

| ID   | Task                                                                                                | Evidence                                                                                                                                                                                   | Needs                      | Status  |
| ---- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | ------- |
| RCT1 | Replace the re-implementation of the auto import with `chassisAutoImport` and its `exclude` option. | `packages/site/src/libs/shortcode.ts` is 81 lines. It scans `node_modules/@chassis-ui/docs/src/components/shortcodes` at line 16. The layout under `src/` is not guaranteed from 0.6.0 on. | `@chassis-ui/docs` 0.6.0   | blocked |
| RCT2 | Add the staging deployment and the `noindex` header to `vercel.json`, as the other siblings have.   | `vercel.json` has neither.                                                                                                                                                                 | nothing                    | open    |
| RCT3 | Delete `build/build-site.js`.                                                                       | Nothing references it.                                                                                                                                                                     | nothing                    | open    |
| RCT4 | Fix `buildOutputPath` in `build/sync-submodules.js`.                                                | It checks `dist/web/chassis-docs`. The output is `dist/web/docs/chassis`.                                                                                                                  | nothing, or replaced by A5 | open    |
| RCT5 | Correct the stale comment about a `link:` override.                                                 | `packages/site/src/libs/astro.ts:55-60`. No such override exists.                                                                                                                          | nothing                    | open    |
| RCT6 | Add `CODEOWNERS`. Give the root `package.json` a `name`.                                            | tokens and css have `CODEOWNERS`.                                                                                                                                                          | nothing                    | open    |
| RCT7 | Tell this repository when the site is deployed, so that the `/react` route can be checked.          | `config.yml` sets `baseURL: "https://chassis-ui.com/react"`. The route is added in roadmap session 4.2.                                                                                    | roadmap session 4.2        | blocked |

## chassis-assets

| ID   | Task                                                               | Evidence                                                                                                                                                                                                            | Needs               | Status  |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------- |
| AST1 | Bring `app/docs` level with `main`.                                | `main` is one commit ahead of `origin/app/docs`. Every other repository vendors `app/docs`.                                                                                                                         | nothing             | open    |
| AST2 | Run CI on `main` as well.                                          | `ci.yml` runs on `app/docs` only.                                                                                                                                                                                   | nothing             | open    |
| AST3 | Decide whether the package is published.                           | `publishConfig` is set. No workflow publishes.                                                                                                                                                                      | nothing             | open    |
| AST4 | Check the tags.                                                    | The package is at 0.1.8. `git describe` returns `v0.1.7`.                                                                                                                                                           | nothing             | open    |
| AST5 | Take the multi-platform sync documentation, if it is still wanted. | `build/README.md`, `build/Makefile` and `build/sync-submodules.sh` of `chassis-website` at commit `24aa677`. They describe Android, iOS and Flutter builds and are deleted from that repository in roadmap phase 0. | nothing             | open    |
| AST6 | Add `engines`.                                                     | None is set.                                                                                                                                                                                                        | roadmap decision D7 | blocked |

## chassis-icons

| ID   | Task                                                              | Evidence                                                                                                                                                                                                                                   | Needs               | Status  |
| ---- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ------- |
| ICO1 | Fix the CI job.                                                   | `.github/workflows/ci.yml:35` runs `pnpm validate`. `package.json` has no such script. The job uses Node 18 and 20 and pnpm 9. The checkout does not fetch submodules.                                                                     | nothing             | open    |
| ICO2 | Import `shortcodes/Icon.astro`. Do it before or together with A3. | Four files import `components/shortcodes/Icon.astro`: `site/src/components/Details.astro:6`, `Examples.astro:3`, `homepage/HeroSection.astro:4`, `homepage/ListSection.astro:2`. 0.6.0 removes the path that makes the old import resolve. | nothing             | open    |
| ICO3 | Add the 0.3.1 entry to the changelog.                             | The latest entry is 0.3.0. The tag and the package are at 0.3.1.                                                                                                                                                                           | nothing             | open    |
| ICO4 | Correct `engines`.                                                | It says Node `>=18` and pnpm `>=9`. `packageManager` pins pnpm 10.33.2.                                                                                                                                                                    | roadmap decision D7 | blocked |
| ICO5 | Add the `branch` line to `.gitmodules`.                           | The submodule entry has none. The pin is the oldest of all, `a0bb3f8`.                                                                                                                                                                     | nothing             | open    |

## chassis-figma

| ID   | Task                                        | Evidence                                                          | Needs               | Status  |
| ---- | ------------------------------------------- | ----------------------------------------------------------------- | ------------------- | ------- |
| FIG1 | Add CI.                                     | There is no `.github/workflows` directory.                        | nothing, or A14     | open    |
| FIG2 | Tag the first release.                      | The package is at 0.1.0. The repository has no tags.              | nothing             | open    |
| FIG3 | Remove `astro-auto-import` if it is unused. | `package.json:69`. The package's `chassisAutoImport` replaced it. | nothing             | open    |
| FIG4 | Add `engines`.                              | None is set.                                                      | roadmap decision D7 | blocked |

## What a sibling can rely on

- A sibling keeps building on the version in its lockfile. Nothing in this project
  changes a published version.
- Releases in the 0.5 line are non-breaking.
- 0.6.0 is a breaking release. No sibling's range accepts it. Dependabot in tokens, css
  and react will propose it. That pull request fails until the upgrade tasks are done,
  and it can wait.
- The referrer-based `/static/*` routing on the main site stays until the last sibling
  has been upgraded and deployed.
