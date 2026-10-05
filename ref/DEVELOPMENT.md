# Development reference

How the parts of this repository work. The setup, the commands and the branch flow are in
[CONTRIBUTING.md](../CONTRIBUTING.md). How the Chassis repositories fit together is in
[ARCHITECTURE.md](ARCHITECTURE.md).

## The workspace

`pnpm-workspace.yaml` lists two groups of packages:

| Path               | Package                     | Published |
| ------------------ | --------------------------- | --------- |
| `packages/website` | `chassis-website`, the site | no        |
| `packages/docs`    | `@chassis-ui/docs`          | npm       |
| `examples/*`       | one package per example     | no        |

The website depends on `@chassis-ui/docs` as `workspace:*`, so it always uses the source in
`packages/docs`. A change there shows in `pnpm dev` at once. The package has no build
step: sites consume its `.astro` and `.ts` files directly.

`@chassis-ui/css`, `@chassis-ui/tokens` and `@chassis-ui/icons` come from npm, at the
ranges in `packages/website/package.json`.

## How the site is built

`pnpm build` runs `pnpm site:build`, which Vercel runs too. It runs four steps in turn:

1. **Vendor assets.** `pnpm vendor` runs `chassis-docs vendor`, a command of
   `@chassis-ui/docs`. It checks out `vendor/assets` at the commit this repository pins,
   pulls its Git LFS files, installs its dependencies and runs its `pnpm assets:site`. The
   output is `vendor/assets/dist/web/docs/chassis`.
2. **Examples.** `pnpm examples:build` builds each workspace package in `examples/`.
3. **Site.** `astro build` in `packages/website`. Astro writes to `_site/`.
4. **Search.** `pagefind --site _site` indexes the pages that `pagefind.yml` selects.

`pnpm clean` deletes `_site`, and the `.astro`, `node_modules` and `public` folders of the
website.

`pnpm site` builds, then validates the HTML with the Nu Html Checker and checks the links
and the accessibility. CI's Build job runs `pnpm site:build`, then `pnpm site:lint:html`,
`pnpm site:lint:vnu`, `pnpm site:lint:links` and `pnpm site:lint:a11y`.

The validators are the `html-validate` and `vnu` commands of `@chassis-ui/docs`, which every
Chassis site shares. The rules that only this site needs are in
`packages/website/html-validate.json`. See [Commands](../packages/docs/README.md#commands)
in the README of the package.

When a validator fails, fix the markup if the error is real. When the markup is right on
purpose, add an exception for this site:

- A rule of html-validate: change it in `packages/website/html-validate.json`.
- A file or folder that neither validator should check: add `--ignore <path>` to the
  `site:lint:html` and `site:lint:vnu` scripts in the root `package.json`. The path is
  relative to the root, for example `_site/examples`. `static/icons` stays skipped.
- A message of the Nu Html Checker: add `--filter <regex>` to `site:lint:vnu`, copied from
  the message. With more than two, move them to a filter file and pass `--filter-file`.

Say in the commit message why the exception is right. See
[Validating HTML](../packages/docs/README.md#validating-html) for what each option does.

### What the site copies into `public/`

Before each dev or build run, the site's integration in `packages/website/src/libs/astro.ts`
empties `packages/website/public/` and fills it again:

| From                                     | To                    |
| ---------------------------------------- | --------------------- |
| `packages/website/static/`               | `/`                   |
| The docs build of `vendor/assets`        | `/static/`            |
| `dist` of `@chassis-ui/css`              | `/static/`            |
| `icons` of `@chassis-ui/icons`           | `/static/icons/`      |
| `dist` of each example                   | `/examples/<folder>/` |
| `_site/pagefind/`, when a build made one | `/pagefind/`          |

`public/` is generated. Change the sources, not the copies.

### Search

`pagefind.yml` selects the pages that search covers: About, the examples page, the blog
posts and the docs guide. The dev server has search only after a build, because it serves
the index of the last build.

## The `vendor/assets` submodule

`vendor/assets` is [chassis-assets](https://github.com/chassis-ui/assets) at a commit that
this repository pins. Every build uses that commit, so the same commit of this repository
always builds the same site.

- `pnpm vendor` builds the pinned commit. Run it after cloning and whenever the pin
  changes, for example after a pull.
- `pnpm sync-submodules` moves the pin to the latest commit of the `app/docs` branch of
  chassis-assets and builds it. `SUBMODULE_BRANCH=<branch>` picks another branch. Check
  the site, then commit `vendor/assets` on its own.
- `pnpm dev` does not touch the submodule.

Changes to the assets belong in the chassis-assets repository, not in `vendor/assets`.

## Examples

Each folder in `examples/` is a workspace package with a `build` script that writes
`dist/`. `pnpm examples:build` builds them all, and the site build runs it before
`astro build`. The site serves each `dist/` under `/examples/<folder>/`, and the examples
page links to it.

To add an example, create the folder with a `package.json` whose `build` script writes
`dist/`, and link it from `packages/website/src/pages/examples.astro`.

## Working on `@chassis-ui/docs`

The package README, [packages/docs/README.md](../packages/docs/README.md), is the contract
with the sites that use it. Update it with any change to what it describes.

- `pnpm test` runs the package's unit and component tests, and the tests of the functions
  in `api/`.
- `pnpm test:fixtures` packs the package and builds the starter site in
  `packages/docs/starter` from the tarball, the way a sibling installs it.
- `pnpm check:astro:docs` type-checks the package without the website.
- A change to the package needs a changeset. See
  [Releases](../CONTRIBUTING.md#releases).

### Trying a change in a sibling project

Pack the package and install the tarball in the package of the sibling that depends on
it. That is `packages/site` in tokens, css, assets and react, and the root of the
repository in icons and figma:

```bash
cd packages/docs
pnpm pack --pack-destination /tmp
cd ../../../chassis-css/packages/site
pnpm add -D /tmp/chassis-ui-docs-<version>.tgz
```

Revert the sibling's `package.json` and lockfile afterwards.

### Using an unpublished Chassis CSS or Icons

To try a change of `chassis-css` or `chassis-icons` in the website before it is
published, override the dependency with a sibling checkout, next to this one on disk:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'examples/*'
overrides:
  '@chassis-ui/css': link:../chassis-css/packages/css
  '@chassis-ui/icons': link:../chassis-icons
```

Run `pnpm install`. Remove the override before you commit.

## Styles

- `packages/website/src/scss/docs.scss` is loaded on every page. It loads the Chassis CSS
  configuration and mixins, then the styles of the package, `@chassis-ui/docs/scss/main`.
- `home.scss` and `blog.scss` are imported by the pages that need them.
- The package's own partials are in `packages/docs/src/scss/`.

Chassis CSS uses `@use`, not `@import`. A breakpoint is a prefix of a utility class, as in
`md:py-6xl`. [CHASSIS_CSS.md](CHASSIS_CSS.md) has the full mapping from Bootstrap.

## Troubleshooting

**The dev server stops with "Could not find the docs build of chassis-assets".** The
vendor assets are not built. Run `pnpm vendor`.

**Images are missing or broken.** Git LFS was not installed when the submodule was
checked out, so the images are pointer files. Run `git lfs install`, then `pnpm vendor`.

**The build uses stale files.** Run `pnpm clean`, then `pnpm install` and `pnpm build`.

**Type errors.** `pnpm check:astro:site` and `pnpm check:astro:docs` check each package on
its own.

## Editor

The `.vscode` folder recommends the Astro, ESLint, Stylelint, EditorConfig and Code
Spell Checker extensions, and fixes ESLint and Stylelint problems on save.
