# Review of the Copied Site Libraries and Scripts

> **Purpose:** the record of roadmap session 2.1. Seven sites carried their own
> copy of `src/libs/*`, because `@chassis-ui/docs` imported those modules from the site.
> This document lists every difference between the copies and says what each one is.
> [Build scripts](#build-scripts) does the same for the scripts under `build/`, the record
> of session 5.1.
>
> **Baseline:** read on 2026-09-29. `chassis-website` at `c838de3`, `chassis-css` on its
> `develop` branch, the other siblings on `main`. Nothing in a sibling was changed.
>
> **Related:** [ROADMAP.md](ROADMAP.md) session 2.1, and the contract that replaced the
> copies in the [package README](../packages/docs/README.md).

## How to read the tables

Each difference has one of three kinds:

| Kind     | Meaning                                                                         |
| -------- | ------------------------------------------------------------------------------- |
| need     | The site needs it. The package has to allow for it.                             |
| bug      | It produces a wrong result, or will under conditions that can occur.            |
| accident | It has no purpose: formatting, a leftover from a copy, or a stale older version |

"In 0.6" says what the package does about it. The website is the reference copy, so a
difference is described as the sibling's, unless the website is the odd one out.

## What the copies had in common

Six files were the same code in every site, apart from the differences below:
`config.ts`, `data.ts`, `path.ts`, `remark.ts`, `clipboard.ts` and `validation.ts`. One
cause explains most of the differences that are needs: **the code found files from the
working directory of the build**. Four sites are built from the site's own directory.
`chassis-assets`, `chassis-icons` and `chassis-figma` are built from the root of the
repository with `astro build --root site`. Each copy was adjusted to where its site is
built from.

In 0.6 the integration takes the site's root from Astro, so the working directory does
not matter and those adjustments are not needed.

## `config.ts`

| Difference                                                                      | Where                   | Kind     | In 0.6                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reads `./site/config.yml`, not `./config.yml`                                   | assets, icons, figma    | need     | Found from the Astro root                                                                                                                                                                                                                     |
| `sourceDir`, `sourcePath`, `sitePath`, `siteBranch` are missing from the schema | all but website and css | bug      | In the schema of the package. `z.object` dropped the keys silently, so setting them in `config.yml` had no effect                                                                                                                             |
| `sourceDir` and `sourcePath` are required                                       | css                     | need     | Optional with defaults. css sets both                                                                                                                                                                                                         |
| `blog` is an object with `pageSize`                                             | website                 | need     | A key of the site. The website extends the schema                                                                                                                                                                                             |
| `blog` is a URL that nothing reads                                              | all siblings            | accident | A key of the site, or deleted                                                                                                                                                                                                                 |
| `cdn`, `download`                                                               | css                     | need     | Keys of the site                                                                                                                                                                                                                              |
| `download`, `example_icon`                                                      | icons                   | need     | Keys of the site                                                                                                                                                                                                                              |
| `docs_version`                                                                  | figma, react            | need     | A key of the site                                                                                                                                                                                                                             |
| `cssDocsPath`                                                                   | react                   | need     | A key of the site                                                                                                                                                                                                                             |
| `github_org` is a URL, `x_username` is named `x`, `figma_handle` is missing     | react                   | bug      | The copy predates the rename in 0.3. The header of the package builds `https://github.com/https://github.com/chassis-ui` and `https://figma.com/@undefined` from it. In 0.6 the three keys are optional, and a URL in `githubOrg` is rejected |
| Line breaks in the error message, a comment that is commented out               | several                 | accident | One copy                                                                                                                                                                                                                                      |

## `validation.ts`

| Difference                                       | Where              | Kind     | In 0.6                                            |
| ------------------------------------------------ | ------------------ | -------- | ------------------------------------------------- |
| The regular expression has another name          | all but css, icons | accident | One copy, in `@chassis-ui/docs/schema`            |
| `zHexColor`, `zNamedHexColors`, `zPxSizeOrEmpty` | css                | need     | Stay in the site. Only the data of css uses them  |
| The same three                                   | icons              | accident | Copied from css with `data.ts`. Nothing uses them |

## `content.ts`

| Difference                                       | Where        | Kind     | In 0.6                                                                                     |
| ------------------------------------------------ | ------------ | -------- | ------------------------------------------------------------------------------------------ |
| `blogPages`                                      | website      | need     | Stays in the site                                                                          |
| `figmaPages`                                     | figma        | need     | Stays in the site                                                                          |
| `iconsPages` and no `docsPages`                  | icons        | need     | The site has no `docs` collection and does not use `DocsLayout`. It would fail if it did   |
| The type `CalloutName` is missing                | all siblings | accident | `Callout` of the package imported the type. It resolved to nothing. The prop is a `string` |
| `CalloutName` lists four names that do not exist | website      | accident | Removed                                                                                    |
| No `callouts` export                             | react        | accident | The package reads the collection itself                                                    |

## `data.ts`

| Difference                                                                   | Where                             | Kind     | In 0.6                                                                                                                            |
| ---------------------------------------------------------------------------- | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Reads `./site/data/`, not `./data/`                                          | assets, icons, figma              | need     | Found from the Astro root                                                                                                         |
| The sidebar schema has no `group`, `href`, `section`, `meta` or nested pages | tokens, css, assets, icons, figma | bug      | An older copy. `DocsSidebar` of the package renders groups, and the schema dropped them. One schema in the package, with all keys |
| Ten schemas for the data of the CSS docs                                     | css                               | need     | Stay in the site, loaded with `createDataLoader()`                                                                                |
| The same ten schemas, for files that do not exist                            | icons                             | accident | Copied from css                                                                                                                   |
| `core-team`, `docs-versions`, `translations`                                 | most                              | accident | Left from the Bootstrap docs. Nothing reads them. Removed from the website                                                        |
| The exported sidebar types are missing                                       | all but website and react         | accident | Exported from `@chassis-ui/docs/schema`                                                                                           |
| `z.ZodTypeAny`, which Zod 4 deprecates                                       | all siblings                      | accident | `z.ZodType`                                                                                                                       |

## `path.ts`

| Difference                                                                                  | Where                                | Kind     | In 0.6                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------- | ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paths are relative, not joined onto the working directory                                   | website, react                       | accident | Absolute, from the site's root                                                                                                                                                                            |
| `getChassisAssetsFsPath()`: `../../vendor/assets`, `vendor/assets` or `dist`, in four forms | all                                  | need     | The layouts differ: `packages/site`, `site/`, and the assets repository itself. One function that searches from the site's root up to the root of the repository, with a `dir` option                     |
| `getChassisTokensFsPath()`: `dist/tokens/web/docs` or `dist/web/docs`                       | website and react against the others | bug      | The tokens package moved the folder. The website's path is wrong twice, as it also names the wrong `node_modules`. **No site calls the function**, so nothing broke. One function that finds both folders |
| `getChassisCSSFsPath()` returns `../css/dist`, the workspace package                        | css                                  | need     | The `dir` option                                                                                                                                                                                          |
| `getChassisIconsFsPath()` returns the working directory                                     | icons                                | need     | The `dir` option                                                                                                                                                                                          |
| `getChassisDocsPath()` uses `path.join()`                                                   | tokens, css, assets, icons, figma    | bug      | `path.join()` builds a file path. On Windows it returns backslashes. String concatenation. An empty path still returns `docsPath` without a slash, as `path.join()` did                                   |
| `validateChassisDocsPaths()` logs a broken link and does not fail                           | tokens, css, assets, icons, figma    | bug      | Fails by default. `brokenDocsrefs: 'warn'` gives the old behaviour                                                                                                                                        |
| `getDocsRelativePath()` returns a path relative to `sourceDir`                              | css                                  | need     | `getSiteFsPath()`. The file components accept an absolute path                                                                                                                                            |

`validateChassisDocsPaths()` had a second limit in every copy. The list of paths was kept
in a module variable. Astro loads the configuration and renders the pages in separate
module graphs, so the check saw the paths from Markdown files and none from pages and
layouts. 0.6 keeps the same reach and says so: it checks `[[docsref:]]` links.

## `clipboard.ts`

| Difference                    | Where      | Kind     | In 0.6                   |
| ----------------------------- | ---------- | -------- | ------------------------ |
| A parameter has another name  | css, react | accident | One copy, in the package |
| `⌘` is written as a character | react      | accident | One copy, in the package |

## `shortcode.ts`

| Difference                                                      | Where                        | Kind | In 0.6                                                                               |
| --------------------------------------------------------------- | ---------------------------- | ---- | ------------------------------------------------------------------------------------ |
| Passes `modulesPath: process.cwd()`                             | tokens, assets, icons, figma | need | The package finds its shortcodes from its own location. The option is removed        |
| Re-implements the auto import to leave out `Icon` and `Example` | react                        | need | `exclude`, and a shortcode of the site replaces the package's shortcode of that name |

The package's shortcodes were imported by their absolute file path. That path is outside
the site when the package is linked from another folder, and the dev server refuses to
serve it. `chassis-react` widened `server.fs.allow` for that reason. In 0.6 they are
imported by `@chassis-ui/docs/shortcodes/<name>.astro`.

## `remark.ts`

| Difference                                         | Where   | Kind     | In 0.6                                  |
| -------------------------------------------------- | ------- | -------- | --------------------------------------- |
| Escapes in the regular expressions, lint comments  | several | accident | One copy, in the package                |
| `remarkCxSpec`                                     | figma   | need     | Stays in the site, passed as `markdown` |
| `remarkCxExample`, `remarkCxExampleInlineChildren` | react   | need     | Stay in the site, passed as `markdown`  |

A callout of `chassis-icons`, `info-sanitizer.md`, contains `[[config:docs_version]]`. The
config of that site has no such key. The build would fail if a page showed the callout.

## `astro.ts`

This file is not part of the contract. It was read because it is copied too. It stays in
each site in 0.6, by decision D17.

| Difference                                                                               | Where        | Kind     | Note                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An alias for `@chassis-ui/css` in dev, and `@chassis-ui/docs` left out of `optimizeDeps` | all siblings | need     | Scripts of the package and of the site import `@chassis-ui/css`, and two instances register every listener twice. The package causes this, so the integration is the right place for the fix. Done in session 2.3 without an alias. See F43 |
| The same alias in the build as well                                                      | css          | need     | As above                                                                                                                                                                                                                                    |
| The Pagefind index is copied to a folder with the site's prefix                          | all siblings | need     | The prefix is the first segment of `docsPath`                                                                                                                                                                                               |
| Injects the siblings' sitemaps                                                           | website      | need     |                                                                                                                                                                                                                                             |
| Copies `svgs` as well as `icons`                                                         | icons        | need     |                                                                                                                                                                                                                                             |
| Widens `server.fs.allow`, watches the React build and the examples                       | react        | need     | The first part is no longer needed. See `shortcode.ts`                                                                                                                                                                                      |
| Passes `rehypeCxTable`, which `getDocsMarkdownConfig()` already adds                     | figma        | accident | The plugin ran twice                                                                                                                                                                                                                        |

## Build scripts

Read on 2026-09-29 for roadmap session 5.1: `chassis-website` at `486da54`, `chassis-css`
on `develop`, `chassis-react` on `staging`, the other siblings on `main`. The website's
copies are the reference. Session 5.1 replaced them with the `chassis-docs` commands of the
package, and "In the command" says where each difference went.

| Script               | Copies                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `sync-submodules.js` | Identical in website, tokens, css, icons and figma. React forked it                           |
| `html-validate.js`   | Identical in website, assets, icons, figma and react. Tokens and css differ                   |
| `vnu-jar.js`         | Identical in website and react. Assets and icons share a second version. Figma and css differ |
| `build-site.js`      | Website, react and assets, each different                                                     |
| `change-version.js`  | Assets, icons and figma. Not replaced, see below                                              |

| Difference                                                                                       | Where                     | Kind     | In the command                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync-submodules` fetches the branch and creates it from `FETCH_HEAD` when the checkout has none | react                     | need     | Taken. A CI checkout has the submodule at a detached HEAD, and a bare `git checkout app/docs` failed                                                            |
| `sync-submodules` checks the build output in `dist/web/chassis-docs`                             | react                     | bug      | The output is `dist/web/docs/chassis`. The command checks that, and fails when it is missing. chassis-react deleted its copy                                    |
| `git lfs install` without `--local`                                                              | all                       | bug      | It wrote to the user's global Git config. The command writes to the submodule's                                                                                 |
| `git pull` of the branch may merge                                                               | all                       | accident | `git pull --ff-only`, which stops on a diverged branch                                                                                                          |
| Uncommitted changes in the submodule skip the sync with a warning, and the script succeeds       | all                       | accident | The command fails and says so                                                                                                                                   |
| `pnpm install` in the submodule, with or without `--ignore-workspace`                            | all                       | accident | `--ignore-workspace` always, so the submodule's own lockfile decides                                                                                            |
| Extra rules and `elements` for html-validate                                                     | css                       | need     | A JSON file passed with `--config`                                                                                                                              |
| The rule for the home page slider, `prefer-native-element` without `region`                      | website                   | need     | `packages/website/html-validate.json`. The package's defaults keep only what its layouts need                                                                   |
| `packages/css/js/tests` validated with the site                                                  | css                       | need     | Passed as a second path                                                                                                                                         |
| "behaviour" or "behavior" in a comment                                                           | tokens                    | accident |                                                                                                                                                                 |
| Filters for duplicate `dt` names                                                                 | figma                     | need     | `--filter`                                                                                                                                                      |
| Eleven filters, one of them with `.` in place of quotes                                          | css                       | need     | A file passed with `--filter-file`. Quotes can be written as they are, since no shell reads the pattern                                                         |
| `spawn` with `shell: true` and quoted arguments                                                  | assets, icons, figma, css | accident | No shell, so a pattern needs no quoting                                                                                                                         |
| `--asciiquotes`, so the output shows `"` where a filter must match `“`                           | all                       | accident | Dropped. A line copied from the output works as a filter                                                                                                        |
| `static/icons` left out of both validators                                                       | all                       | need     | The default, per path. `--ignore` adds to it                                                                                                                    |
| `build-site` moves the pin with `--remote`, and falls back to `sync-submodules`                  | react                     | bug      | The same as F26 was here: the build did not use the pinned commit. `chassis-docs vendor` builds the pin. chassis-react deleted the script, which nothing called |
| `build-site` builds the examples                                                                 | website                   | need     | A step of the site's own `build` script                                                                                                                         |
| `build-site` builds the repository's own assets, and has no submodule                            | assets                    | need     | Stays in the site's own scripts. Only the vendor step is shared                                                                                                 |
| `build-site` checks that `pnpm` and `git` exist, and that `_site` has an `index.html`            | website, react, assets    | accident | Left out. The build fails without them, and the link checker reads every page                                                                                   |

`change-version.js` bumps a version across files. It is not a docs-site script, and the
sites that have it publish nothing through this package. It stays with those three
repositories, which can move to Changesets as tokens, css, react and this repository have.

## What the package assumed and did not say

The review of the package itself found assumptions that the README of 0.5.1 did not list:

| Assumption                                                                        | In 0.6                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Head.astro` imports `@scss/docs.scss`, a second path alias                       | The `styles` option, with `src/scss/docs.scss` as the default                                             |
| The generated declarations import the site's shortcodes through `@shortcodes/*`   | They name the files, and are written to `.astro/`                                                         |
| `ScssDocs` adds `node_modules` of the working directory to the Sass load paths    | Every `node_modules` from the site's root to the root of the repository                                   |
| The shipped source imports types from packages that were development dependencies | They are dependencies                                                                                     |
| The layouts link to fixed URLs under `/static/`                                   | Unchanged in 0.6.0. Since 0.6.2 the path is the `staticPath` key of `config.yml`, `/static` by default    |
| The styles need `chassis-tokens` on the Sass load path. Found in session 2.3      | The integration adds the default one. A site sets a load path only for tokens of its own. See F49 and D22 |
| The build needs the docs build of `chassis-assets`. Found in session 2.3          | Unchanged. See F51                                                                                        |
| The header lists five sibling sites by name, without `chassis-react`              | Fixed in 0.6.1. See F44                                                                                   |
