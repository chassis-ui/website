# Contributing to Chassis Website

Thank you for your interest in contributing to the Chassis Website! This document provides guidelines and best practices for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Component Guidelines](#component-guidelines)
- [Style Guide](#style-guide)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## Getting Started

###Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Git with SSH access (for submodules)

### Installation

```bash
# Clone the repository with submodules
git clone --recursive https://github.com/chassis-ui/website.git
cd chassis-website

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Development Workflow

### Running the Development Server

```bash
# Start dev server at localhost:4321
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality Commands

```bash
# Run all linters
pnpm site:lint

# Format code
pnpm site:format

# Run ESLint
pnpm site:lint:eslint

# Run Stylelint
pnpm site:lint:stylelint

# Run Prettier
pnpm site:lint:prettier

# Validate HTML
pnpm site:lint:vnu
```

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
   const classes = [
     'base-class',
     'utility-class',
     condition && 'conditional-class',
     customClasses
   ].filter(Boolean).join(' ')
   ```
3. **Follow responsive patterns**: `class-name class-medium-value class-large-value`
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

- **Use Prettier** for code formatting (configured in project)
- **2 spaces** for indentation
- **Single quotes** for strings (Prettier enforced)
- **Semicolons**: Optional, follow project convention
- **Max line length**: 100 characters

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
import { generateTOC } from '@libs/toc'

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

## Pull Request Process

### Before Submitting

1. **Run all linters**: `pnpm site:lint`
2. **Format code**: `pnpm site:format`
3. **Test your changes**: Build and preview locally
4. **Update documentation**: If adding features or changing APIs
5. **Write tests**: If applicable

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. **One approval required** for merge
2. **All checks must pass**:
   - ESLint
   - Stylelint
   - Prettier
   - Build succeeds
3. **Changes requested** must be addressed
4. **Squash and merge** preferred for clean history

## Questions?

- **Documentation**: https://chassis-ui.com
- **Issues**: https://github.com/chassis-ui/website/issues
- **Discussions**: https://github.com/chassis-ui/website/discussions

Thank you for contributing to Chassis UI! 🎉
