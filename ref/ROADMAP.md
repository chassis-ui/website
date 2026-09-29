# Chassis Website Roadmap

> **Scope:** what it takes to make `chassis-website` and the `@chassis-ui/docs` package
> professional, production-ready and easy to contribute to. Written to be worked through
> over several sessions.
>
> **This roadmap changes this repository only.** Work that belongs in a sibling repository
> is recorded in [SIBLING_TASKS.md](SIBLING_TASKS.md), so that each sibling's own upgrade
> project can point to it. No task below edits a sibling.
>
> **Baseline:** reviewed 2026-09-29 at `main` `24aa677`, `@chassis-ui/docs` 0.5.0.
> Every finding below was checked against the code, the GitHub repository or the live site
> on that date. Re-check a finding before acting on it if the baseline has moved.

## How to use this document

1. Pick the lowest-numbered phase that still has unchecked tasks. Phase 0 and Phase 1 come
   first, in that order. Phases 2 to 5 can be interleaved.
2. Each phase lists its tasks as checkboxes, grouped into session-sized blocks. Tick a task
   when it is merged, not when it is started.
3. Each phase has exit criteria. A phase is done when all of them hold.
4. Add a line to the [session log](#session-log) at the end of every session.
5. Open decisions are collected in [Decisions](#decisions). A task that
   depends on one names it.
6. When a session finds work for a sibling, add it to [SIBLING_TASKS.md](SIBLING_TASKS.md)
   and do not do it.

## Summary

| Phase                                                | Goal                                                       | Sessions | Depends on | Model            |
| ---------------------------------------------------- | ---------------------------------------------------------- | -------- | ---------- | ---------------- |
| [0](#phase-0--green-baseline)                        | CI is green and means something                            | 2        | none       | Opus             |
| [1](#phase-1--open-issues-and-the-consumer-contract) | Close issues 1 and 2, release `@chassis-ui/docs` 0.5.1     | 1 to 2   | 0          | Opus             |
| [2](#phase-2--package-hardening)                     | Tests, a fixture site, a safe release pipeline             | 4        | 1          | Fable, then Opus |
| [3](#phase-3--contributor-experience)                | A new contributor gets from clone to pull request unaided  | 2        | 0          | Opus             |
| [4](#phase-4--production-hardening-of-the-website)   | Security, privacy, accessibility and performance gates     | 4        | 0          | Mixed            |
| [5](#phase-5--ecosystem-support)                     | This repository gives the siblings what they need to align | 3        | 2          | Opus             |

### Which model for which session

Fable is the more capable model. Use it where the design is still open, or where a mistake
reaches production or every consumer. Use Opus where the task is already specified and a
check tells you whether it worked.

| Session                      | Model | Why                                                                                                                                                                                                           |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 Make CI pass             | Opus  | Formatting and dependency upgrades. The build and the audit confirm the result.                                                                                                                               |
| 0.2 Make CI mean something   | Opus  | Small, specified changes to scripts and workflows.                                                                                                                                                            |
| 1.1 The fix                  | Opus  | The patch exists and the config keys are named.                                                                                                                                                               |
| 1.2 The release              | Opus  | Documentation and one release.                                                                                                                                                                                |
| 2.1 Own the contract         | Fable | The main design decision of the roadmap. It replaces the alias contract and sets the public API for every consumer. It means reading seven drifted copies of the same libraries to tell bugs from real needs. |
| 2.2 Tests                    | Opus  | Tests written against code that exists.                                                                                                                                                                       |
| 2.3 Fixture sites            | Opus  | Follows the contract that session 2.1 defined. If the fixture shows that the contract is incomplete, take that back to a Fable session.                                                                       |
| 2.4 Release pipeline         | Opus  | `chassis-tokens` has a working pipeline to read and copy from.                                                                                                                                                |
| 3.1 Accurate docs            | Opus  | Rewriting docs from `package.json`.                                                                                                                                                                           |
| 3.2 Repository hygiene       | Opus  | Standard files and settings.                                                                                                                                                                                  |
| 4.1 Security                 | Fable | A content security policy has to allow six proxied sites, inline scripts and third-party hosts. A wrong policy breaks production silently.                                                                    |
| 4.2 Routing                  | Opus  | The new rewrites are added next to the old ones. Staging and `curl` confirm the result.                                                                                                                       |
| 4.3 Privacy and legal        | Opus  | The decisions are yours. The implementation is small.                                                                                                                                                         |
| 4.4 Quality gates            | Opus  | Measured work. Lighthouse and axe report the result.                                                                                                                                                          |
| 5.1 Shared commands          | Opus  | The scripts are byte-identical in five repositories.                                                                                                                                                          |
| 5.2 Shared workflows         | Opus  | Turns existing workflows into reusable ones.                                                                                                                                                                  |
| 5.3 Canary and compatibility | Opus  | A CI job that clones and builds. Use Fable if sibling builds fail for reasons that are not obvious.                                                                                                           |

Switch to Fable in any session when a task turns out to be less specified than it looked,
for example when an upgrade breaks the build for a reason that is not in the changelog.

## Breaking changes

Backward compatibility is not a goal of this project. The siblings are upgraded after it,
each in its own project.

- A sibling keeps building on the version it has. Published versions do not change, and
  each sibling's lockfile pins one.
- Releases in the 0.5 line stay non-breaking, because the siblings' ranges accept them.
  0.5.1 is the only one planned.
- Breaking changes ship in 0.6.0. No sibling's range accepts it, so none takes it by
  accident.
- Every breaking change gets an entry in the package changelog and an upgrade step in
  [SIBLING_TASKS.md](SIBLING_TASKS.md).

One thing is not covered by versions. `vercel.json` in this repository acts on the live
sibling sites at once. The referrer-based `/static/*` rewrites therefore stay until the
last sibling has been upgraded and deployed.

## Findings

### This repository

| ID  | Finding                                                                                                                                                                                       | Evidence                                                                                                                                                                                                                                                                                                                                                | Phase |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| F1  | CI has failed on every push to `main` and `staging` since 2026-07-21.                                                                                                                         | `gh run list --workflow CI`. Prettier fails on 8 files in `packages/website`. Locally 4 more fail in `packages/docs`.                                                                                                                                                                                                                                   | 0     |
| F2  | `pnpm audit` reports 34 advisories: 1 critical, 26 high, 7 moderate.                                                                                                                          | The critical one is `astro` below 7.2.4. Installed is 7.0.6, latest is 7.3.5. The rest come through `eslint`, `stylelint`, `html-validate`, `postcss`, `image-size`.                                                                                                                                                                                    | 0     |
| F3  | The `check` and `check:astro` scripts cannot fail.                                                                                                                                            | `package.json:54-55` run jobs with `&` and end with a bare `wait`, which always exits 0. The "Type Check" job in CI calls `check:astro`.                                                                                                                                                                                                                | 0     |
| F4  | CI never builds the site. Vercel is the first thing to build a commit.                                                                                                                        | `.github/workflows/ci.yml` has lint, type check and audit only. HTML validation is not in CI either.                                                                                                                                                                                                                                                    | 0     |
| F5  | `main` has no branch protection and no rulesets.                                                                                                                                              | `gh api repos/chassis-ui/website/branches/main/protection` returns 404. A push to `main` with a version bump publishes to npm.                                                                                                                                                                                                                          | 0     |
| F6  | The Lighthouse workflow fails on every deployment.                                                                                                                                            | The accessibility assertion gets `NaN` on every URL. Performance scores are 0.68 to 0.86 against a 0.9 target.                                                                                                                                                                                                                                          | 0, 4  |
| F7  | There are no tests of any kind.                                                                                                                                                               | No `*.test.*`, `*.spec.*`, Vitest or Playwright config in the repository.                                                                                                                                                                                                                                                                               | 2     |
| F8  | `@chassis-ui/docs` imports five modules that the consuming site must supply through a `@libs/*` alias. It also expects `docs` and `callouts` content collections. None of this is documented. | `@libs/config` (9 imports), `@libs/content` (2), `@libs/path` (2), `@libs/data` (1), `@libs/clipboard` (1). The package reads 12 keys from `getConfig()`.                                                                                                                                                                                               | 1, 2  |
| F9  | The package type-checks only against the website's implementation of that contract.                                                                                                           | `packages/docs/tsconfig.json` maps `@libs/*` to `../website/src/libs/*`. A sibling site with a different `config.ts` is never checked.                                                                                                                                                                                                                  | 2     |
| F10 | Every file under `src/` is public API.                                                                                                                                                        | `exports` in `packages/docs/package.json` uses wildcards for all six subpaths. The package ships raw `.ts` and `.astro` with no `types` field.                                                                                                                                                                                                          | 2     |
| F11 | The package README is out of date.                                                                                                                                                            | It lists `@chassis-ui/css >=0.3.2` as a peer. `package.json` says `^0.5.0-0`.                                                                                                                                                                                                                                                                           | 1     |
| F12 | The release tooling does not handle prereleases, yet prereleases are published.                                                                                                               | `build/change-version.js:31` accepts `x.y.z` only. npm has `0.4.0-0` and `0.5.0-0`. The workflow runs plain `npm publish` and marks every GitHub release `prerelease: false`.                                                                                                                                                                           | 2     |
| F13 | The publish workflow uses a long-lived npm token and no provenance. It has no build or test gate.                                                                                             | `.github/workflows/publish-packages.yml`. The "Create GitHub Release" step also runs when the publish step was skipped.                                                                                                                                                                                                                                 | 2     |
| F14 | One changelog covers the private website and the published package. The website has no version of its own.                                                                                    | `CHANGELOG.md` in the root follows the package version. `packages/website/config.yml` says `current_version: "0.1.0"`. The last website tag is `v0.1.10`.                                                                                                                                                                                               | 2     |
| F15 | The contributor docs name scripts that do not exist and versions that are wrong.                                                                                                              | `README.md` lists `pnpm preview`, `pnpm format`, `pnpm lint`, `pnpm astro:check`. `CONTRIBUTING.md` lists `pnpm site:format`. Both say Node 18. CI runs Node 24. `CONTRIBUTING.md` says pnpm 8, the repository pins 10.33.2.                                                                                                                            | 3     |
| F16 | The Node version is not pinned anywhere.                                                                                                                                                      | No `engines`, `.nvmrc` or `.node-version`.                                                                                                                                                                                                                                                                                                              | 3     |
| F17 | Community health files are missing.                                                                                                                                                           | No `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, pull request template, `CODEOWNERS`, Dependabot or Renovate config. `CONTRIBUTING.md` links to Discussions, which are disabled.                                                                                                                                                                | 3     |
| F18 | GitHub security features are off.                                                                                                                                                             | Secret scanning, push protection, Dependabot alerts and security updates are all disabled.                                                                                                                                                                                                                                                              | 0     |
| F19 | Stale or unrelated files are tracked.                                                                                                                                                         | `PROJECT_REVIEW.md` (January 2025, describes Astro 5). `build/Makefile`, `build/sync-submodules.sh` and `build/README.md` describe Android, iOS and Flutter builds. Two empty JSON files and committed `dist/` folders in `examples/`. `build/build-site.js` calls itself "Site Builder Script for Chassis Icons".                                      | 0     |
| F20 | The docs section of the website holds placeholder content only.                                                                                                                               | `packages/website/content/docs` has `test-category` and `test-category-2`. `src/pages/docs/index.astro` redirects to the test page. None of it is in the live sitemap.                                                                                                                                                                                  | 3     |
| F21 | `ref/ARCHITECTURE.md` no longer matches the ecosystem.                                                                                                                                        | It places every sibling site in `site/`. It does not mention `chassis-react`.                                                                                                                                                                                                                                                                           | 3     |
| F22 | The site sends no security headers of its own.                                                                                                                                                | `curl -I https://chassis-ui.com/` shows only the HSTS header that Vercel adds. `vercel.json` sets `X-Robots-Tag` for staging and nothing else.                                                                                                                                                                                                          | 4     |
| F23 | The contact endpoint puts user input into an HTML email without escaping. It has no length limits and no rate limiting.                                                                       | `api/contact.ts:75-81`. The honeypot is the only abuse control.                                                                                                                                                                                                                                                                                         | 4     |
| F24 | `/static/*` is routed to a sibling deployment by the `Referer` header.                                                                                                                        | `vercel.json`, the first ten rewrites. A request without a referrer gets the main site's file.                                                                                                                                                                                                                                                          | 4     |
| F25 | Branches are untidy, and the branch flow in the docs is not the one in use.                                                                                                                   | Seven `dev/*` branches exist only locally. The remote branch `app/docs` is 48 commits behind `main`. The docs describe feature branch, then `staging`, then `main`. In practice work is merged into `develop`, a local integration branch that is deliberately not pushed.                                                                              | 3     |
| F26 | The production build is not reproducible.                                                                                                                                                     | `build/build-site.js:162` runs `git submodule update --init --remote`, so the build takes whatever `app/docs` of `chassis-assets` holds at that moment, not the pinned commit. It then installs dependencies inside the submodule.                                                                                                                      | 0     |
| F27 | The site has no privacy notice and asks for no consent.                                                                                                                                       | Google Analytics loads for every visitor in production, from `Analytics.astro` in the package, so this holds for every Chassis site. The contact form collects name and email. Fonts load from Google's servers. No page mentions privacy or cookies.                                                                                                   | 4     |
| F28 | Third-party origin may not be credited. This needs your confirmation.                                                                                                                         | No license or notice file here credits Bootstrap. The reference docs mention it only as the origin of Chassis CSS. Parts of the package and of `packages/website/src/libs` follow the Bootstrap docs site closely, and `chassis-css` carries a `LICENSE.BOOTSTRAP`. You know the provenance. If code was adapted, the MIT notice has to travel with it. | 4     |
| F29 | The published package has no license file, no `engines` and no `types`.                                                                                                                       | `packages/docs` has no `LICENSE`. The `files` field lists `src`, `index.ts` and `README.md`.                                                                                                                                                                                                                                                            | 1     |
| F30 | The workflows are not hardened.                                                                                                                                                               | `ci.yml` and `lighthouse.yml` set no `permissions`. Every action is pinned by tag, not by commit. There is no code scanning and no dependency review on pull requests.                                                                                                                                                                                  | 0     |
| F31 | A spell check is configured and never run.                                                                                                                                                    | `.cspell.json` exists. No script and no workflow calls `cspell`.                                                                                                                                                                                                                                                                                        | 3     |
| F32 | The example projects are not built, checked or linked.                                                                                                                                        | `examples/react-app` and `examples/vanilla-html`. `src/pages/examples.astro` does not link to them. The React example predates `chassis-react`.                                                                                                                                                                                                         | 3     |
| F33 | There is no operations documentation.                                                                                                                                                         | Nothing describes how to roll back a deployment, what to do when a proxied sibling site is down, or who is told. There is no monitoring.                                                                                                                                                                                                                | 4     |
| F35 | Every page fails the colour-contrast audit. Found in Phase 0.                                                                                                                                 | Lighthouse 12 on all 11 sitemap URLs. The accessibility score is still 0.96. The same failure on every page points to a shared element.                                                                                                                                                                                                                 | 4     |
| F36 | Search indexes two pages. This may be deliberate.                                                                                                                                             | `pagefind.yml` limits the index to `about/` and `examples/`, so the home page and the blog are not searchable.                                                                                                                                                                                                                                          | 3     |
| F37 | `pnpm dev` moves the submodule pin.                                                                                                                                                           | It runs `pnpm sync-submodules`, which updates `vendor/assets` to the latest `app/docs`. Each dev session can leave a changed pointer that a broad commit picks up. Since Phase 0 the pin decides what production builds.                                                                                                                                | 3     |
| F38 | The version script replaces every occurrence of the old version.                                                                                                                              | `build/change-version.js:95-96`. Bumping 0.5.0 would also have turned the peer range `^0.5.0-0` into `^0.5.1-0`.                                                                                                                                                                                                                                        | 2     |
| F39 | The website's source-file links point to a tag that does not exist.                                                                                                                           | `packages/website/config.yml` says `current_version: "0.1.0"`, and there is no `v0.1.0` tag. The links from the test page return 404. It follows from D11.                                                                                                                                                                                              | 2     |
| F34 | The package has no stated versioning policy.                                                                                                                                                  | It is at 0.5.0 with seven consumers. Nothing says what counts as a breaking change or what 1.0 requires.                                                                                                                                                                                                                                                | 2     |

### How the sibling repositories consume this one

All six siblings install `@chassis-ui/docs` from the npm registry. None links it from
disk. The website itself is the only consumer on `workspace:*`.

| Repository      | Site location      | `@chassis-ui/docs` range | Resolved         | Astro | Node in CI | Assets submodule  |
| --------------- | ------------------ | ------------------------ | ---------------- | ----- | ---------- | ----------------- |
| chassis-website | `packages/website` | `workspace:*`            | source           | 7.0.6 | 24         | `83198de` (0.1.7) |
| chassis-tokens  | `packages/site`    | `^0.5.0-0`               | 0.5.0-0          | 7.3.5 | 22, 24     | `04fd3a7` (0.1.8) |
| chassis-css     | `packages/site`    | `^0.5.0-0`               | 0.5.0-0, patched | 7.3.5 | 22, 24     | `04fd3a7` (0.1.8) |
| chassis-assets  | `site/`            | `^0.5.0-0`               | 0.5.0-0          | 7.0.6 | 24         | is the submodule  |
| chassis-icons   | `site/`            | `^0.5.0-0`               | 0.5.0-0          | 7.0.6 | 18, 20     | `a0bb3f8` (0.1.5) |
| chassis-figma   | `site/`            | `^0.5.0-0`               | 0.5.0-0          | 7.0.6 | no CI      | `a0bb3f8` (0.1.5) |
| chassis-react   | `packages/site`    | `^0.5.0`                 | 0.5.0            | 7.3.1 | 24         | `04fd3a7` (0.1.8) |

What each site takes from the package is nearly the same: the root entry, three layouts,
`FeatureCard`, the `Code` and `Icon` shortcodes, `scss/main` and `js/example-mode.js`.
That is a small part of what `exports` exposes.

The "Here" column names the phase of this roadmap that does this repository's part. The
sibling's part is in [SIBLING_TASKS.md](SIBLING_TASKS.md).

| ID  | Finding                                                                                        | Evidence                                                                                                                                                                                              | Here |
| --- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| S1  | Five siblings are locked to the prerelease 0.5.0-0.                                            | Lockfiles of tokens, css, assets, icons and figma. The source of 0.5.0-0 and 0.5.0 is identical today, so this is a label, not a bug.                                                                 | 1    |
| S2  | `chassis-css` carries a private patch of the package.                                          | `chassis-css/package.json:131-133` and `patches/@chassis-ui__docs@0.5.0-0.patch`. It is the fix for issue 2. The patch key names 0.5.0-0, so the site cannot move to 0.5.0 without it.                | 1    |
| S3  | Every site carries its own copy of `src/libs/*` to satisfy the alias contract in F8.           | Nine files per site: `astro`, `config`, `content`, `data`, `path`, `remark`, `shortcode`, `validation`, `clipboard`. `clipboard.ts` is byte-identical in five of them.                                | 2    |
| S4  | The copies have drifted.                                                                       | `getChassisTokensFsPath()` returns `dist/tokens/web/docs` in website and react, and `dist/web/docs` in tokens and icons. `getChassisAssetsFsPath()` has four different forms.                         | 2    |
| S5  | Two siblings reach into `node_modules/@chassis-ui/docs/src/` by file path.                     | `chassis-css/packages/site/content/docs/customize/color-modes.mdx:181`. `chassis-react/packages/site/src/libs/shortcode.ts:16`.                                                                       | 2    |
| S6  | `chassis-react` re-implements `chassisAutoImport` to leave out two shortcodes.                 | The same file, 81 lines where the other sites have 5. The package function has no `exclude` option.                                                                                                   | 2    |
| S7  | `chassisAutoImport` itself assumes where the package is installed.                             | `packages/docs/src/libs/shortcodes.ts:39` joins `node_modules/@chassis-ui/docs/src/components/shortcodes` onto a directory.                                                                           | 2    |
| S8  | Import paths are inconsistent.                                                                 | `chassis-icons` imports `components/shortcodes/Icon.astro` in four files. Everyone else uses `shortcodes/Icon.astro`. `chassis-css` imports the private partial `scss/vars`.                          | 2    |
| S9  | Build scripts are copied between repositories, not shared.                                     | `build/sync-submodules.js` is byte-identical in five repositories and forked in react. `build-site.js`, `html-validate.js`, `vnu-jar.js` and `change-version.js` are copied or forked in four to six. | 5    |
| S10 | The assets submodule is pinned to three different commits, and the branch it tracks is behind. | Pins in the table above. `chassis-assets` `main` is one commit ahead of `origin/app/docs`.                                                                                                            | 5    |
| S11 | `chassis-react` has no route on the main site.                                                 | Its `config.yml` sets `baseURL: "https://chassis-ui.com/react"`. `vercel.json` here has no `/react` rewrite. `https://chassis-ui.com/react/` returns 404.                                             | 4    |
| S12 | Tooling maturity is split in two.                                                              | tokens, css and react have Changesets, provenance publishing, Dependabot and full community files. assets, icons and figma have a README, a license and a changelog. This repository sits in between. | 3    |
| S13 | `chassis-icons` CI is broken by design.                                                        | `.github/workflows/ci.yml:35` runs `pnpm validate`. `package.json` has no such script. The job uses Node 18 and 20 and pnpm 9.                                                                        | none |
| S14 | `chassis-figma` has no CI and no tags.                                                         | No `.github/workflows` directory.                                                                                                                                                                     | none |
| S15 | No consumer accepts `@chassis-ui/tokens` 0.6.0.                                                | Every range is `^0.5.x`, including the website's.                                                                                                                                                     | 5    |

The pattern behind S3 to S9 is one cause. The package cannot be used without code that it
does not ship, so each site copies that code, and the copies drift. Phase 2 moves the
contract into the package. Each sibling then removes its copies in its own project.

## Phase 0 — Green baseline

**Goal:** a red check means a real problem, and CI covers lint, types, the build and the
audit.

**Status:** done on `develop` on 2026-09-29, not yet pushed. The first push to `staging`
runs the new CI and confirms the first exit criterion.

### Session 0.1: make CI pass

- [x] Run Prettier with `--write` over `packages/website` and `packages/docs`. Commit the
      12 files as a formatting-only change.
- [x] Upgrade dependencies within their ranges. Astro is at 7.3.5. The audit went from
      34 advisories to none, with no overrides or exceptions.
- [x] Build the site and compare the output with the build before the upgrade. The HTML
      is identical apart from whitespace and the generator tag.
- [x] The upgrade also moved the website from the `@chassis-ui/css` and
      `@chassis-ui/tokens` 0.5.0-0 prereleases to 0.5.2 and 0.5.3. This changes colours,
      border radii and dark-mode backgrounds. Taken in the same commit by decision.

### Session 0.2: make CI mean something

- [x] Make `check` and `check:astro` exit non-zero on failure. A deliberate type error
      now fails both.
- [x] Add a Build job to CI: the full production build, then html-validate and the Nu
      Html Checker.
- [x] Make the build use the pinned submodule commit. The pin moved to `04fd3a7`, the
      commit production built with, so the deployed site does not change.
      `pnpm sync-submodules` remains the deliberate way to move it.
- [x] Fix the Lighthouse run. Lighthouse 10 in action v10 could not parse `oklch()`
      colours, so the accessibility category had no score. The action is now 12.6.2.
      Every sitemap URL scores 0.96 for accessibility.
- [x] Set read-only token permissions on `ci.yml` and `lighthouse.yml`. Pin third-party
      actions by commit, in all three workflows. Add dependency review on pull requests.
- [x] Add the ruleset "Protect main and staging": no force push, no deletion. Decided,
      see D1.
- [x] Turn on secret scanning, push protection and Dependabot alerts. Dependabot
      security updates stay off by decision.
- [x] Delete the files in F19. The multi-platform content of `build/README.md` stays
      reachable at commit `24aa677` for `chassis-assets` to take.

### Exit criteria

- [ ] CI is green on `main` and `staging`. Every job passes locally. Not confirmed on
      GitHub until the next push.
- [x] A deliberate type error fails the type check.
- [x] `pnpm audit --audit-level moderate` exits 0.
- [x] A force push to `main` or `staging` is rejected.
- [x] Two builds of the same commit produce the same site.

### Left for you

- A second ruleset named "Branch protection" appeared on 2026-09-29 at 10:46. It is
  disabled and targets the default branch with the same two rules. It was not created by
  the Phase 0 session. Delete it or keep it.

## Phase 1 — Open issues and the consumer contract

**Goal:** close the two open issues with one naming scheme and release 0.5.1. This
release is non-breaking.

Both issues have the same cause. The package assumes that the site is built from the
repository root and that the source lives in that root. `chassis-tokens` and
`chassis-react` already use `packages/site`, and `chassis-css` is moving to it.

The recommended scheme is four optional keys in each site's `config.yml`:

```yaml
# Where `file` props are read from, relative to the build directory
sourceDir: '../css'
# The same directory from the repository root
sourcePath: 'packages/css'
# The site's root from the repository root
sitePath: 'packages/site'
# The branch that "View on GitHub" links to
siteBranch: 'main'
```

`sourceDir` and `sourcePath` are the names in the patch that `chassis-css` already
carries, so that site needs no change. A site that sets none of the keys behaves as it
does today.

### Session 1.1: the fix

- [x] Confirm the config keys above. Decided, see D2.
- [x] [chassis-ui/website#2](https://github.com/chassis-ui/website/issues/2): add
      `src/libs/source.ts` with `getSourceFsPath()` and `getSourceUrl()`, used in
      `Code.astro`, `JsDocs.astro`, `ScssDocs.astro` and `ScssDocsSimple.astro`. The
      `chassis-css` patch applied unchanged.
- [x] [chassis-ui/website#1](https://github.com/chassis-ui/website/issues/1): "View on
      GitHub" links to `<repo>/blob/<siteBranch>/<sitePath>/<filePath>`. `DocsLayout`
      looks the entry's `filePath` up in `docsPages` by `id`, so page routes need no
      change. A `filePath` prop can override it. The old link remains only when no file
      path is found.
- [x] Add the four keys to the schema in `packages/website/src/libs/config.ts`. The
      website sets `sitePath` and `sourcePath` to `packages/website`.
- [x] The website's test page uses all four file components, so the CI build exercises
      them.

### Session 1.2: the release

- [x] Write the consumer contract into `packages/docs/README.md`.
- [x] Correct the peer dependency list in the README, and the example imports, which
      named functions that do not exist.
- [x] Add a `LICENSE` file to the package, and `engines` equal to Astro's own Node
      requirement.
- [x] Check the release against `chassis-css` and `chassis-tokens` in scratch clones.
      Both build with the packed package and no patch. The only change in the output is
      the "View on GitHub" link on each docs page. The new links resolve for
      chassis-tokens. For chassis-css they resolve once its `packages/site` layout
      reaches its `main` branch.
- [x] Bump to 0.5.1 by hand. `build/change-version.js` would also have rewritten the
      `@chassis-ui/css` peer range. See F38.
- [ ] Release 0.5.1: push to `staging`, check, then push to `main`. Decided, see D16.
- [x] Write the upgrade steps for each sibling into
      [SIBLING_TASKS.md](SIBLING_TASKS.md).

### Exit criteria

- [ ] Issues 1 and 2 are closed. They close when the fix reaches `main`.
- [ ] 0.5.1 is on npm. It builds both scratch copies without a patch.
- [x] Every sibling has its upgrade steps written down.

## Phase 2 — Package hardening

**Goal:** the package owns its contract, and a change that would break a consumer fails
in this repository before it is published.

This phase produces 0.6.0, which is a breaking release. See
[Breaking changes](#breaking-changes).

### Session 2.1: own the contract

- [ ] Read the seven copies of `src/libs/*`. For each difference, record whether it is a
      bug, a real need of that site, or an accident. This is reading only.
- [ ] Move the config schema into the package. Export a base Zod schema that each site
      extends. Today each site copies `config.ts`, and `z.object` silently drops any key
      a site forgot to add.
- [ ] Replace the `@libs/*` alias contract. Design an Astro integration that the site
      adds in `astro.config.ts` and that gives the package its config, data, content and
      paths. Virtual modules are the expected mechanism. Remove every `@libs/*` import
      from the package.
- [ ] Export TypeScript types for everything a site passes to the integration.
- [ ] Remove the mapping to `../website/src` from `packages/docs/tsconfig.json`, so that
      the package type-checks on its own.
- [ ] Add `clipboard.ts` to the package. It is identical in five sites and has no
      site-specific part.
- [ ] Add the two path helpers that drifted, `getChassisTokensFsPath()` and
      `getChassisAssetsFsPath()`, as one implementation with options.
- [ ] Resolve the shortcodes directory in `chassisAutoImport` from the package's own
      location with `import.meta.url`, not from a `node_modules` path.
- [ ] Add `include` and `exclude` options to `chassisAutoImport`.
- [ ] Export a helper that returns the path of a file inside the package.
- [ ] Make `scss/vars` a documented public partial, since a sibling already uses it.
- [ ] Move the website to the new contract in the same change.
- [ ] Write the versioning policy: what counts as breaking before 1.0 and what 1.0
      requires.
- [ ] Write the upgrade guide from 0.5 to 0.6 in the package. Add its steps to
      [SIBLING_TASKS.md](SIBLING_TASKS.md).

### Session 2.2: tests

- [ ] Add Vitest. Unit-test the pure modules first: `toc`, `utils`, `site`, `source`,
      `markdown`, `rehype`, `image`.
- [ ] Test components with the Astro container API: the four file components, `Callout`,
      `Example`, `DocsSidebar`.
- [ ] Test `api/contact.ts`: valid request, missing fields, honeypot, wrong method.
- [ ] Add `pnpm test` to CI and to the required checks.

### Session 2.3: fixture sites

- [ ] Add a minimal fixture site that consumes the package the way a sibling will. It
      uses the integration and has its own `config.yml`.
- [ ] Build it in two layouts in CI: from the repository root, and from `packages/site`
      with `sourceDir` set. Issue 2 would have been caught by the second.
- [ ] Install the package into the fixture from `pnpm pack` output, not from the
      workspace, so that the `files` and `exports` fields are tested too.
- [ ] Write the fixture so that it can be copied as the starting point of a new Chassis
      docs site. Link it from the package README.
- [ ] Move the placeholder docs content of the website into the fixture.

### Session 2.4: release pipeline

- [ ] Adopt Changesets, or extend `change-version.js` to handle prerelease versions.
      See decision D5. Either way, fix F38.
- [ ] Give the package its own `CHANGELOG.md`. Decide what the root changelog and the
      website version mean. See decision D11 and F39.
- [ ] Publish with npm trusted publishing and provenance. Remove the `NPM_CHASSIS_UI`
      secret afterwards.
- [ ] Publish prereleases under a dist-tag derived from the version. Mark their GitHub
      releases as prereleases.
- [ ] Gate the publish job on lint, type check, tests and the fixture builds.
- [ ] Skip the GitHub release step when the publish step was skipped.
- [ ] Narrow `exports` to the supported import paths. Drop the wildcard for
      `components/*`, which is what makes `components/shortcodes/Icon.astro` resolve.
      List the supported paths in the README and the removed ones in the changelog.
- [ ] Release 0.6.0.

### Exit criteria

- Reverting the fix for issue 2 fails CI.
- A release needs no manual step after the pull request is merged.
- The npm page shows a provenance badge.
- The package contains no `@libs/*` import and type-checks without the website.
- The website uses the integration, the package's schema, helpers and `clipboard.ts`, and
  no longer carries copies of them.
- 0.6.0 is on npm with an upgrade guide.

## Phase 3 — Contributor experience

**Goal:** a first-time contributor can clone, run, change and submit without asking.

### Session 3.1: accurate docs and one way to run things

- [ ] Add top-level scripts that match what people type: `lint`, `format`, `test`,
      `check`, `preview`. Keep the `site:*` and `docs:*` scripts behind them.
- [ ] Rewrite the script tables and prerequisites in `README.md`, `CONTRIBUTING.md` and
      `ref/DEVELOPMENT.md` from `package.json`. Remove the duplicated setup sections and
      link to one place.
- [ ] Add `engines` to the root `package.json` and an `.nvmrc`. See decision D7.
- [ ] Update `ref/ARCHITECTURE.md` for `chassis-react` and the `packages/site` layout.
      Add `chassis-react` to the ecosystem tables in `README.md`,
      `packages/docs/README.md` and `ref/DEPLOYMENT.md`.
- [ ] Decide what the docs section of the website is for. See decision D12.
- [ ] Decide whether `examples/` stays. See decision D13. If it stays, build it in CI
      and link it from the examples page.
- [ ] Add a `spellcheck` script that runs `cspell`, and run it in CI.
- [ ] Ask whether search should cover more than About and Examples. See F36.
- [ ] Stop `pnpm dev` from moving the submodule pin. Make `sync-submodules` an explicit
      step. See F37.
- [ ] Delete the local `dev/*` branches that are merged. Keep `develop`: it is the local
      integration branch and stays unpushed. Delete the stale remote branch `app/docs`
      of this repository.
- [ ] Document the branch flow as it is used, with `develop` as the local integration
      branch, in `ref/DEPLOYMENT.md` and `CONTRIBUTING.md`. Say which branch an outside
      contributor targets, since `develop` is not on GitHub.

### Session 3.2: repository hygiene

- [ ] Add `CODE_OF_CONDUCT.md`, `SECURITY.md`, `CODEOWNERS`, a pull request template and
      issue forms for bug, feature and docs. They live in this repository. See decision
      D10.
- [ ] Add labels for area (`pkg:docs`, `site`, `ci`) and for triage.
- [ ] Enable Discussions or remove the link from `CONTRIBUTING.md`.
- [ ] Add a pre-commit hook that runs Prettier and ESLint on staged files.
- [ ] Add Renovate or Dependabot. Group the `@chassis-ui/*` packages and the Astro
      packages.
- [ ] Turn each open session of this roadmap into a GitHub issue and each phase into a
      milestone. Label two or three of them `good first issue`.

### Exit criteria

- Every command in `README.md` and `CONTRIBUTING.md` runs on a fresh clone.
- GitHub's community profile shows every item complete.
- A dependency update arrives as a pull request without anyone asking for it.

## Phase 4 — Production hardening of the website

**Goal:** the site meets a stated bar for security, privacy, accessibility and
performance, and CI holds it there.

### Session 4.1: security

- [ ] Add headers in `vercel.json`: `Content-Security-Policy`,
      `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
      `X-Frame-Options` or `frame-ancestors`. Start the policy in report-only mode.
      Headers set here also apply to the proxied sibling pages, so test one page of each.
- [ ] In `api/contact.ts`: escape every value that goes into the HTML, cap field lengths,
      strip line breaks from the subject, check the `Origin` header, and add rate
      limiting or a challenge.
- [ ] Add an `.env.example` that names `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and
      `RESEND_TO_EMAIL`.

### Session 4.2: routing

- [ ] Add the `/react/*` and `/react/sitemap*` rewrites for production and staging.
- [ ] Add path-based static rewrites next to the referrer-based ones, one prefix per
      sibling, for example `/css/static/`. Keep the referrer-based rewrites. They go
      when the last sibling has been upgraded and deployed. Decided, see D6.
- [ ] Add a link checker over the built site and the proxied routes.

### Session 4.3: privacy and legal

- [ ] Decide how analytics gets consent. See decision D14. Add the mechanism to
      `Analytics.astro` in the package.
- [ ] Add a privacy page to the website. Link it from the footer and from the contact
      form.
- [ ] Decide whether fonts stay on Google's servers or are served from
      `chassis-assets`. See decision D15.
- [ ] Settle F28. If code was adapted from Bootstrap, add the notice to `LICENSE` or a
      `NOTICE` file here and in the package.

### Session 4.4: quality gates and operations

- [ ] Fix the colour-contrast failure that every page shares. See F35.
- [ ] Bring Lighthouse performance to the 0.9 target on the home page and one docs page.
- [ ] Add automated accessibility checks with axe against the built site.
- [ ] Do one manual pass with a keyboard and a screen reader. Record the result.
- [ ] Add uptime monitoring for the site, the contact endpoint and one page of each
      proxied sibling.
- [ ] Write `ref/OPERATIONS.md`: how to roll back a deployment, what to do when a
      proxied site is down, how to rotate the Resend and npm credentials.

### Exit criteria

- An external header scan gives the site an A grade.
- The contact endpoint rejects oversized and cross-origin requests.
- Lighthouse and axe run on every deployment and pass.
- A visitor can read what is collected before anything is collected.

## Phase 5 — Ecosystem support

**Goal:** this repository gives the siblings what they need to align. Whether and when a
sibling uses it is that sibling's project.

tokens, css and react are the reference for tooling. They already have Changesets,
provenance publishing, Dependabot and community files. This phase reads them and does not
change them.

### Session 5.1: shared commands

- [ ] Publish `sync-submodules`, `html-validate`, `vnu-jar` and `build-site` as commands
      of the package. See decision D8. Take the improvements from the `chassis-react`
      fork of `sync-submodules.js`.
- [ ] Make the website use the commands, and delete its copies under `build/`.
- [ ] Record the replacement for each copied script in
      [SIBLING_TASKS.md](SIBLING_TASKS.md).

### Session 5.2: shared workflows and this repository's own upgrades

- [ ] Add reusable workflows to this repository for lint, type check and site build. A
      sibling calls them as `chassis-ui/website/.github/workflows/<file>@<ref>`.
- [ ] Settle one Node version for the ecosystem. CI uses 18, 20, 22 and 24 today and
      `engines` says `>=18`, `>=22`, `>=24` or nothing. See decision D7.
- [ ] Move the website to `@chassis-ui/tokens` 0.6.
- [ ] Move the website's assets submodule to the current commit. Decide whether the
      website keeps the submodule. See decision D9.

### Session 5.3: canary and compatibility

- [ ] Add a canary job that clones each sibling whose range accepts the version being
      released, installs the packed package into it and builds its site. It runs before
      a release and reports. It does not push anything.
- [ ] Publish a compatibility table: which `@chassis-ui/docs` version works with which
      `@chassis-ui/css`, `@chassis-ui/tokens` and Astro versions.
- [ ] Review [SIBLING_TASKS.md](SIBLING_TASKS.md) against the current state of each
      sibling. Remove what is done.

### Exit criteria

- The website carries no copy of a script or library that the package provides.
- A release that a sibling's range accepts, and that would break its build, is reported
  before it is published.
- Every sibling task names the release of this repository that makes it possible.

## Parked

Considered and left out for now. Each needs a reason to come back.

| Item                              | Why it is parked                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Versioned docs                    | `docs_version` is commented out in `config.ts` and `path.ts`. No package is at 1.0, so there is one version to document.    |
| Search across all sites           | Pagefind indexes each site on its own. A shared index needs every sibling to take part.                                     |
| Compiled package output           | Astro consumes `.astro` and `.ts` source directly. A build step adds work and no benefit until a non-Astro consumer exists. |
| Translations                      | No request for them.                                                                                                        |
| A `chassis-ui/.github` repository | See decision D10.                                                                                                           |

## Decisions

| ID  | Decision                                                                                 | Recommendation or outcome                                                                                                                                         | Status  |
| --- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| D1  | How are `main` and `staging` protected?                                                  | No pull request. A ruleset blocks force push and deletion on `main` and `staging`. CI stays advisory.                                                             | decided |
| D2  | Names of the config keys for issues 1 and 2.                                             | `sourceDir`, `sourcePath`, `sitePath`, `siteBranch`. All optional.                                                                                                | decided |
| D3  | Does Lighthouse block a deployment or only report?                                       | Accessibility below 0.9 fails the run. The other categories only warn. The run cannot stop a deploy.                                                              | decided |
| D4  | Keep the `@libs/*` alias contract or add an Astro integration with virtual modules?      | Clean break in 0.6.0. An Astro integration replaces the aliases. The siblings stay on 0.5 until they are upgraded.                                                | decided |
| D5  | Changesets or the existing version script?                                               | Changesets. It handles prereleases, changelogs and the release pull request. tokens, css and react use it.                                                        | open    |
| D6  | Replace referrer-based static routing?                                                   | Two steps. Add path-based rewrites in this project. Remove the referrer-based ones when the last sibling has been upgraded and deployed.                          | decided |
| D7  | Which Node version does the ecosystem support?                                           | Node 24 for development and CI, `engines` at `>=22`.                                                                                                              | open    |
| D8  | Where do the shared build scripts live?                                                  | In `@chassis-ui/docs` as `bin` entries. A second package is more to release for little gain.                                                                      | open    |
| D9  | Does the website keep the assets submodule?                                              | Replace it with the files served from the assets deployment, if the site only needs the built docs assets. Check what the build reads from `vendor/assets` first. | open    |
| D10 | Community files in each repository, or inherited from a `chassis-ui/.github` repository? | In each repository. See the note below.                                                                                                                           | open    |
| D11 | Does the website have a version and a changelog?                                         | No version. The root changelog becomes the website's log by date. The package has its own.                                                                        | open    |
| D12 | What is the docs section of the website for?                                             | Either a real "Getting started with Chassis" guide that links to the sibling docs, or nothing. Remove the route if nothing.                                       | open    |
| D13 | Does `examples/` stay?                                                                   | Keep `vanilla-html` and build it in CI. Drop `react-app`, since `chassis-react` now covers it.                                                                    | open    |
| D14 | How does analytics get consent?                                                          | A consent banner, or a switch to an analytics service that sets no cookies. This is a legal question first.                                                       | open    |
| D15 | Where are fonts served from?                                                             | From `chassis-assets`. It removes a third-party request and a privacy question.                                                                                   | open    |
| D16 | How is 0.5.1 released?                                                                   | Push `develop` to `staging`, check CI and the staging deploy, then push the same commit to `main`. That publishes to npm and deploys production.                  | decided |

### Note on D10

GitHub reads default community files from one place only: a public repository named
`.github` in the organisation. This repository cannot take that role. That is the only
reason a new repository was proposed.

It is not needed. The recommendation is that each repository holds its own files:

- A default file is not part of the repository. It is missing from clones, from the file
  browser and from anything an agent or a contributor reads offline.
- A repository that has its own file ignores the default. tokens, css and react already
  have their own, so the default would serve four repositories, not seven.
- `CONTRIBUTING.md` differs per repository, because setup and commands differ. A shared
  default would be either vague or wrong.
- `CODE_OF_CONDUCT.md` and `SECURITY.md` are the same everywhere and change rarely. The
  cost of seven copies is low.
- A license cannot be inherited at all.

Shared workflows are different. A reusable workflow can live in any repository, so they
go here, in session 5.2.

## Session log

| Date       | Session  | What was done                                                                                                                                                                                               |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-29 | Review   | Reviewed the repository, the sibling repositories and the open issues. Wrote this roadmap. No code changed.                                                                                                 |
| 2026-09-29 | Review   | Added the model column. Limited the scope to this repository and moved sibling work to `SIBLING_TASKS.md`. Added findings F26 to F34, the compatibility rule, session 4.3 and decisions D10 to D15.         |
| 2026-09-29 | Review   | Removed the compatibility rule at the maintainer's request. Breaking changes ship in 0.6.0 and the siblings are upgraded afterwards. Decided D4 and D6.                                                     |
| 2026-09-29 | Review   | Reworded F25 and session 3.1: `develop` is the local integration branch and stays unpushed.                                                                                                                 |
| 2026-09-29 | 0.1, 0.2 | Phase 0 done on `develop`. CI fixed and extended, dependencies upgraded, build pinned, Lighthouse fixed, stale files removed, GitHub ruleset and security features on. Decided D1 and D3. Added F35 to F37. |
| 2026-09-29 | 1.1, 1.2 | Fixed issues 1 and 2, documented the site contract, bumped to 0.5.1. Checked against chassis-css and chassis-tokens in scratch clones. Decided D2 and D16. Added F38 and F39. Release pending.              |
