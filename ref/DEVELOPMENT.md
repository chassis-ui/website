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

`@chassis-ui/css`, `@chassis-ui/website-tokens` and `@chassis-ui/website-icons` come from npm, at the
ranges in `packages/website/package.json`.

## How the site is built

`pnpm build` runs `pnpm site:build`, which Vercel runs too. It runs three steps in turn:

1. **Vendor assets.** `pnpm vendor` runs `chassis-docs vendor`, a command of
   `@chassis-ui/docs`. It takes the archive of the brand from the release of
   chassis-ui/website-assets that `vendor/assets.json` pins, checks its SHA-256 against the
   pin, and unpacks it into `vendor/assets/dist/web/docs/chassis`. It does nothing when that
   folder already holds the archive. The release has made the choices about the fonts: they
   are split by range, so a page loads the file of a range only when it has a character of it.
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

| From                                      | To               |
| ----------------------------------------- | ---------------- |
| `packages/website/static/`                | `/`              |
| The assets in `vendor/assets`             | `/static/`       |
| `dist` of `@chassis-ui/css`               | `/static/`       |
| `dist/web` of `@chassis-ui/website-icons` | `/static/icons/` |
| `_site/pagefind/`, when a build made one  | `/pagefind/`     |

`public/` is generated. Change the sources, not the copies.

### Blog images

Images of the blog are not in this repository or in chassis-ui/assets, which holds design
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

## The assets

`vendor/assets.json` pins a release of
[chassis-ui/website-assets](https://github.com/chassis-ui/website-assets), with the SHA-256 of
each web archive, so the same commit of this repository always builds the same site.
`vendor/assets` is what `pnpm vendor` unpacks from it, and is not committed.

- `pnpm vendor` unpacks the pinned archive. `pnpm dev` and `pnpm build` run it, and it does
  nothing when the folder already holds the archive. A download is kept in `~/.cache/chassis-docs`
  (`XDG_CACHE_HOME` moves it). A digest that does not match fails the command.
- `pnpm sync-assets` moves the pin to the latest release and unpacks it. `--version` picks
  another release. Check the site, compare it with the build before the move, then commit
  `vendor/assets.json` on its own.
- `CHASSIS_ASSETS_CHECKOUT=<path>` names a local checkout of chassis-ui/website-assets, and
  `pnpm vendor` copies its `dist/web/<app>/<brand>` instead, for work on the assets and a site
  at once. Without the variable the next run takes the release again.

Changes to the assets belong in the chassis-ui/website-assets repository, not in `vendor/assets`.

### Preview another brand

The site is deployed for the `chassis` brand. Set `CHASSIS_BRAND` to see it with another:

```bash
CHASSIS_BRAND=sinefil pnpm dev
```

The archive of the brand is downloaded the first time and unpacked beside the others, and only
the brand of the run reaches `public/`. The tokens come from `@chassis-ui/website-tokens`, and
`css/chassis.css` and `css/chassis.min.css` are compiled with them, in place of the files of
`@chassis-ui/css`, which hold the tokens of `chassis`: a start takes some seconds longer. The
look changes and the words do not: `config.yml` and the pages stay those of Chassis.

`CHASSIS_APP` picks the app in the same way. The releases have one web app today, `docs`, so
another value fails and lists what exists. `brand` and `app` of `vendor/assets.json` are the
defaults, and an unknown brand fails before anything is written.

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
```

Then, in that package of your checkout of the sibling:

```bash
pnpm add -D /tmp/chassis-ui-docs-<version>.tgz
```

Revert the sibling's `package.json` and lockfile afterwards.

### Using an unpublished Chassis CSS or Icons

To try a change of `chassis-ui/css` or `chassis-ui/website-icons` in the website before it is
published, build your checkout of it and override the dependency with it, wherever that is on
disk:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
overrides:
  '@chassis-ui/css': link:<checkout of chassis-ui/css>/packages/css
  '@chassis-ui/website-icons': link:<checkout of chassis-ui/website-icons>
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

**The site stops with "Could not find the assets of the site".** `astro` ran without
`pnpm vendor`. Run `pnpm vendor`, or start it with `pnpm dev`.

**The build uses stale files.** Run `pnpm clean`, then `pnpm install` and `pnpm build`.

**Type errors.** `pnpm check:astro:site` and `pnpm check:astro:docs` check each package on
its own.

## Editor

The `.vscode` folder recommends the Astro, ESLint, Stylelint, EditorConfig and Code
Spell Checker extensions, and fixes ESLint and Stylelint problems on save.
