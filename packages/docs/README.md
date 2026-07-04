# @chassis-ui/docs

> Shared Astro layouts, components, and utilities for Chassis documentation sites.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![Version: 0.3.0](https://img.shields.io/badge/Version-0.3.0-blue.svg)](https://www.npmjs.com/package/@chassis-ui/docs) [![npm](https://img.shields.io/npm/v/@chassis-ui/docs.svg)](https://www.npmjs.com/package/@chassis-ui/docs)

## Overview

`@chassis-ui/docs` powers every documentation site in the Chassis ecosystem — the main `chassis-ui.com` website and the per-package docs for `chassis-css`, `chassis-tokens`, `chassis-icons`, `chassis-figma`, and `chassis-assets`. It ships pre-built layouts, navigation components, content-processing utilities, and SCSS helpers so each site stays consistent without duplicating code.

> [!NOTE] This package is developed inside the [`chassis-website`](https://github.com/chassis-ui/website) monorepo at `packages/docs/` and published to npm. Source, issues, and pull requests live in that repository.

## Installation

```sh
pnpm add @chassis-ui/docs
```

or:

```sh
npm install @chassis-ui/docs
```

### Peer Dependencies

```json
{
  "astro": "^5.0.0"
}
```

In practice, sites also install the rest of the Chassis stack — `@chassis-ui/css`, `@chassis-ui/tokens`, `@chassis-ui/icons` — to render the layouts and styles correctly.

## Usage

```astro
---
import BaseLayout from '@chassis-ui/docs/layouts/BaseLayout.astro'
import DocsLayout from '@chassis-ui/docs/layouts/DocsLayout.astro'
import SingleLayout from '@chassis-ui/docs/layouts/SingleLayout.astro'

import TableOfContents from '@chassis-ui/docs/components/TableOfContents.astro'
import ThemeToggler from '@chassis-ui/docs/components/ThemeToggler.astro'

import { generateTOC, processImage } from '@chassis-ui/docs'
---

<SingleLayout title="About" description="…">
  <slot />
</SingleLayout>
```

## Exports

| Subpath                         | Contents                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `@chassis-ui/docs`              | Library functions: `chassis`, `image`, `layout`, `rehype`, `toc`, `utils`                     |
| `@chassis-ui/docs/layouts/*`    | `BaseLayout`, `DocsLayout`, `RedirectLayout`, `SingleLayout`                                  |
| `@chassis-ui/docs/components/*` | `DocsSidebar`, `FeatureCard`, `NavLink`, `ResponsiveImage`, `TableOfContents`, `ThemeToggler` |
| `@chassis-ui/docs/shortcodes/*` | MDX shortcode components                                                                      |
| `@chassis-ui/docs/libs/*`       | Direct access to individual library modules                                                   |
| `@chassis-ui/docs/js/*`         | Client-side scripts                                                                           |
| `@chassis-ui/docs/scss/*`       | SCSS utilities and partials                                                                   |

### Source Layout

```
src/
├── components/      # Astro components (+ shortcodes/)
├── layouts/         # Page layouts (+ head/, header/, footer/)
├── libs/            # Utility libraries
├── js/              # Client-side scripts
└── scss/            # Styling utilities
```

## Chassis Ecosystem

This package is part of the Chassis Design System's multi-repository architecture:

| Project                                                  | Description                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| [chassis-website](https://github.com/chassis-ui/website) | **Main website and home of `@chassis-ui/docs` (this package)** |
| [chassis-css](https://github.com/chassis-ui/css)         | CSS framework and component library                            |
| [chassis-tokens](https://github.com/chassis-ui/tokens)   | Design token generation and management                         |
| [chassis-icons](https://github.com/chassis-ui/icons)     | Icon library and build toolkit                                 |
| [chassis-assets](https://github.com/chassis-ui/assets)   | Multi-platform asset management                                |
| [chassis-figma](https://github.com/chassis-ui/figma)     | Figma component documentation                                  |

All documentation sites in the ecosystem share this package for consistent layouts, components, and styling.

## Contributing

Issues and pull requests are welcome — please file them in [`chassis-ui/website`](https://github.com/chassis-ui/website). For larger changes, open an issue first so we can agree on the approach before you write the code.

## License

MIT © [Chassis UI](https://github.com/chassis-ui)

## Links

- [chassis-ui.com](https://chassis-ui.com)
- [npm package](https://www.npmjs.com/package/@chassis-ui/docs)
- [Source repository](https://github.com/chassis-ui/website/tree/main/packages/docs)
- [Issue tracker](https://github.com/chassis-ui/website/issues)
