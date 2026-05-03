# Chassis Website

> Official website and documentation hub for the Chassis Design System.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Deploy Status](https://github.com/chassis-ui/website/workflows/Publish%20Packages/badge.svg)](https://github.com/chassis-ui/website/actions)

## Overview

Chassis Website is the main hub for the Chassis Design System, featuring comprehensive documentation, interactive examples, and resources for building design systems with modern web technologies. It also contains the shared `@chassis-ui/docs` package used by all Chassis documentation sites.

## Features

- 📚 **Comprehensive Documentation** - Complete design system guidelines and specifications
- 🎨 **Design Tokens** - Token-based design system with JavaScript and CSS output
- 🖼️ **Assets** - Icon library, images, and design resources
- 🎭 **CSS Framework** - Semantic HTML with customizable styling
- 🔧 **Implementation Guides** - Step-by-step integration tutorials
- 🚀 **Performance Optimized** - Built with Astro for lightning-fast static generation
- 📱 **Responsive Design** - Mobile-first approach across all pages

## Quick Start

> [!WARNING]
> This project uses `pnpm` for package management. Install it globally with `npm install -g pnpm` before running the commands below.

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 10.0.0 or higher
- Git with SSH access to GitHub (for submodules)

### Installation

1. **Clone the repository with submodules:**
   ```bash
   git clone --recursive https://github.com/chassis-ui/website.git
   cd chassis-website
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4321`

### Build for Production

```bash
# Build the website
pnpm build

# Preview production build
pnpm preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server at localhost:4321 |
| `pnpm build` | Build the production site |
| `pnpm preview` | Preview the production build locally |
| `pnpm astro:check` | Run Astro diagnostics |
| `pnpm format` | Format code with Prettier |
| `pnpm lint` | Lint code with ESLint and Stylelint |
| `pnpm validate` | Run all validation checks |

## Project Structure

This repository is a **pnpm workspace monorepo**:

```
chassis-website/
├── packages/
│   ├── website/          # Main Astro website
│   │   ├── src/
│   │   │   ├── components/   # Astro components
│   │   │   ├── content/      # Content collections (blog, docs)
│   │   │   ├── layouts/      # Page layouts
│   │   │   ├── libs/         # Utilities and helpers
│   │   │   ├── pages/        # Route pages
│   │   │   ├── plugins/      # Vite plugins
│   │   │   └── styles/       # Global styles
│   │   ├── public/           # Static assets
│   │   ├── static/           # Additional static files
│   │   └── astro.config.ts   # Astro configuration
│   │
│   └── docs/             # Shared documentation utilities
│       └── src/          # TypeScript utilities for docs
│
├── examples/             # Example implementations
│   ├── react-app/       # React + Vite + Chassis
│   └── vanilla-html/    # Vanilla HTML + Chassis
│
├── vendor/              # Git submodules for Chassis libraries
│   └── assets/          # Chassis Assets (icons, images)
│
├── build/               # Build and deployment scripts
├── ref/                 # Architecture documentation
└── _site/               # Build output (generated)
```

### Key Directories

- **`packages/website/`** - The main Astro application
- **`packages/docs/`** - Shared documentation components and utilities
- **`examples/`** - Working examples showcasing Chassis integration
- **`vendor/`** - Git submodules containing Chassis libraries
- **`build/`** - Build scripts and CI/CD tools
- **`ref/`** - Architecture and development reference documentation

## Development

### Working with Submodules

The project uses Git submodules for Chassis Assets dependency:

```bash
# Sync all submodules to latest versions
pnpm sync-submodules
```

### Adding New Content

1. **Documentation Pages**: Add `.astro` files to `packages/website/src/pages/`
2. **Components**: Create reusable components in `packages/website/src/components/`
3. **Blog Posts**: Add markdown files to `packages/website/src/content/blog/`
4. **Styles**: Extend styles in `packages/website/src/styles/`
5. **Examples**: Add new integration examples in `examples/`

## Chassis Ecosystem

This project is part of the Chassis Design System's multi-repository architecture:

| Project | Description |
|---------|-------------|
| **chassis-website** | **Main website and home of `@chassis-ui/docs` (this repository)** |
| [chassis-css](https://github.com/chassis-ui/css) | CSS framework and component library |
| [chassis-tokens](https://github.com/chassis-ui/tokens) | Design token generation and management |
| [chassis-icons](https://github.com/chassis-ui/icons) | Icon library and build toolkit |
| [chassis-assets](https://github.com/chassis-ui/assets) | Multi-platform asset management |
| [chassis-figma](https://github.com/chassis-ui/figma) | Figma component documentation |

This monorepo publishes [`@chassis-ui/docs`](https://www.npmjs.com/package/@chassis-ui/docs) to npm. All sibling repositories install it as a dependency to share layouts, components, and styling across their documentation sites.

### Deployment

- **Platform**: Vercel
- **Repository**: `chassis-ui/website`
- **Production URL**: `chassis-ui.com`
- **Trigger**: Push to `main` branch
- **Build Command**: `pnpm site:build`
- **Output Directory**: `_site`
- **Performance**: Monitored with Lighthouse CI

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test the build: `pnpm build && pnpm validate`
5. Commit your changes: `git commit -m "feat: add my feature"`
6. Push to the branch: `git push origin feature/my-feature`
7. Open a Pull Request

## Troubleshooting

### Common Issues

**Submodule sync fails:**
```bash
# Reset submodules completely
git submodule deinit --all -f
rm -rf vendor/
git submodule init
git submodule update --recursive
```

**Build fails with missing dependencies:**
```bash
# Clean install
rm -rf node_modules packages/website/node_modules packages/docs/node_modules
pnpm install
```

**Permission errors with vendor directory:**
```bash
# Fix permissions
sudo chown -R $(whoami) vendor/
```

**Astro build errors:**
```bash
# Clear Astro cache
rm -rf packages/website/.astro _site/
pnpm build
```

### Performance Issues

- Run `pnpm audit` to check for security vulnerabilities
- Use `pnpm validate` to check build integrity
- Monitor bundle sizes in build output
- Test with Lighthouse CI for performance regressions

## License

MIT License — see [LICENSE](LICENSE) file for details.
