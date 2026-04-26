# @chassis-ui/docs

Shared Astro components and layouts for Chassis documentation sites.

## Overview

This package provides reusable Astro components, layouts, and utilities specifically designed for building documentation websites within the Chassis UI ecosystem. It includes common documentation patterns, styling helpers, and content processing utilities.

## Installation

```bash
npm install @chassis-ui/docs
```

or with pnpm:

```bash
pnpm add @chassis-ui/docs
```

## Peer Dependencies

This package requires the following peer dependencies:

- `@chassis-ui/css`: Chassis CSS framework
- `@chassis-ui/icons`: Chassis icon library
- `@chassis-ui/tokens`: Chassis design tokens
- `astro`: ^4.0.0 || ^5.0.0

## Usage

### Importing Components

```typescript
// Import layouts
import Layout from '@chassis-ui/docs/layouts/Layout.astro'
import DocsLayout from '@chassis-ui/docs/layouts/DocsLayout.astro'

// Import components
import CodeBlock from '@chassis-ui/docs/components/CodeBlock.astro'
import Callout from '@chassis-ui/docs/components/Callout.astro'

// Import utilities
import { generateTOC } from '@chassis-ui/docs'
import { processImage } from '@chassis-ui/docs'
```

### Available Exports

This package exports:

- **Layouts**: Pre-built Astro layouts for documentation pages
- **Components**: Reusable documentation components (code blocks, callouts, navigation, etc.)
- **Shortcodes**: MDX-compatible shortcode components
- **Libraries**: Utility functions for content processing, TOC generation, and more
- **Styles**: SCSS utilities and mixins
- **Scripts**: Client-side JavaScript utilities

### Directory Structure

```
src/
├── components/     # Astro components
│   └── shortcodes/ # MDX shortcode components
├── layouts/        # Page layouts
├── libs/           # Utility libraries
├── js/             # Client-side scripts
└── scss/           # Styling utilities
```

## Features

- **Content Processing**: Utilities for processing markdown and MDX content
- **Table of Contents**: Automatic TOC generation from headings
- **Image Optimization**: Helper functions for responsive images
- **Syntax Highlighting**: Code block components with syntax highlighting
- **Navigation**: Responsive documentation navigation components
- **Search Integration**: Ready-to-use search components
- **Accessibility**: WCAG-compliant components with proper ARIA attributes

## Development

This package is part of the Chassis UI monorepo. For development instructions, see the main repository documentation.

## License

MIT © [Chassis UI](https://github.com/chassis-ui)

## Contributing

Contributions are welcome! Please read the contributing guidelines in the main repository.

## Links

- [Documentation](https://chassis-ui.com/docs)
- [GitHub Repository](https://github.com/chassis-ui/website)
- [Issue Tracker](https://github.com/chassis-ui/website/issues)
- [Chassis UI Website](https://chassis-ui.com)
