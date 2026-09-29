# Chassis Website

> The website of the Chassis Design System, and the home of `@chassis-ui/docs`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/chassis-ui/website/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/chassis-ui/website/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@chassis-ui/docs.svg)](https://www.npmjs.com/package/@chassis-ui/docs)

This repository builds [chassis-ui.com](https://chassis-ui.com): the home page, the blog,
the getting started guide and the examples. The documentation of each Chassis project
lives in that project's repository and is served under chassis-ui.com, for example
[chassis-ui.com/css/](https://chassis-ui.com/css/).

It also publishes [`@chassis-ui/docs`](packages/docs/README.md), the layouts, components
and styles that every Chassis documentation site is built with.

## Getting started

[CONTRIBUTING.md](CONTRIBUTING.md#setup) has the setup, the commands and the branch flow.

## Repository layout

```
packages/
  website/      The chassis-ui.com site (Astro)
    content/    Blog posts, the docs guide and callouts
    data/       The sidebar of the docs guide
    src/        Pages, components, layouts and styles of the site
  docs/         @chassis-ui/docs, published to npm
    src/        Its layouts, components, integration and SCSS
    starter/    A minimal site built from the packed package in CI
    test/       Its unit and component tests
examples/
  vanilla-html/ Chassis CSS and Icons in a plain HTML page, served at /examples/vanilla-html/
api/            The contact form endpoint, a Vercel function
build/          Build, validation and release scripts
vendor/assets/  The chassis-assets submodule: logo, favicons and fonts
ref/            Reference documents for maintainers
```

The build writes the site to `_site/`.

## Documentation

| Document                                           | Covers                                                        |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [CONTRIBUTING.md](CONTRIBUTING.md)                 | Setup, commands, branches, pull requests, releases            |
| [packages/docs/README.md](packages/docs/README.md) | How a site uses `@chassis-ui/docs`, and its versioning policy |
| [ref/DEVELOPMENT.md](ref/DEVELOPMENT.md)           | How the build works, the submodule, working across projects   |
| [ref/ARCHITECTURE.md](ref/ARCHITECTURE.md)         | How the Chassis repositories fit together                     |
| [ref/DEPLOYMENT.md](ref/DEPLOYMENT.md)             | Environments, deployments and the release flow                |
| [ref/VERCEL_CONFIG.md](ref/VERCEL_CONFIG.md)       | How chassis-ui.com routes to the other projects' sites        |
| [ref/ROADMAP.md](ref/ROADMAP.md)                   | Planned work on this repository                               |

## Chassis ecosystem

| Project                                                | What it is                                                         | Docs                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------ |
| **chassis-website**                                    | This repository: chassis-ui.com and `@chassis-ui/docs`             | [chassis-ui.com](https://chassis-ui.com)   |
| [chassis-tokens](https://github.com/chassis-ui/tokens) | Design tokens, published as `@chassis-ui/tokens`                   | [/tokens/](https://chassis-ui.com/tokens/) |
| [chassis-css](https://github.com/chassis-ui/css)       | The CSS framework, published as `@chassis-ui/css`                  | [/css/](https://chassis-ui.com/css/)       |
| [chassis-icons](https://github.com/chassis-ui/icons)   | The icon library, published as `@chassis-ui/icons`                 | [/icons/](https://chassis-ui.com/icons/)   |
| [chassis-assets](https://github.com/chassis-ui/assets) | Fonts, images and other assets for web and native apps. Not on npm | [/assets/](https://chassis-ui.com/assets/) |
| [chassis-figma](https://github.com/chassis-ui/figma)   | Documentation of the Figma libraries                               | [/figma/](https://chassis-ui.com/figma/)   |
| [chassis-react](https://github.com/chassis-ui/react)   | React components, published as `@chassis-ui/react`                 | Not yet routed on chassis-ui.com           |

## License

MIT. See [LICENSE](LICENSE).
