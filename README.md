# Chassis Documentation

> Enterprise-grade, multi-platform design system documentation and showcase website

[![Deploy Status](https://github.com/chassis-ui/docs/workflows/Deploy%20Documentation/badge.svg)](https://github.com/chassis-ui/docs/actions)
[![Lighthouse CI](https://github.com/chassis-ui/docs/workflows/Lighthouse%20CI/badge.svg)](https://github.com/chassis-ui/docs/actions)

## Overview

Chassis Documentation is the central hub for the Chassis Design System, providing comprehensive documentation, examples, and resources for teams building consistent, multi-platform experiences across web, iOS, and Android.

## Features

- 📚 **Comprehensive Documentation** - Complete design system guidelines and specifications
- 🎨 **Live Component Examples** - Interactive showcase of all Chassis components
- 🔧 **Implementation Guides** - Step-by-step integration tutorials for different platforms
- 🎯 **Multi-Platform Support** - Consistent documentation for web, iOS, and Android
- 🚀 **Performance Optimized** - Built with Astro for lightning-fast static generation
- 📱 **Responsive Design** - Perfect experience across all device sizes

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git with SSH access to GitHub (for submodules)

### Installation

1. **Clone the repository with submodules:**
   ```bash
   git clone --recursive https://github.com/chassis-ui/docs.git
   cd chassis-docs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4321`

### Build for Production

```bash
# Build everything (website + examples)
npm run build

# Build only website
npm run build:website

# Build only examples
npm run build:examples

# Preview production build
npm run preview
```

## Project Structure

```
chassis-docs/
├── apps/
│   └── website/           # Main Astro documentation site
│       ├── src/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── pages/
│       │   └── styles/
│       └── package.json
├── examples/
│   ├── react-app/         # React + Vite integration example
│   └── vanilla-html/      # Pure HTML/CSS integration example
├── vendor/                # Git submodules (auto-managed)
│   ├── assets/           # Chassis Assets
│   ├── css/              # Chassis CSS Framework
│   ├── figma/            # Figma Design Resources
│   └── tokens/           # Design Tokens
├── scripts/
│   ├── sync-all.js       # Submodule synchronization
│   └── deploy.js         # Deployment coordination
└── tools/
    └── build.js          # Build orchestration
```

## Development

### Working with Submodules

The project uses Git submodules to include other Chassis repositories:

```bash
# Sync all submodules to latest versions
npm run sync:all

# Manual submodule operations
git submodule update --remote --merge
git submodule status
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build everything for production |
| `npm run build:website` | Build only the documentation website |
| `npm run build:examples` | Build only the example projects |
| `npm run preview` | Preview production build locally |
| `npm run sync:all` | Update all submodules to latest versions |
| `npm run deploy` | Deploy to production (CI/CD) |
| `npm run clean` | Clean all build artifacts |
| `npm run validate` | Validate build output |

### Adding New Content

1. **Documentation Pages**: Add `.astro` files to `apps/website/src/pages/`
2. **Components**: Create reusable components in `apps/website/src/components/`
3. **Styles**: Extend styles in `apps/website/src/styles/`
4. **Examples**: Add new integration examples in `examples/`

## Architecture

### Multi-Repository Structure

Chassis Documentation coordinates multiple repositories:

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
- **Trigger**: Push to `main` branch
- **Process**: Automated via GitHub Actions
- **Performance**: Monitored with Lighthouse CI

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly: `npm run build && npm run validate`
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
rm -rf node_modules apps/website/node_modules examples/*/node_modules
npm install
```

**Permission errors with vendor directory:**
```bash
# Fix permissions
sudo chown -R $(whoami) vendor/
```

**Astro build errors:**
```bash
# Clear Astro cache
rm -rf apps/website/.astro apps/website/dist
npm run build:website
```

### Performance Issues

- Run `npm audit` to check for security vulnerabilities
- Use `npm run validate` to check build integrity
- Monitor bundle sizes in build output
- Test with Lighthouse CI for performance regressions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: [https://chassis.design](https://chassis.design)
- 🐛 **Issues**: [GitHub Issues](https://github.com/chassis-ui/docs/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/chassis-ui/docs/discussions)
- 📧 **Email**: [support@chassis.design](mailto:support@chassis.design)
# Force staging deployment
# docs
