# Chassis Website

> Official website and documentation for the Chassis design system

[![Deploy Status](https://github.com/chassis-ui/website/workflows/Deploy%20Website/badge.svg)](https://github.com/chassis-ui/website/actions)
[![Lighthouse CI](https://github.com/chassis-ui/website/workflows/Lighthouse%20CI/badge.svg)](https://github.com/chassis-ui/website/actions)

## Overview

Chassis Website is the official showcase for the Chassis Design System, featuring comprehensive documentation, interactive examples, and resources for building design systems with modern web technologies.

## Features

- 📚 **Comprehensive Documentation** - Complete design system guidelines and specifications
- 🎨 **Design Tokens** - Token-based design system with JavaScript and CSS output
- 🖼️ **Assets** - Icon library, images, and design resources
- 🎭 **CSS Framework** - Semantic HTML with customizable styling
- 🔧 **Implementation Guides** - Step-by-step integration tutorials
- 🚀 **Performance Optimized** - Built with Astro for lightning-fast static generation
- 📱 **Responsive Design** - Mobile-first approach across all pages

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
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

The project uses Git submodules for Chassis library dependencies:

```bash
# Sync all submodules to latest versions
pnpm sync:submodules

# Manual submodule operations
git submodule update --remote --merge
git submodule status
```

### Adding New Content

1. **Documentation Pages**: Add `.astro` files to `packages/website/src/pages/`
2. **Components**: Create reusable components in `packages/website/src/components/`
3. **Blog Posts**: Add markdown files to `packages/website/src/content/blog/`
4. **Styles**: Extend styles in `packages/website/src/styles/`
5. **Examples**: Add new integration examples in `examples/`

## Architecture

### Hybrid Monorepo Structure

This project uses a **hybrid approach**:

- **chassis-tokens**: Design tokens and theme definitions
- **chassis-css**: CSS framework and components
- **chassis-figma**: Figma design resources and documentation
- **chassis-assets**: Shared assets and resources

### Build System

The build system orchestrates:

1. **Submodule Synchronization**: Updates all dependencies
2. **Documentation Building**: Generates static site with Astro
3. **Example Building**: Builds all integration examples
4. **Asset Optimization**: Optimizes images, fonts, and other assets
5. **Validation**: Ensures build integrity

### Deployment

- **Platform**: Vercel
- **Repository**: `chassis-ui/website`
- **Production URL**: `chassis-ui.com`
- **Trigger**: Push to `main` branch
- **Build Command**: `pnpm build`
- **Output Directory**: `_site`
- **Performance**: Monitored with Lighthouse CI

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `pnpm build && pnpm validate`
5. Commit changes: `git commit -m "Add amazing feature"`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Guidelines

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation for any changes
- Ensure all builds pass before submitting PR
- Keep commits focused and descriptive

### Submodule Updates

When updating submodules:

1. Test changes thoroughly in isolation
2. Update submodule references in this repository
3. Verify all examples still work
4. Update documentation if APIs changed

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: [https://chassis-ui.com](https://chassis-ui.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/chassis-ui/website/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/chassis-ui/website/discussions)
- 📧 **Email**: [support@chassis-ui.com](mailto:support@chassis-ui.com)
