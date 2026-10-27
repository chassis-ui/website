# Development reference

How the parts of this repository work. The setup, the commands and the branch flow are in
[CONTRIBUTING.md](../CONTRIBUTING.md). How the Chassis repositories fit together is in
[ARCHITECTURE.md](ARCHITECTURE.md).

## The workspace

`pnpm-workspace.yaml` lists the packages in `packages/`:

| Path               | Package                     | Published |
| ------------------ | --------------------------- | --------- |
| `packages/website` | `chassis-website`, the site | no        |
| `packages/docs`    | `@chassis-ui/docs`          | npm       |

The website depends on `@chassis-ui/docs` as `workspace:*`, so it always uses the source in
`packages/docs`. A change there shows in `pnpm dev` at once. The package has no build
step: sites consume its `.astro` and `.ts` files directly.

`@chassis-ui/css`, `@chassis-ui/tokens` and `@chassis-ui/icons` come from npm, at the
ranges in `packages/website/package.json`.

## How the site is built

`pnpm build` runs `pnpm site:build`, which Vercel runs too. It runs three steps in turn:

1. **Vendor assets.** `pnpm vendor` runs `chassis-docs vendor`, a command of
   `@chassis-ui/docs`. It checks out `vendor/assets` at the commit this repository pins,
   pulls its Git LFS files, installs its dependencies and runs its `pnpm assets:site`. The
   output is `vendor/assets/dist/web/docs/chassis`. The script passes three `--subset`
   ranges, so the fonts of the output hold these characters only: `latin` and `latin-ext`,
   the languages that are written in Latin letters, and `symbols2`, the range of
   chassis-assets that has the box drawing characters of the file trees on the home page.
   With `--subset` the build also fixes the optical size axis of Inter at 14, which
   chassis-assets sets for the brand: text has the width it had with Google Fonts. The
   script passes `--split` too, so each font is also written in a file per range, such as
   `text-latin.woff2`, and a page loads the file of a range only when it has a character
   of it. With `--subset` the command installs the package of the build in the submodule,
   which holds the package that subsets a font.
2. **Site.** `astro build` in `packages/website`. Astro writes to `_site/`.
3. **Search.** `pagefind --site _site` indexes the pages that `pagefind.yml` selects.

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

| From                                     | To               |
| ---------------------------------------- | ---------------- |
| `packages/website/static/`               | `/`              |
| The docs build of `vendor/assets`        | `/static/`       |
| `dist` of `@chassis-ui/css`              | `/static/`       |
| `icons` of `@chassis-ui/icons`           | `/static/icons/` |
| `_site/pagefind/`, when a build made one | `/pagefind/`     |

`public/` is generated. Change the sources, not the copies.

### Blog images

Images of the blog are not in this repository or in chassis-assets, which holds design
assets only. They are in the media library on Cloudinary, the account that `media.cloudinary`
of `packages/website/config.yml` names, and the pages load resized copies from
`res.cloudinary.com`. See
[Images of the media library](../packages/docs/README.md#images-of-the-media-library) for
the component and the URLs.

The public ID of an image is its URL, and the folder of the library is only where the image
is listed: an image can move to another folder and keep its URL. So the public ID carries
everything that tells two images apart: `blog-<year>-<slug>-<role>`, where the slug is the
name of the post's file and the role says what the image is, such as `cover`, or `diagram`
for an image inside the post. For example, `blog-2026-color-system-cover` belongs to
`content/blog/2026/color-system.mdx`. Lowercase and hyphens only.

To give a post a cover:

1. Export the cover at the ratio of the page, 1200 × 630, at 2400 × 1260. The page crops any
   other ratio around what Cloudinary takes for the subject, which can cut what matters, and
   enlarges an image narrower than 2400 pixels for the largest screens.
2. Upload it to the folder `blog/<year>/` of the media library, with the public ID above.
   Check the public ID that the library shows after the upload: depending on the upload
   settings, it can get a random suffix.
3. Set the public ID and a description of the picture in the front matter of the post. An
   extension is optional:

   ```yaml
   image:
     src: blog-2026-color-system-cover
     alt: A color wheel in an open swatch book, on paint chips beside paint jars and brushes
   ```

4. Open the post and the blog page in `pnpm dev`. A wrong public ID shows a broken image: the
   build does not load the images, so it cannot find one that is missing.

A post without `image` shows the default social image of the assets. Never replace an image
in the library under the same public ID: the browsers and the CDN keep a copy for up to 30
days. Upload the new version under a new public ID, such as `blog-2026-color-system-cover-2`,
and change the front matter.

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

An example is a repository of its own, not a part of this one. The site only links it: the
examples page, `packages/website/src/pages/examples.astro`, names each example with its
repository and its websites.

The vanilla HTML example is [chassis-ui/vanilla-example](https://github.com/chassis-ui/vanilla-example).
It is deployed as a website per brand from the same commit, `example-1.chassis-ui.com` for
`chassis` and `example-2.chassis-ui.com` for `sinefil`, each a Vercel project of its own.
The sites are not proxied under chassis-ui.com, so `vercel.json` has no rule for them and
the checks of this repository do not open them. Its README covers the build and the brands.

The example was a folder of this repository once, served at `/examples/vanilla-html/`.
That address is a redirect page to the first site now,
`packages/website/src/pages/examples/vanilla-html.astro`, and it is left out of the sitemap.

To add an example, add it to the list in the examples page.

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
