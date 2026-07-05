# SCSS Architecture

This document describes the CSS/SCSS organization and architecture for the Chassis Website project.

## Overview

The project uses a layered SCSS architecture that combines:
1. **Chassis UI packages** - Core design system styles
2. **Custom website styles** - Site-specific customizations
3. **Component styles** - Inline component-specific styles when needed

## SCSS File Structure

```
packages/website/src/scss/
├── docs.scss          # Main stylesheet for documentation pages
└── home.scss          # Homepage-specific styles (currently minimal)

packages/docs/src/scss/
├── main.scss          # Main docs package stylesheet
├── _settings.scss     # SCSS variables and settings
├── _variables.scss    # CSS custom properties
├── _layout.scss       # Page layout styles
├── _navbar.scss       # Navigation bar styles
├── _sidebar.scss      # Sidebar navigation styles
├── _toc.scss          # Table of contents styles
├── _content.scss      # Content area styles
├── _code.scss         # Code block styles
├── _syntax.scss       # Syntax highlighting
├── _buttons.scss      # Button styles
├── _callouts.scss     # Callout/alert box styles
├── _colors.scss       # Color utilities
├── fonts.scss         # Font imports and definitions
└── ...                # Additional partial files
```

## Import Hierarchy

### docs.scss

This is the main stylesheet used across the site. It now uses Sass's `@use` module system (not `@import`). Actual order in `packages/website/src/scss/docs.scss`:

```scss
// 1. Chassis CSS framework (config, functions, maps, mixins)
@use "@chassis-ui/css/scss/config" as *;
@use "@chassis-ui/css/scss/functions" as *;
@use "@chassis-ui/css/scss/maps" as *;
@use "@chassis-ui/css/scss/mixins" as *;

// 2. Shared docs component styles
@use "@chassis-ui/docs/scss/main";

// 3. Site-specific customizations
:root {
  --feature-item-width: 560px;
  --gallery-image-height: 256px;
  // ... responsive overrides
}

.module-item > a { /*...*/ }
.feature-slider { /*...*/ }
```

`@chassis-ui/css/scss/config` forwards tokens, RFS, and defaults internally, so those no longer need separate `@use`/`@import` statements. `home.scss` follows the same pattern (`@use "docs" as *;` plus the config/mixins it needs directly).

### home.scss

Reserved for homepage-specific styles. Currently minimal as most homepage styles are in `docs.scss`.

**Note:** Consider moving homepage-specific styles from `docs.scss` to `home.scss` for better organization.

## How Styles are Imported

### In Layouts

Layouts import SCSS files which are then processed by Astro:

```astro
// packages/website/src/layouts/Layout.astro
import '../scss/docs.scss'
import '../scss/home.scss'
```

### In Pages

Pages use layouts which already include the necessary styles:

```astro
// packages/website/src/pages/index.astro
import BaseLayout from '@chassis-ui/docs/layouts/BaseLayout.astro'
// Styles are inherited from the layout
```

## CSS Custom Properties

The project uses CSS custom properties (CSS variables) extensively:

- **Token-generated variables**: `--cx-color-*`, `--cx-space-*`, `--cx-border-radius-*`, etc.
- **Component variables**: `--feature-item-width`, `--gallery-image-height`, etc.
- **Responsive overrides**: Defined within media query mixins

## Responsive Design

The project uses Chassis CSS mixins for responsive breakpoints:

```scss
@include media-breakpoint-up(medium) {
  // Styles for medium screens and up (≥768px)
}

@include media-breakpoint-down(medium) {
  // Styles for screens smaller than medium (<768px)
}
```

### Breakpoints

Default Chassis CSS breakpoints (from `@chassis-ui/tokens`, `grid.breakpoint.*`):
- `small`: 576px
- `medium`: 768px
- `large`: 1024px
- `xlarge`: 1280px
- `2xlarge`: 1536px

As of `@chassis-ui/css@0.2.0`, responsive utility classes use a `{breakpoint}:` **prefix** rather than a Bootstrap-style infix — e.g. `medium:p-large`, `large:d-flex`, `medium:col-6` (not `p-medium-large` / `col-medium-6`). See [CHASSIS_CSS.md](CHASSIS_CSS.md#-breakpoint-prefix-syntax-v020) for the full mapping.

## Utility-First Approach

The project primarily uses Chassis CSS utility classes:

```html
<div class="d-flex flex-column medium:flex-row gap-medium p-xlarge">
  <!-- Content -->
</div>
```

### Custom Classes

Custom classes are only used when utilities are insufficient:

- `.module-item` - Homepage module navigation items
- `.feature-slider` - Swiper carousel container
- `.home-section` - Homepage section wrapper
- `.section-content` - Section content container
- `.section-header` - Section header area
- `.section-features` - Feature cards container

## Best Practices

### Do:
- ✅ Use Chassis CSS utility classes whenever possible
- ✅ Import styles in layouts, not in individual components
- ✅ Use CSS custom properties for theme values
- ✅ Use responsive mixins for breakpoint-specific styles
- ✅ Keep custom classes semantic and BEM-style when needed

### Don't:
- ❌ Use inline styles unless absolutely necessary
- ❌ Duplicate utility class functionality with custom CSS
- ❌ Import the same SCSS file multiple times
- ❌ Use magic numbers - use tokens/variables instead
- ❌ Override Chassis CSS variables without good reason

## Component-Specific Styles

When a component needs unique styles that can't be achieved with utilities:

1. **Small styles**: Use inline `<style>` tag in the `.astro` component
2. **Shared styles**: Add to appropriate SCSS partial in `docs.scss`
3. **Large component library**: Consider creating a dedicated SCSS file

## Icons

Icon styles are separate:

```
packages/website/public/static/icons/
├── chassis-icons.css
├── chassis-icons.scss
└── chassis-icons.svg
```

Import in HTML:
```html
<link rel="stylesheet" href="/static/icons/chassis-icons.css">
```

## Future Improvements

Consider these architectural improvements:

1. **Separate homepage styles** - Move `.module-item`, `.feature-slider`, etc. from `docs.scss` to `home.scss`
2. **CSS Modules** - For component-scoped styles
3. **Style dictionary** - For automated token generation
4. **CSS-in-JS alternative** - If needed for dynamic theming
5. **Component library docs** - Storybook or similar for component styles

## Troubleshooting

### Styles not applying

1. Check import order in layout file
2. Verify SCSS compilation (check dev server logs)
3. Check CSS specificity conflicts
4. Ensure custom properties are defined in `:root`

### Build errors

1. Verify all `@import` paths are correct
2. Check for missing dependencies in `package.json`
3. Ensure Sass/SCSS is installed: `pnpm install sass`

### Responsive issues

1. Check breakpoint mixins are correct
2. Verify mobile-first approach (base → larger screens)
3. Test at actual device widths, not just browser resize

## Related Documentation

- [Chassis CSS Documentation](https://chassis-ui.com/css/docs/)
- [Chassis Tokens Documentation](https://chassis-ui.com/tokens/docs/)
- [Astro Styling Guide](https://docs.astro.build/en/guides/styling/)
- [CONTRIBUTING.md](../CONTRIBUTING.md) - CSS guidelines for contributors

---

**Last Updated**: July 2026  
**Maintainer**: Chassis UI Team
