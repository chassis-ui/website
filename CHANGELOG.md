# Changelog

Changes to the website at [chassis-ui.com](https://chassis-ui.com) and to the tooling of this repository, by date. The website has no version.

The package `@chassis-ui/docs` has its own changelog, [packages/docs/CHANGELOG.md](packages/docs/CHANGELOG.md). It also holds the history of this repository up to 0.5.1, when the two shared this file.

## 2026-10-27

### Changed

- The website and the starter of `@chassis-ui/docs` use `@chassis-ui/css` 0.11.1 and `@chassis-ui/tokens` 0.10.1, and `@chassis-ui/docs` is built and tested with them. Its peer range stays `>=0.10.0`. On the pages of the site one thing changes: the arrow of the "Read more" and "Back to Blog" links of the blog is 16 pixels, `1em` of the link text, where it was 18, as css 0.11.0 sizes the icon of an icon link. The CDN links of the installation page are for css 0.11.1; they were for 0.7.2, and the text said 0.7.1.
- The site is built with Astro 7.4.2, where it was 7.3.8. The pages are the same but for the version in their `generator` tag, and the scripts and the stylesheet of the site have new file names.
- The fixture jobs of CI set up Node.js without the pnpm cache. The starter installs with a store of its own, so the cache was never read, and when the lockfile changed the job failed after the build, as it did on the pull request of the development dependencies.

### Fixed

- The search trigger of the header is named by its label, and the ⌘K hint is out of its accessible name. axe-core 4.14 checks that the visible text of a control is part of its name, and failed every page on the hint.

## 2026-10-26

### Changed

- The assets submodule is at `v0.5.0` of chassis-assets, `1e37c96` of `app/docs`, where it was `4382de9`. The docs build has a web app manifest, `other/manifest.json`, with a maskable icon, `favicon.svg`, a real `favicon.ico` and `site-logomark.svg`, and `images/logo/` has `logo-{light,dark,black,white}` in place of the `chassis-{logo,icon}-*` banners. `other/default.tokens.json` is gone.
- The head links `/static/other/manifest.json` of the assets, named Chassis UI, in place of the website's own `/static/images/manifest.json`, which is gone: `@chassis-ui/docs` 0.11.0. The starter depends on docs `^0.11.0` and keeps a manifest with its own name at `static/other/manifest.json`.
- The pages link the Chassis CSS, the icon stylesheet, `fonts/fonts.css` and the icon sprite with `?v=` and a hash of the file. Vercel sends those with `Cache-Control: public, max-age=31536000, immutable`, like the files of `/static/astro/`, and the files under `/static/` without `?v=` with `max-age=600`, where every file had `max-age=0, must-revalidate`: a browser asked for each file of a page on every page view, and each answer was an edge request of the plan.
- The branding section of the about page is back, with the light and the dark logo for download.
- `robots.txt` of production disallows `barkrowler`, `AhrefsBot` and `SemrushBot`, SEO crawlers that made a large part of the requests.

### Fixed

- The sitemap of a staging build leaves out `/404/`, `/docs/` and `/examples/vanilla-html/`, as the production sitemap does. A staging build has the URL of its deployment as its site, and the pages were matched by their `chassis-ui.com` URL, so none was left out: the Lighthouse check of staging followed the redirect of `/examples/vanilla-html/` and failed on the accessibility of example-1.chassis-ui.com, a site of the vanilla-example repository.

## 2026-10-19

### Changed

- The assets submodule is at `4382de9` of `app/docs`, where it was `784d885`. The docs build has one font stylesheet, `fonts/fonts.css`, in place of `text.css`, `display.css` and `code.css`, and the files of the `text` role are `ui` files, such as `ui-latin.woff2`. The `display` family is Montserrat, which the headings ask for since css 0.10 and which the build before did not have: the stylesheet of the pin declared Archivo Narrow. The logo, the favicons, the social image and `icons/cx-sprite.svg` are new. The sprite has `cx-react`.
- The navigation bar and the footer inline the logo, 2rem high, and its paths take the colors of the theme, and the head links `fonts/fonts.css`: `@chassis-ui/docs` 0.10.0. The starter depends on docs `^0.10.0`.
- The search of the header is the icon and the shortcut, 5rem wide, from 1024 pixels, and 12.5rem from 1280, where it was 200px: the links Blog and Examples ran under it between 1024 and about 1130 pixels.
- The module links of the home page are top-aligned, with less padding from 768 to 1023 pixels, where the six ran past the row, and no even background on phones. The Figma module is Figma Libraries.
- The repositories of the about page are a list whose whole rows are links, and their GitHub icon shows: the page had no sprite with it. The branding section of the about page is left out for now.
- The modules of the home page link React Components, `/react`, after the CSS Framework.

## 2026-10-18

### Changed

- The website and the starter of `@chassis-ui/docs` use `@chassis-ui/css` 0.10.0 and `@chassis-ui/tokens` 0.10.0, where they used css 0.7.2 and tokens 0.7.0. `@chassis-ui/docs` 0.9.0 reads the typography names of css 0.10 and is built and tested with it; its peer range is `>=0.10.0`. The stylesheet of the pages takes the changes of css 0.8 to 0.10 with it: the new base colors of the default tokens, the headings and the titles in the display family, Montserrat, in place of Inter, and no background gradient on buttons, badges and the other components that had one.
- The pages use `.font-h4` and `.font-h5` in place of `.h4` and `.h5`, which css 0.10 deprecates: the section titles of the privacy page, the empty state of the blog and the examples of the CSS section of the home page. The example of token-generated variables on the home page names `--cx-font-family-ui` and `--cx-font-size-ui-md`, the names of css 0.10.

## 2026-10-12

### Changed

- The header of the hero of the home page takes the full width of the grid up to the `xl` breakpoint, and ten of its twelve columns from there. It took the ten columns from `lg`.
- The assets submodule is at `784d885`, version 0.3.1 of chassis-assets, and `pnpm vendor` and `pnpm sync-submodules` pass `--subset symbols2` in place of `--subset U+2500-257F`: the range that chassis-assets names for the box drawing characters. The file of the range is `fonts/code-symbols2.woff2`, 3.1 KB, where `fonts/code-u2500-257f.woff2` was 2.7 KB: the range also has the block elements, `U+2580-259F`, six bracket pieces and eight spaces. The text and the display fonts have a file of the range too, which a page loads only when it shows such a character in that font. The home page loads the same three font files as before, `text-latin.woff2`, `code-latin.woff2` and the file of the range. The files of the code font that are not split, `code.woff2`, `code-normal.woff2` and `code-strong.woff2`, hold the wider range too and are 0.4 KB larger each. No other file of the docs build changed between `acb5d2e` and `784d885`.
- The vanilla HTML example moved to a repository of its own, [chassis-ui/vanilla-example](https://github.com/chassis-ui/vanilla-example), and is deployed as a website per brand from the same commit: [example-1.chassis-ui.com](https://example-1.chassis-ui.com/) with the design tokens, the fonts and the logo of the `chassis` brand, and [example-2.chassis-ui.com](https://example-2.chassis-ui.com/) with those of `sinefil`. The examples page links both sites and the repository, and the installation page links the repository. `/examples/vanilla-html/`, where the example was served, is a redirect page to the first site, and it is not in the sitemap.
- The website and the starter of `@chassis-ui/docs` use `@chassis-ui/css` 0.7.2, and `@chassis-ui/docs` is built and tested with it. Its peer range stays `>=0.6.0`, and no version of it is released for this. The stylesheet of the pages, `/static/css/chassis.min.css`, has one change: a closed dialog and a closed drawer have no transition, so the search dialog and the navigation drawer cannot stay on screen after they close, as they could in WebKit on a busy page. They open and close with the motion they had. The CDN links of the installation page are for css 0.7.2.
- The site is built with Astro 7.3.8, where it was 7.3.5. The pages are the same but for the version in their `generator` tag, and the scripts of the site have new file names.

### Fixed

- The starter of `@chassis-ui/docs` has a web app manifest, `static/images/manifest.json`, and its `src/libs/static.ts` copies `static/` of the site into `public/static/` after the files of the Chassis packages. The head of every page links `/static/images/manifest.json`, which is not in the docs build of chassis-assets: each of the seven sites has its own, and a site made from the starter had none. The fixture sites check the file and its link.

### Removed

- The content security policy no longer allows Google Fonts: `fonts.googleapis.com` left `style-src` and `fonts.gstatic.com` left `font-src` in `vercel.json`. The header covers the pages of the six other projects too. A project that is built with `@chassis-ui/docs` 0.7.0 or earlier still loads its fonts from Google Fonts, so its pages report a violation of both directives until it takes a later version. The policy is report-only and blocks nothing.
- The privacy page has no "Fonts" section: no request of a page goes to Google for a font, and the font files come with the site, which "Hosting" covers.
- `examples/` and what built it: the `examples/*` packages of the workspace, `pnpm examples:build` and its step in `pnpm site:build`, the copy of each `dist/` into `public/examples/` by the site's integration, the pages of the example in `build/check-csp.js` and the ESLint block for the folder. The site build has three steps: the vendor assets, the site and the search index. The issue forms no longer offer the examples as an area: an issue of the example belongs in its repository.

## 2026-10-11

### Changed

- The pages load their fonts from the site, no longer from Google Fonts. The head links `fonts/text.css`, `fonts/display.css` and `fonts/code.css` under `/static/`, from the docs build of chassis-assets at `acb5d2e`, which declare Inter, Archivo Narrow and Fira Code as variable fonts. No request of a page goes to `fonts.googleapis.com` or `fonts.gstatic.com`. Inter has an italic file now, where the browser slanted the upright one. The content security policy and the privacy page still name Google Fonts: both cover the sites of the other projects, which load it until they take the next version of `@chassis-ui/docs`.
- `pnpm vendor` and `pnpm sync-submodules` write a subset of each font, with `--subset` and `--split` of `chassis-docs`: `latin`, `latin-ext` and `U+2500-257F`, the box drawing characters of the file trees on the home page, each range in a file of its own that a page loads when it has a character of it. A page in English loads 114 KB of fonts, `text-latin.woff2` of 69 KB, `code-latin.woff2` of 43 KB and the box drawing characters, where Google Fonts sent 85 KB for the two fonts; the whole files are 349 KB and 109 KB. The blog pages load `text-latin-ext.woff2` too, 90 KB, for a letter of an author's name. The commands install the package of the build in the submodule, which holds the package that subsets a font.
- The optical size axis of Inter is fixed at 14 in the fonts of the site, as chassis-assets sets it for the brand. The font of Google Fonts had no such axis, and with it a browser draws large text narrower: the longest line of the heading of the home page, at 57 pixels, is 786 pixels wide as before, where it was 726 with the axis.
- A browser keeps the font files under `/static/fonts/` for a week: `vercel.json` sends them with `Cache-Control: public, max-age=604800`. They were sent with `max-age=0, must-revalidate`, so a visitor asked for each font again on every page. The font stylesheets are still asked for each time.

## 2026-10-08

### Changed

- The website, the vanilla HTML example and the starter of `@chassis-ui/docs` use `@chassis-ui/css` 0.7.1, and `@chassis-ui/docs` is built and tested with it. Its peer range stays `>=0.6.0`, and no version of it is released for this. Nothing changes on screen: the boxes and the colors of every element of 11 pages are the same in Chrome before and after, in both color modes.
- The CDN links of the installation page are for `@chassis-ui/css` 0.7.1.

### Fixed

- Axe can measure the color contrast of a light page. css 0.7.0 wrote white as `oklch(100% 0 none)`, which axe-core 4.13 cannot parse: its `color-contrast` rule stopped on every page in the light mode and reported nothing. css 0.7.1 writes such colors as `oklab()`. The rule is still off in `build/check-a11y.js`, see issue 6: with it on, every page fails in the light mode.

## 2026-10-07

### Changed

- The website, the vanilla HTML example and the starter of `@chassis-ui/docs` use `@chassis-ui/css` 0.7.0 and `@chassis-ui/tokens` 0.7.0. No markup or style of the website changed: the built pages differ from the ones before by the names of five script files. The new values are those of the tokens. The page margin is 1rem, and 1.5rem from `md`, where it was 0.75rem at every width. The gap of a grid is 1rem, and 1.5rem from `md`, where it went from 0.5rem to 3rem. Subtle text is less transparent, and in the dark theme the text and link colors of the contexts are lighter. Text wraps in a column that is 8 pixels narrower at 375 pixels, so pages are longer there, the home page by 223 pixels: its hero heading takes five lines instead of four. No page gained or lost sideways scroll at 375, 1024 or 1440 pixels.
- `@chassis-ui/docs` is built and tested with css 0.7.0. Its source uses nothing that 0.7.0 removed or renamed, its peer range stays `>=0.6.0`, and no version of it is released for this.
- The CDN links of the installation page are for `@chassis-ui/css` 0.7.0.
- `ref/CHASSIS_CSS.md` describes the grid of css 0.7.0: the flexbox grid is removed, `col-auto` is a class of the CSS grid, the gap is 1rem and 1.5rem, and `grid-fill`, `grid contained` and the `@md:` variants are named.

## 2026-10-06

### Changed

- The website uses `@chassis-ui/css` 0.6.0 and its CSS grid. The home page, the about page, the blog, the examples page and the privacy page use `.grid` with `col-span-*` in place of the flexbox grid, `.row` with `.col-*`, which css 0.6 deprecates. The pages look as before. Columns that had the fixed gutter of 1.5rem have the gutter of the breakpoint and move by a few pixels, and the line under a blog post in the list is as wide as the text, not 12 pixels wider on each side.
- The vanilla HTML example uses `@chassis-ui/css` 0.6.0 and the CSS grid.
- The CDN links of the installation page are for `@chassis-ui/css` 0.6.0.
- `ref/CHASSIS_CSS.md` converts Bootstrap's grid to the CSS grid.
- The five feature sliders of the home page are carousels of Chassis CSS. They were built on Swiper, whose script and stylesheet the page loaded from jsDelivr. The cards, their sizes and the two buttons are where they were. A touch, a trackpad, the buttons and the arrow keys move the row. Dragging it with the mouse no longer does.
- The frequently asked questions of the home page open and close with the height transition of the accordion of Chassis CSS: the accordion has `data-cx-accordion`.
- The Nu Html Checker is `vnu-jar` 26.10.2, for `chassis-docs vnu` too: the docs package resolved 26.9.27 next to the website, and `@shikijs/transformers` 4.4.3 next to 4.5.0. Version 26.10.2 rejects `width: calc(100vw - var(--cx-space-5xl))` of the buttons of the feature sliders with "CSS: “width”: The types are incompatible", which 26.9.27 accepts. The declaration is valid, so `pnpm site:lint:vnu` filters the message, for every `width`.
- The peer dependencies of `@chassis-ui/docs` that the website or the root installs are devDependencies of the package too, with the ranges of the website, so that Dependabot updates both. A test fails when the lockfile has two versions of a peer, or when such a peer is not a devDependency.

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
