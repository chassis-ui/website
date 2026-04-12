# Development Guide

This guide provides detailed information for developers working on the Chassis ecosystem.

## 🏗 Project Context

**chassis-website** is a pnpm monorepo that:
- Contains the main website (`packages/website`)
- Provides shared documentation infrastructure (`packages/docs`)
- Serves as the hub for the Chassis ecosystem

See [ARCHITECTURE.md](ARCHITECTURE.md) for the complete ecosystem structure.

## 📋 Prerequisites

### System Requirements

- **macOS, Linux, or Windows** with WSL2
- **Node.js** 18.0.0 or higher (recommend using nvm/fnm)
- **pnpm** 10.0.0 or higher
- **Git** with SSH keys for GitHub access (for submodules)

### Initial Setup

#### 1. Configure Git SSH Keys (for submodules)

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub account
cat ~/.ssh/id_ed25519.pub
# Copy and add to https://github.com/settings/keys
```

#### 2. Install pnpm

```bash
# Via npm
npm install -g pnpm

# Or via Homebrew (macOS)
brew install pnpm

# Verify installation
pnpm --version
```

#### 3. Clone Repository

```bash
# Clone with submodules
git clone --recursive https://github.com/chassis-ui/website.git chassis-website
cd chassis-website

# If you already cloned without --recursive
git submodule update --init --recursive
```

#### 4. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

## 🚀 Development Workflow

### Starting Development

```bash
# Start website development server (runs packages/website)
pnpm dev

# Or explicitly
pnpm astro:dev
```

This starts the Astro dev server at `http://localhost:4321` with hot module replacement.

### Building

```bash
# Build entire site
pnpm build

# Clean and rebuild
pnpm clean
pnpm build

# Preview production build
pnpm preview
```

### Validation & Linting

```bash
# Run all validators
pnpm validate

# Lint website code
pnpm site:lint              # Run all linters
pnpm site:lint:eslint       # ESLint only
pnpm site:lint:stylelint    # Stylelint only
pnpm site:lint:prettier     # Prettier only
pnpm site:lint:vnu          # HTML validation

# Format code
pnpm site:format

# Lint docs package
pnpm docs:lint
pnpm docs:lint:prettier
```

## 📦 Monorepo Structure

### Workspaces

The monorepo uses pnpm workspaces defined in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
```

### Package Overview

#### packages/docs (`@chassis-ui/docs`)

Shared documentation infrastructure used by all Chassis projects.

**Location:** `packages/docs/`  
**Purpose:** Reusable Astro components, layouts, and utilities  
**Published:** Yes, to npm registry  
**Version:** 0.1.7  

**Development:**
```bash
cd packages/docs

# Install dependencies
pnpm install

# No build step (TypeScript source imported directly)
```

**Exports:**
- Components: `@chassis-ui/docs/components/*`
- Layouts: `@chassis-ui/docs/layouts/*`
- Libs: `@chassis-ui/docs` (chassis, image, toc, utils)
- Styles: `@chassis-ui/docs/scss/*`

#### packages/website (Main Site)

The main chassis-ui.com website.

**Location:** `packages/website/`  
**Purpose:** Main website with documentation content  
**Published:** No (private)  
**Build output:** `../../_site/`  

**Development:**
```bash
cd packages/website

# Start dev server
pnpm dev

# Build
pnpm build
```

**Key files:**
- `astro.config.ts` - Astro configuration
- `config.yml` - Site configuration
- `src/pages/` - File-based routing
- `src/content/` - MDX/Markdown content
- `src/components/` - Site-specific components
- `src/plugins/` - Vite plugins (Algolia, StackBlitz)

## 🔧 Working on Website Content

### Adding New Pages

Pages use file-based routing in `packages/website/src/pages/`:

```astro
---
// packages/website/src/pages/getting-started.astro
import Layout from '@chassis-ui/docs/layouts/BaseLayout.astro'
---

<Layout title="Getting Started">
  <section class="container py-xlarge">
    <h1>Getting Started</h1>
    <p>Your content here...</p>
  </section>
</Layout>
```

### Adding Documentation Content

Content lives in `packages/website/content/`:

```markdown
---
title: Introduction
description: Getting started with Chassis
---

# Introduction

Your MDX content here...
```

### Adding Components

Site-specific components go in `packages/website/src/components/`:

```astro
---
// packages/website/src/components/Hero.astro
export interface Props {
  title: string
  subtitle?: string
}

const { title, subtitle } = Astro.props
---

<section class="hero">
  <h1>{title}</h1>
  {subtitle && <p>{subtitle}</p>}
</section>
```

## 🔧 Working on Shared Components

### Editing @chassis-ui/docs

When you need to modify shared documentation infrastructure:

**Location:** `packages/docs/src/`

```bash
cd packages/docs

# Make your changes in src/
# Components: src/components/
# Layouts: src/layouts/
# Libs: src/libs/
```

**Testing changes:**

Since packages/website depends on `workspace:*`, changes are automatically reflected:

```bash
# In root directory
pnpm dev

# Your changes in packages/docs are immediately available to packages/website
```

**Publishing updates:**

```bash
# 1. Bump version
cd packages/docs
# Update version in package.json

# 2. Commit and push
git add .
git commit -m "feat(docs): add new component"
git push

# 3. Other projects can update
# In chassis-css, chassis-tokens, etc.
pnpm add @chassis-ui/docs@latest
```

## 🎨 Working with Styles

### SCSS Structure

```
packages/website/src/scss/
├── _variables.scss       # Site-specific variables
├── _mixins.scss          # Custom mixins
└── main.scss             # Main stylesheet

packages/docs/src/scss/
├── _layout.scss          # Shared layout styles
└── _utilities.scss       # Shared utilities
```

### Using Chassis CSS

The website imports Chassis CSS from the separate project:

```json
// packages/website/package.json
{
  "dependencies": {
    "@chassis-ui/css": "github:chassis-ui/css#app/docs"
  }
}
```

## 🧩 Working with Submodules

Currently only `vendor/assets` is a submodule:

```bash
# Check submodule status
git submodule status

# Update submodule to latest
git submodule update --remote vendor/assets

# Commit submodule reference update  
git add vendor/assets
git commit -m "chore: update assets submodule"
```

## 🔄 Working with Other Chassis Projects

### Testing Local Changes Across Projects

To test changes in @chassis-ui/docs with another Chassis project:

```bash
# In chassis-website/packages/docs
pnpm link --global

# In chassis-css (or another project)
cd /path/to/chassis-css
pnpm link --global @chassis-ui/docs

# Now chassis-css uses your local @chassis-ui/docs

# To unlink
pnpm unlink --global @chassis-ui/docs
pnpm install --force
```

### Understanding Project Dependencies

Each Chassis project (`chassis-css`, `chassis-tokens`, etc.) depends on `@chassis-ui/docs`:

```json
// chassis-css/package.json
{
  "devDependencies": {
    "@chassis-ui/docs": "^0.1.3"
  }
}
```

Their documentation sites (`site/` folder) import shared components:

```typescript
// chassis-css/site/astro.config.ts
import { getSiteUrl } from '@chassis-ui/docs'
```

## 🛠 Build System

### Root Build Scripts

```bash
# Defined in root package.json
pnpm build              # Build complete site
pnpm clean              # Remove build artifacts
pnpm dev                # Start website dev server
pnpm preview            # Preview production build
pnpm validate           # Run validators
```

### Build Process

1. **Astro builds** `packages/website` to `_site/`
2. **Static files** are copied to appropriate locations
3. **Validation** runs (optional)

### Build Output

```
_site/                   # Production build output
├── index.html           # Homepage
├── static/              # Hashed CSS/JS/assets
│   ├── css/
│   ├── js/
│   ├── fonts/
│   └── images/
├── docs/                # Documentation pages
├── blog/                # Blog posts
└── collections/         # Collection schemas
```

## 🧪 Testing

### Manual Testing

```bash
# Development testing
pnpm dev
# Visit http://localhost:4321

# Production build testing
pnpm build
pnpm preview
# Visit http://localhost:4321
```

### Validation

```bash
# HTML validation (requires Java)
pnpm site:lint:vnu

# All validations
pnpm site:lint
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Change port
pnpm dev -- --port 3000
```

#### pnpm Install Fails

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules packages/*/node_modules
pnpm install
```

#### Submodule Authentication Errors

```bash
# Verify SSH connection
ssh -T git@github.com

# Convert HTTPS to SSH globally
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

#### Build Cache Issues

```bash
# Clean Astro cache
rm -rf packages/website/.astro

# Clean build output
pnpm clean

# Rebuild
pnpm install
pnpm build
```

#### TypeScript Errors

```bash
# Check TypeScript
cd packages/website
pnpm astro check

# Restart TS server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Debug Mode

```bash
# Enable Astro verbose logging
pnpm dev -- --verbose

# Check Astro version
pnpm list astro
```

## 📝 Git Workflow

### Branch Strategy

- **main** - Production-ready code
- **staging** - Staging environment (optional)
- **feature/** - Feature branches
- **fix/** - Bug fix branches

### Commit Convention

Use conventional commits:

```bash
# Features
git commit -m "feat: add new component page"
git commit -m "feat(docs): add table of contents"

# Fixes
git commit -m "fix: resolve mobile navigation issue"

# Documentation
git commit -m "docs: update development guide"

# Chores
git commit -m "chore: update dependencies"
git commit -m "chore: update submodules"

# Refactoring
git commit -m "refactor: reorganize component structure"
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test locally (`pnpm build && pnpm preview`)
4. Commit and push
5. Create PR on GitHub
6. Wait for CI checks
7. Request review
8. Merge after approval

## 🎯 IDE Setup

### VS Code (Recommended)

#### Required Extensions

- **Astro** (`astro-build.astro-vscode`)
- **Prettier** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)

#### Recommended Extensions

- **TypeScript** (`ms-vscode.vscode-typescript-next`)
- **SCSS IntelliSense** (`mrmlnc.vscode-scss`)
- **Path Intellisense** (`christian-kohler.path-intellisense`)

#### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "astro.typescript.allowArbitraryAttributes": true,
  "files.associations": {
    "*.astro": "astro"
  }
}
```

## 🔗 Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Ecosystem architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment process
- [VERCEL_CONFIG.md](VERCEL_CONFIG.md) - Vercel configuration details
- [CHASSIS_CSS.md](CHASSIS_CSS.md) - CSS framework migration guide

## 📚 External Resources

- [Astro Documentation](https://docs.astro.build/)
- [pnpm Documentation](https://pnpm.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [Chassis UI Website](https://chassis-ui.com)
