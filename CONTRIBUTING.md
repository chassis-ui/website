# Contributing to Chassis Website

This repository holds the chassis-ui.com website (`packages/website`) and the
`@chassis-ui/docs` package (`packages/docs`) that every Chassis documentation site is built
with. This guide takes you from a fresh clone to a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Setup](#setup)
- [Commands](#commands)
- [Branches and pull requests](#branches-and-pull-requests)
- [Tests](#tests)
- [Component Guidelines](#component-guidelines)
- [Style Guide](#style-guide)
- [Commit Conventions](#commit-conventions)
- [Releases](#releases)

## Code of Conduct

Everyone who takes part is expected to follow the [Code of Conduct](.github/CODE_OF_CONDUCT.md).
Report a security vulnerability privately, as [SECURITY.md](.github/SECURITY.md) describes, not
in an issue.

## Setup

You need:

- Node.js 24. The version is in `.nvmrc`, so `nvm use` or `fnm use` picks it. Node 22.12
  or later works too, see `engines` in `package.json`.
- pnpm, at the version that `packageManager` in `package.json` names. `corepack enable`
  sets it up. Do not use npm or Yarn.
- Git and [Git LFS](https://git-lfs.com). The images of the `vendor/assets` submodule are
  stored with LFS.

Then:

```bash
git clone --recursive https://github.com/chassis-ui/website.git chassis-website
cd chassis-website
pnpm install
pnpm vendor
pnpm dev
```

The site runs at `http://localhost:4321`.

`pnpm vendor` builds the docs assets of the `vendor/assets` submodule: logo, favicons and
fonts. The site cannot start without them. It builds the commit that this repository pins,
so run it again when that pin changes. If you cloned without `--recursive`, it checks the
submodule out first.

## Commands

Run them from the root of the repository.

| Command                | What it does                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`             | Starts the dev server at `http://localhost:4321`                                                             |
| `pnpm build`           | Builds the vendor assets, the examples and the site into `_site/`, then the search index. Vercel runs it too |
| `pnpm preview`         | Serves `_site/` after a build                                                                                |
| `pnpm lint`            | ESLint, Stylelint and Prettier on both packages, then the spell check. What the Lint job of CI runs          |
| `pnpm format`          | Formats both packages with Prettier                                                                          |
| `pnpm spellcheck`      | Checks the spelling of the Markdown and MDX files with cspell. Add new words to `.cspell.json`               |
| `pnpm test`            | Runs the unit and component tests once. `pnpm test:watch` runs them on every change                          |
| `pnpm test:fixtures`   | Builds the starter site from the packed package, in both layouts. See [Tests](#tests)                        |
| `pnpm check`           | `astro check` on both packages, then `pnpm audit`                                                            |
| `pnpm vendor`          | Builds the `vendor/assets` submodule at the pinned commit                                                    |
| `pnpm sync-submodules` | Moves the `vendor/assets` pin to the latest `app/docs` of chassis-assets, and builds it                      |
| `pnpm changeset`       | Describes a change to `@chassis-ui/docs` for its changelog. See [Releases](#releases)                        |

The scripts behind them are in `package.json`. `site:*` scripts act on `packages/website`,
`docs:*` scripts on `packages/docs`, for example `pnpm site:lint:eslint`. `pnpm site` builds
the site and validates its HTML, which the Build job of CI does too.

`pnpm install` also installs a pre-commit hook. It runs ESLint and Prettier on the staged
files of `packages/website` and `packages/docs`, fixes what they can, and stops the commit
when a problem is left. `git commit --no-verify` skips it.

`pnpm dev` does not touch the submodule. Moving the pin is a change of its own: run
`pnpm sync-submodules`, check the site, and commit `vendor/assets` in a commit that does
nothing else.

## Branches and pull requests

| Branch    | What it is                                                                                   |
| --------- | -------------------------------------------------------------------------------------------- |
| `develop` | The integration branch. Every change is merged here first, and CI runs on it                 |
| `staging` | Deploys `staging.chassis-ui.com`. It receives the commits of `develop` once CI has passed    |
| `main`    | Deploys `chassis-ui.com` and publishes `@chassis-ui/docs`. It receives the same commits next |

Open your pull request against `develop`:

1. Fork the repository and create a branch from `develop`.
2. Make your change. Run `pnpm lint`, `pnpm check` and `pnpm test`. Build with `pnpm build`
   and look at the result with `pnpm preview` when the change shows on the site.
3. If the change affects `@chassis-ui/docs`, add a changeset with `pnpm changeset`. See
   [Releases](#releases).
4. Open the pull request against `develop`. CI runs Lint, Type Check, Test, Build, the
   fixture sites and a dependency review on it.

A maintainer reviews the pull request and merges it into `develop`. From there the same
commit goes to `staging` and then to `main`. `staging` and `main` accept only commits that
passed Lint, Type Check, Test and Build. [ref/DEPLOYMENT.md](ref/DEPLOYMENT.md) describes
that part.

### Before you submit

- Update the documentation when you change a command, a config key or anything the
  package README describes.
- Add tests when you change the package.
- Describe how you tested the change in the pull request, with screenshots for visual
  changes.

## Tests

The tests of `@chassis-ui/docs` are in `packages/docs/test`. Component tests render in a
small site in `packages/docs/test/fixture`. The tests of the contact endpoint are next to it,
in `api/`.

`pnpm test:fixtures` packs `@chassis-ui/docs`, installs it into copies of the starter site
in `packages/docs/starter`, builds them and checks the output. It needs network access for
the install. A stand-in replaces the docs build of chassis-assets. Name a layout, `root` or
`packages`, to build only that one.

## Component Guidelines

### Astro Component Structure

All Astro components should follow this structure:

```astro
---
/**
 * Component Name
 *
 * Brief description of what the component does.
 *
 * @slot slotName - Description of the slot
 */

interface Props {
  /** Description of the prop */
  propName: string
  /** Optional prop with default */
  optionalProp?: boolean
}

const { propName, optionalProp = false } = Astro.props

// Component logic here
---

<div class="component-name">
  <!-- Component markup -->
</div>
```

### TypeScript Interface Requirements

1. **Always use `interface Props`** for component properties
2. **Add JSDoc comments** for the component and each prop
3. **Specify optional props** with `?` and provide defaults when destructuring
4. **Use TypeScript types** for complex props (arrays, objects, unions)

### Class Name Conventions

1. **Use utility-first approach** with Chassis CSS classes
2. **Build class arrays** for complex conditional classes:
   ```typescript
   const classes = ['base-class', 'utility-class', condition && 'conditional-class', customClasses]
     .filter(Boolean)
     .join(' ')
   ```
3. **Follow responsive patterns**: a breakpoint is a prefix, as in `py-3xl md:py-6xl`. See
   [ref/CHASSIS_CSS.md](ref/CHASSIS_CSS.md)
4. **Avoid inline styles** unless absolutely necessary

### Accessibility

1. **Use semantic HTML** (`<header>`, `<nav>`, `<main>`, `<article>`, etc.)
2. **Add ARIA attributes** where needed:
   - `aria-label` for contextual information
   - `aria-hidden="true"` for decorative icons
   - `role` attributes for custom widgets
3. **Provide alt text** for all images (descriptive, not generic)
4. **Ensure keyboard navigation** works for interactive elements
5. **Test with screen readers** when possible

### Slot Usage

1. **Check slot content** without rendering:
   ```typescript
   const hasContent = Astro.slots.has('default')
   ```
2. **Use named slots** for structured content
3. **Document all slots** in JSDoc comments

## Style Guide

### File Naming

- **Components**: PascalCase (`FeatureCard.astro`, `ModuleItem.astro`)
- **Layouts**: PascalCase (`BaseLayout.astro`, `DocsLayout.astro`)
- **Pages**: kebab-case or brackets for dynamic routes (`[...slug].astro`)
- **Utilities**: camelCase (`config.ts`, `helpers.ts`)
- **Styles**: kebab-case (`home.scss`, `docs.scss`)

### Code Formatting

Prettier formats the code and `pnpm lint` checks it. The settings are in
`.prettierrc.json`: two spaces, single quotes, no semicolons, lines up to 100 characters.
Stylelint checks the SCSS, with the settings in `stylelint.config.js`.

### Import Organization

Group imports in this order:

```typescript
// 1. Astro imports
import type { CollectionEntry } from 'astro:content'

// 2. External packages
import { gsap } from 'gsap'

// 3. Internal shared packages
import FeatureCard from '@chassis-ui/docs/components/FeatureCard.astro'

// 4. Local components
import Hero from '@components/homepage/HeroSection.astro'

// 5. Utilities
import { formatDate } from '@libs/blog'

// 6. Styles
import '@scss/home.scss'
```

### CSS/SCSS Guidelines

1. **Use Chassis CSS utilities** whenever possible
2. **Custom classes** only when utilities are insufficient
3. **Follow BEM naming** for custom classes: `.block__element--modifier`
4. **Mobile-first** responsive design
5. **Use CSS custom properties** for theming
6. **Organize by component** in SCSS files

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, whitespace)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(components): add FeatureCard horizontal layout option

Add horizontal prop to FeatureCard component to support
side-by-side icon and text layout for larger screens.

Closes #123
```

```
fix(homepage): correct GSAP animation exclusion

Remove #figma-section from GSAP exclusion selector to
ensure animations work correctly on that section.
```

## Releases

`@chassis-ui/docs` is released with [Changesets](https://changesets.dev). The website has no
version. Its changes go into the root `CHANGELOG.md`, by date.

### Describe a change

A change to `packages/docs` adds a changeset:

```bash
pnpm changeset
```

It asks for the bump and a summary, and writes a Markdown file to `.changeset/`. Commit it
with the change. Before 1.0, a breaking change is a `minor` bump, and its summary starts with
`**Breaking.**`. Everything else is a `patch`. The
[versioning policy](packages/docs/README.md#versioning) says what counts as breaking.

### Release a version

On `develop`:

```bash
pnpm changeset version
git add .
git commit -m "chore(release): @chassis-ui/docs <version>"
```

`changeset version` bumps `packages/docs/package.json`, writes the entry in
`packages/docs/CHANGELOG.md` and deletes the changesets. Then push the commit to `develop`,
`staging` and `main`, as for any change. The push to `main` runs
`.github/workflows/publish-packages.yml`. It publishes the version when npm does not have it
yet and every check of CI passed on the commit, then creates the GitHub release.

### Prereleases

```bash
pnpm changeset pre enter next   # versions become 0.6.0-next.0, 0.6.0-next.1, …
pnpm changeset version
# commit, push to develop, staging and main
pnpm changeset pre exit         # when the version is ready
pnpm changeset version          # 0.6.0
```

A prerelease is published under the dist-tag named by its version, `next` here, and its
GitHub release is marked as a prerelease. `latest` stays on the last stable version.

## Questions?

- **Documentation**: https://chassis-ui.com
- **Issues**: https://github.com/chassis-ui/website/issues
- **Questions and ideas**: https://github.com/chassis-ui/website/discussions

Thank you for contributing to Chassis UI! 🎉
