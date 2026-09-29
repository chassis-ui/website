# Chassis docs starter

A minimal documentation site built on [`@chassis-ui/docs`](https://www.npmjs.com/package/@chassis-ui/docs). Copy this folder to
start a new Chassis docs site.

CI builds this site from the packed package on every push, in the two layouts that Chassis
repositories use. See [`build/fixture-sites.js`](https://github.com/chassis-ui/website/blob/main/build/fixture-sites.js).

## Start

1. Copy this folder into your repository, for example as `site/` or `packages/site/`.
2. Add the `vendor/assets` submodule to your repository, on the `app/docs` branch of
   [chassis-ui/assets](https://github.com/chassis-ui/assets). The layouts link to the logo,
   favicons and social image from it.

   ```sh
   git submodule add -b app/docs https://github.com/chassis-ui/assets.git vendor/assets
   ```

3. Install the dependencies, build the assets and start the dev server.

   ```sh
   pnpm install
   pnpm vendor
   pnpm dev
   ```

   `pnpm vendor` builds the docs build of chassis-assets at the commit that the repository
   pins. Run it again when the pin moves.

`pnpm lint:html` validates the built site. See
[Commands](https://www.npmjs.com/package/@chassis-ui/docs#commands) in the README of the
package.

A site in `site/` whose dependencies are in the root of the repository runs
`astro dev --root site` from the root instead.

## What to change

| File                    | Change                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config.yml`            | Every key. Point `sourceDir` at the code that the site documents, relative to this folder, and set `sourcePath` and `sitePath` to where the code and the site are in the repository |
| `source/`               | Delete it. It stands in for the code that the site documents                                                                                                                        |
| `content/docs/`         | Your pages. `getting-started/shortcodes.mdx` shows every shortcode, so keep it until you know them                                                                                  |
| `data/sidebar.yml`      | The entries of your pages                                                                                                                                                           |
| `content/callouts/`     | Text that several pages show with `<Callout name>`                                                                                                                                  |
| `package.json`          | The name                                                                                                                                                                            |
| `src/pages/index.astro` | The home page                                                                                                                                                                       |

## What is in it

| File                             | Purpose                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `astro.config.ts`                | The integration of the package, MDX, and the Sass load path that the styles of `@chassis-ui/css` need |
| `src/libs/static.ts`             | Copies the files that the layouts link to under `/static/` into `public/static/`                      |
| `src/content.config.ts`          | The `docs` and `callouts` collections, with the schemas of the package                                |
| `src/pages/docs/[...slug].astro` | Renders each page of the `docs` collection with `DocsLayout`                                          |
| `src/pages/[...alias].astro`     | Redirects the paths in the `aliases` of a page to the page                                            |
| `src/env.d.ts`                   | Declares `@chassis-ui/css`, which has no types                                                        |

The [README of the package](https://www.npmjs.com/package/@chassis-ui/docs) describes each part.
