# Bootstrap to Chassis CSS Migration Guide for LLMs

> **Document Purpose:** This is an LLM instruction guide for converting Bootstrap CSS to Chassis CSS.  
> **Last Updated:** 2026-10-07 for the grid, verified against the compiled `dist/css/chassis.css` of `@chassis-ui/css@0.7.0`. The rest was verified on 2026-09-29 against `dist/css/chassis.css` and `dist/js/chassis.js` of `@chassis-ui/css@0.5.2` (class names, breakpoint prefixes and widths, size names, data attributes) — check `package.json` for the exact current version; the prefix syntax dates from `v0.2.0`, the short size and breakpoint names (`sm`, `md`, `lg`, …) from `v0.5.0`, the CSS grid from `v0.6.0`, and as the only grid from `v0.7.0`  
> **Status:** Living document - Chassis CSS is under active development

**Target Audience**: LLMs, AI assistants, and automated code conversion tools

**Framework Context**: Chassis CSS is a modern CSS framework that uses a sophisticated design token system with semantic naming conventions that differ significantly from Bootstrap's BEM-like approach. It synchronizes with Figma components via design tokens from the `@chassis-ui/tokens` package.

## Overview

Chassis CSS is part of the Chassis UI ecosystem:

- **Repository:** https://github.com/chassis-ui/css
- **Package:** `@chassis-ui/css`
- **Documentation:** https://chassis-ui.com/css/
- **Dependencies:** Built on tokens from `@chassis-ui/tokens`

## Quick Reference for LLMs

When processing Bootstrap code, apply these transformations:

1. **Components**: `btn` → `button` (see the Component Classes table below — most card/card-body classes are unchanged)
2. **Colors**: `text-{color}` → `fg-{color}`, `text-muted` → `fg-subtle`
3. **Typography**: `display-{n}` → `font-display font-{size}` (`display-1` → `font-display font-5xl`)
4. **Spacing**: Numeric (`p-1`, `m-3`) → size names (`p-2xs`, `m-md`)
5. **Breakpoints**: Same abbreviations (`sm`, `md`, `lg`, `xl`) except `xxl` → `2xl`; the widths from `lg` up differ (see [Responsive Breakpoints](#responsive-breakpoints))
6. **Responsive utilities**: Bootstrap infix (`d-md-flex`, `p-md-3`) → Chassis CSS **prefix** (`md:d-flex`, `md:p-md`) — see [Breakpoint Prefix Syntax](#-breakpoint-prefix-syntax-v020) below
7. **Grid**: Bootstrap's flexbox grid → the CSS grid: `row` → `grid`, `col-6` → `col-span-6`, `col-md-6` → `md:col-span-6`, `g-3` → `gap-md` — see [Grid System](#grid-system) below
8. **Data attributes**: `data-bs-*` → `data-cx-*`

## ⚠️ Breakpoint Prefix Syntax (v0.2.0+)

As of `@chassis-ui/css@0.2.0`, every responsive utility class uses a Tailwind-style **prefix** (`{breakpoint}:{utility}`), not Bootstrap's **infix** (`{utility}-{breakpoint}`). This applies uniformly to spacing, display, flex, grid placement, and all other responsive utilities:

Most utilities use an **up** (min-width) prefix — active _at and above_ the named breakpoint — e.g. `lg:p-xl`, `md:d-flex`, `md:col-span-6`, `md:col-start-3`. Never emit a hyphenated infix like `p-medium-lg` or `d-medium-flex` — that was Chassis's own pre-0.2.0 syntax and is invalid today. Never emit the long breakpoint names either (`medium:d-flex`, `large:p-xlarge`): `@chassis-ui/css@0.5.0` renamed every breakpoint and size to its short form.

A few components instead use a **down** (max-width) variant — active _below_ the named breakpoint — which gets its own `max-` prefix (`max-{breakpoint}:{utility}`), confirmed against the compiled `dist/css/chassis.css`:

| Bootstrap                  | Chassis CSS               |
| -------------------------- | ------------------------- |
| `offcanvas-lg`             | `max-lg:drawer`           |
| `table-responsive-lg`      | `max-lg:table-responsive` |
| `modal-fullscreen-lg-down` | `max-lg:fullscreen`       |

Note that Bootstrap's **Offcanvas** component was renamed to **Drawer** in Chassis CSS — the class isn't just re-prefixed, the component itself is `.drawer` (see `_drawer.scss`), so a breakpoint-scoped offcanvas becomes `max-lg:drawer`, not `lg:offcanvas`.

A handful of components use a **compound class** where Bootstrap uses a hyphenated modifier:

| Bootstrap                                    | Chassis CSS                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `.container-lg` / `.container-fluid`         | `.container.lg` / `.container.fluid`                                           |
| `.img-fluid` / `.img-thumbnail`              | `.image.fluid` / `.image.thumbnail`                                            |
| `.list-group-numbered` / `.list-group-flush` | `.list.numbered` / `.list.flush`                                               |
| `.list-group-horizontal-lg`                  | `.list.lg:horizontal` (a container query: wrap the list in `.contains-inline`) |

**When converting Bootstrap responsive classes, always emit the new prefix form** (e.g. `d-md-flex` → `md:d-flex`, never `d-medium-flex` or `medium:d-flex`). All examples below already use the current prefix syntax.

This comprehensive guide provides mappings from Bootstrap classes to their Chassis CSS equivalents.

## LLM Processing Instructions

When encountering Bootstrap code in user requests:

1. **Identify Bootstrap classes** using patterns like `btn-*`, `text-*`, `bg-*`, `display-*`, numeric spacing
2. **Apply systematic replacements** using the mappings below
3. **Convert the grid** (Bootstrap's `row` and `col-*` become the CSS grid, see [Grid System](#grid-system); the HTML structure stays)
4. **Update semantic meaning** (use Chassis CSS's more descriptive approach)
5. **Consider context** (Chassis CSS offers more granular color and spacing options)

## Core Philosophy Differences

- **Bootstrap**: BEM-like modifier approach (`btn-primary`, `text-muted`)
- **Chassis CSS**: Utility-first with semantic color system (`button primary`, `fg-subtle`)
- **Chassis CSS**: Design token-driven with consistent size scales and context-aware colors
- **Chassis CSS**: More granular opacity and contextual color variants

## LLM Class Mapping Tables

### Typography Classes

| Bootstrap        | Chassis CSS                                | Context            |
| ---------------- | ------------------------------------------ | ------------------ |
| `display-1`      | `font-display font-5xl`                    | Largest display    |
| `display-2`      | `font-display font-4xl`                    | Large display      |
| `display-3`      | `font-display font-3xl`                    | Medium display     |
| `display-4`      | `font-display font-2xl`                    | Small display      |
| `display-5`      | `font-display font-xl`                     | XS display         |
| `display-6`      | `font-display font-lg`                     | Smallest display   |
| `h1`, `.h1`      | `.h1` (unchanged) or `font-4xl`            | Primary heading    |
| `h2`, `.h2`      | `.h2` (unchanged) or `font-3xl`            | Secondary heading  |
| `h3`, `.h3`      | `.h3` (unchanged) or `font-2xl`            | Tertiary heading   |
| `h4`, `.h4`      | `.h4` (unchanged) or `font-xl`             | Quaternary heading |
| `h5`, `.h5`      | `.h5` (unchanged) or `font-lg`             | Quinary heading    |
| `h6`, `.h6`      | `.h6` (unchanged) or `font-md`             | Senary heading     |
| `lead`           | `font-lead`                                | Lead paragraph     |
| `small`          | `text-sm`                                  | Small text         |
| `font-monospace` | `font-code` (`font-monospace` also exists) | Monospace/code     |

### Color Classes

| Bootstrap        | Chassis CSS    | Usage                |
| ---------------- | -------------- | -------------------- |
| `text-primary`   | `fg-primary`   | Primary text color   |
| `text-secondary` | `fg-secondary` | Secondary text color |
| `text-success`   | `fg-success`   | Success text color   |
| `text-danger`    | `fg-danger`    | Danger text color    |
| `text-warning`   | `fg-warning`   | Warning text color   |
| `text-info`      | `fg-info`      | Info text color      |
| `text-muted`     | `fg-subtle`    | Muted/subtle text    |
| `text-light`     | `fg-slight`    | Light text           |
| `text-dark`      | `fg-main`      | Dark/main text       |
| `bg-primary`     | `bg-primary`   | Primary background   |
| `bg-light`       | `bg-main`      | Light background     |
| `bg-dark`        | `bg-inverse`   | Dark background      |

### Spacing Classes

| Bootstrap | Chassis CSS       | Size    |
| --------- | ----------------- | ------- |
| `*-0`     | `*-0` or `*-zero` | 0       |
| `*-1`     | `*-2xs`           | 0.25rem |
| `*-2`     | `*-xs`            | 0.5rem  |
| `*-3`     | `*-md`            | 1rem    |
| `*-4`     | `*-xl`            | 1.5rem  |
| `*-5`     | `*-6xl`           | 3rem    |

### Component Classes

| Bootstrap       | Chassis CSS              | Component                                                                            |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `btn`           | `button`                 | Base button                                                                          |
| `btn-primary`   | `button primary`         | Primary button                                                                       |
| `btn-outline-*` | `button * outline`       | Outline button                                                                       |
| `btn-sm`        | `button sm`              | Small button                                                                         |
| `btn-lg`        | `button lg`              | Large button                                                                         |
| `card-body`     | `card-body`              | Unchanged — Chassis kept Bootstrap's name for this element                           |
| `card-text`     | _(none — plain element)_ | No dedicated class; use a plain element inside `.card-body`                          |
| `badge bg-*`    | `badge *`                | Badge with color                                                                     |
| `alert alert-*` | `notification *`         | Status message with type (Chassis `.alert` is a blocking alert dialog, not a banner) |

### Font Weight Classes

| Bootstrap   | Chassis CSS    | Weight          |
| ----------- | -------------- | --------------- |
| `fw-light`  | `font-elegant` | Light weight    |
| `fw-normal` | `font-normal`  | Normal weight   |
| `fw-bold`   | `font-strong`  | Bold weight     |
| `fw-bolder` | `font-mass`    | Heaviest weight |

### Responsive Breakpoints

| Bootstrap | Chassis CSS | Screen Width    | Notes                                                           |
| --------- | ----------- | --------------- | --------------------------------------------------------------- |
| `sm`      | `sm`        | ≥576px (36rem)  | Bootstrap infix (`d-sm-flex`) → Chassis prefix (`sm:d-flex`)    |
| `md`      | `md`        | ≥768px (48rem)  | `d-md-flex` → `md:d-flex`                                       |
| `lg`      | `lg`        | ≥1024px (64rem) | `p-lg-4` → `lg:p-xl`; Bootstrap's `lg` starts at 992px          |
| `xl`      | `xl`        | ≥1280px (80rem) | `mt-xl-3` → `xl:mt-md`; Bootstrap's `xl` starts at 1200px       |
| `xxl`     | `2xl`       | ≥1536px (96rem) | `d-xxl-none` → `2xl:d-none`; Bootstrap's `xxl` starts at 1400px |

## Font Sizes & Typography

### Bootstrap → Chassis CSS

```html
<!-- Bootstrap -->
<div class="display-1">Display 1</div>
<div class="display-6">Display 6</div>
<h1 class="h1">Heading 1</h1>
<p class="lead">Lead text</p>
<small class="text-muted">Small muted text</small>

<!-- Chassis CSS -->
<div class="font-display font-5xl">Display 1</div>
<div class="font-display font-lg">Display 6</div>
<h1 class="h1">Heading 1</h1>
<p class="font-lead">Lead text</p>
<small class="fg-subtle">Small muted text</small>
```

### Font Size Scale Mapping

| Bootstrap        | Chassis CSS             | Notes                                                           |
| ---------------- | ----------------------- | --------------------------------------------------------------- |
| `display-1`      | `font-display font-5xl` | Largest display size                                            |
| `display-2`      | `font-display font-4xl` |                                                                 |
| `display-3`      | `font-display font-3xl` |                                                                 |
| `display-4`      | `font-display font-2xl` |                                                                 |
| `display-5`      | `font-display font-xl`  |                                                                 |
| `display-6`      | `font-display font-lg`  |                                                                 |
| `h1`             | `.h1` or `font-4xl`     | Heading class vs size-only utility                              |
| `h2`             | `.h2` or `font-3xl`     |                                                                 |
| `h3`             | `.h3` or `font-2xl`     |                                                                 |
| `h4`             | `.h4` or `font-xl`      |                                                                 |
| `h5`             | `.h5` or `font-lg`      |                                                                 |
| `h6`             | `.h6` or `font-md`      |                                                                 |
| `lead`           | `font-lead`             | Semantic class available                                        |
| `fs-1` to `fs-6` | `font-4xl` to `font-md` | Direct size utilities (the scale runs `font-2xs` to `font-5xl`) |

### Font Families

```html
<!-- Bootstrap -->
<code class="font-monospace">Code text</code>

<!-- Chassis CSS -->
<code class="font-code">Code text</code>
<div class="font-text">Body text family</div>
<div class="font-display">Display font family</div>
<div class="font-html">HTML semantic font</div>
```

### Font Weights

```html
<!-- Bootstrap -->
<div class="fw-light">Light</div>
<div class="fw-normal">Normal</div>
<div class="fw-bold">Bold</div>
<div class="fw-bolder">Bolder</div>

<!-- Chassis CSS -->
<div class="font-elegant">Elegant (light)</div>
<div class="font-normal">Normal</div>
<div class="font-strong">Strong (bold)</div>
<div class="font-mass">Mass (heaviest)</div>
```

## Colors & Text Utilities

### Text Colors

```html
<!-- Bootstrap -->
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-success">Success text</p>
<p class="text-danger">Danger text</p>
<p class="text-warning">Warning text</p>
<p class="text-info">Info text</p>
<p class="text-muted">Muted text</p>
<p class="text-light">Light text</p>
<p class="text-dark">Dark text</p>

<!-- Chassis CSS -->
<p class="fg-primary">Primary text</p>
<p class="fg-secondary">Secondary text</p>
<p class="fg-success">Success text</p>
<p class="fg-danger">Danger text</p>
<p class="fg-warning">Warning text</p>
<p class="fg-info">Info text</p>
<p class="fg-subtle">Subtle text</p>
<p class="fg-slight">Slight text</p>
<p class="fg-main">Main text</p>
```

### Context-Specific Colors

Chassis CSS provides more granular color control with context-specific variants:

```html
<!-- Bootstrap approach -->
<div class="text-primary-emphasis">Emphasized primary</div>

<!-- Chassis CSS approach -->
<div class="primary-fg-main">Primary main color</div>
<div class="primary-fg-subtle">Primary subtle variant</div>
<div class="primary-fg-slight">Primary slight variant</div>
<div class="primary-fg-highlight">Primary highlight</div>
<div class="primary-fg-inverse">Primary inverse</div>
```

### Background Colors

```html
<!-- Bootstrap -->
<div class="bg-primary">Primary background</div>
<div class="bg-light">Light background</div>
<div class="bg-dark">Dark background</div>

<!-- Chassis CSS -->
<div class="bg-primary">Primary background</div>
<div class="bg-main">Main background</div>
<div class="bg-even">Even background</div>
<div class="bg-evident">Evident background</div>
<div class="primary-bg-even">Primary even background</div>
```

## Spacing & Sizing

### Spacing Scale

Chassis CSS uses size names instead of numeric scales. The full spacing scale is `zero`, `4xs`, `3xs`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl` and `2xl` to `6xl`:

```html
<!-- Bootstrap -->
<div class="p-0">No padding</div>
<div class="p-1">Small padding</div>
<div class="p-2">Medium padding</div>
<div class="p-3">Large padding</div>
<div class="p-4">XL padding</div>
<div class="p-5">XXL padding</div>

<!-- Chassis CSS -->
<div class="p-zero">No padding</div>
<div class="p-2xs">Tiny padding</div>
<div class="p-xs">Extra small padding</div>
<div class="p-sm">Small padding</div>
<div class="p-md">Medium padding</div>
<div class="p-lg">Large padding</div>
<div class="p-xl">Extra large padding</div>
<div class="p-2xl">2X large padding</div>
<div class="p-6xl">6X large padding</div>
```

### Spacing Mapping Table

| Bootstrap | Chassis CSS       | Description                |
| --------- | ----------------- | -------------------------- |
| `*-0`     | `*-0` or `*-zero` | No spacing                 |
| `*-1`     | `*-2xs`           | Tiny spacing (0.25rem)     |
| `*-2`     | `*-xs`            | Small spacing (0.5rem)     |
| `*-3`     | `*-md`            | Medium spacing (1rem)      |
| `*-4`     | `*-xl`            | Large spacing (1.5rem)     |
| `*-5`     | `*-6xl`           | Extra large spacing (3rem) |

### Sizing Utilities

```html
<!-- Bootstrap -->
<div class="w-25">25% width</div>
<div class="w-50">50% width</div>
<div class="w-75">75% width</div>
<div class="w-100">100% width</div>
<div class="w-auto">Auto width</div>

<!-- Chassis CSS -->
<div class="w-25">25% width</div>
<div class="w-50">50% width</div>
<div class="w-75">75% width</div>
<div class="w-100">100% width</div>
<div class="w-auto">Auto width</div>
```

_Note: Sizing utilities remain largely the same_

## Components

### Buttons

```html
<!-- Bootstrap -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline-primary">Outline Primary</button>
<button class="btn btn-sm">Small Button</button>
<button class="btn btn-lg">Large Button</button>

<!-- Chassis CSS -->
<button class="button primary">Primary</button>
<button class="button secondary">Secondary</button>
<button class="button primary outline">Outline Primary</button>
<button class="button sm">Small Button</button>
<button class="button lg">Large Button</button>
```

### Badges

```html
<!-- Bootstrap -->
<span class="badge bg-primary">Primary</span>
<span class="badge bg-secondary">Secondary</span>
<span class="badge text-bg-success">Success</span>

<!-- Chassis CSS -->
<span class="badge primary">Primary</span>
<span class="badge secondary">Secondary</span>
<span class="badge success">Success</span>
```

### Cards

```html
<!-- Bootstrap -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Card content</p>
  </div>
</div>

<!-- Chassis CSS -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p>Card content</p>
  </div>
</div>
```

### Alerts

```html
<!-- Bootstrap -->
<div class="alert alert-primary">Primary alert</div>
<div class="alert alert-danger">Danger alert</div>

<!-- Chassis CSS -->
<div class="notification primary">Primary alert</div>
<div class="notification danger">Danger alert</div>
```

## Layout & Grid

### Grid System

Chassis CSS has one grid, a CSS grid: `.grid` is a container of 12 columns, and its items span and start on those columns. Bootstrap's flexbox grid (`row`, `col-*`, `offset-*`, `row-cols-*`, `g-*`) was removed in `@chassis-ui/css@0.7.0`. **Never emit those classes.** They no longer exist, except `col-auto`, which is now a class of the CSS grid with another meaning (`grid-column: auto`, an item of one column). The container classes stay.

| Bootstrap                                               | Chassis CSS                                                |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| `row`                                                   | `grid`                                                     |
| `col-6`                                                 | `col-span-6`                                               |
| `col-12`                                                | `col-span-full`                                            |
| `col-md-6`                                              | `col-span-full md:col-span-6`                              |
| `row row-cols-3` with `col` children                    | `grid grid-cols-3`, no class on the children               |
| `row row-cols-1 row-cols-md-3`                          | `grid grid-cols-1 md:grid-cols-3`                          |
| `row` with equal `col` children                         | `grid grid-cols-{n}`, `n` being the number of children     |
| `offset-2`                                              | `col-start-3`: the start line is the offset plus one       |
| `offset-md-0`                                           | `md:col-start-auto`                                        |
| `col-md-8 mx-auto`, `justify-content-center` on the row | `md:col-span-8 md:col-start-3`, without `mx-auto`          |
| `g-3`, `g-4`                                            | `gap-md`, `gap-xl`                                         |
| `gx-3`, `gy-3`                                          | `column-gap-md`, `row-gap-md`                              |
| `g-0`                                                   | `gap-0`                                                    |
| `col-auto`                                              | not a grid: `d-flex` with `gap-*` on the parent            |
| `row` with `col` children of any number                 | `grid-fill` on the parent, no class on the children        |
| `col-6` outside a `row`, used as a width                | `w-6/12` (`w-1/12` to `w-11/12`, with breakpoint prefixes) |

What differs from Bootstrap's grid:

- **An item without a span is one column wide**, not full width. A Bootstrap column that is full width below its breakpoint (`col-md-6`) needs `col-span-full` as well.
- **A start line is absolute.** `offset-2` moves a column two columns from the previous one, `col-start-3` puts the item on the third line. They agree for the first item of a row only.
- **The default gap is the gutter token of the breakpoint**, 1rem below `md` and 1.5rem from `md`, where Bootstrap has 1.5rem everywhere. It applies between rows too. A `gap-*` class sets another one, and `row-gap-0` removes it between rows.
- **A grid in a narrow place follows the viewport, not its own width.** Its gutter and the breakpoint classes of its items (`md:col-span-6`) read the width of the page. Give a grid in a sidebar, a card or another grid item `grid-cols-{n}` in place of twelve columns. To make it follow the place it is in, put `contains-inline` on an element around it, `contained` on the grid (`grid contained`) and use the container variants on its items: `@md:col-span-6` applies when that element is at least `md` wide.
- **`grid-fill` is a grid without a column count.** It puts as many equal columns in a row as fit, each at least 12rem wide (`--cx-grid-min` sets another minimum), and its children need no class.
- **An auto margin shrinks a grid item to its content.** Center an item with `col-start-*`, not with `mx-auto`.
- **Content does not widen a column.** Something wider than its item, such as a fixed-width image, overflows it.
- A nested `row` in a column becomes a nested `grid` in the item.

```html
<!-- Bootstrap -->
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">Content</div>
  </div>
</div>

<!-- Chassis CSS -->
<div class="container">
  <div class="grid">
    <div class="col-span-full md:col-span-6 lg:col-span-4">Content</div>
  </div>
</div>
```

The [grid documentation](https://chassis-ui.com/css/docs/layout/grid/) has the full migration table.

### Responsive Breakpoints

```html
<!-- Bootstrap -->
<div class="d-none d-sm-block d-md-flex">
<div class="col-12 col-md-6 col-lg-4 col-xl-3">

<!-- Chassis CSS -->
<div class="d-none sm:d-block md:d-flex">
<div class="col-span-full md:col-span-6 lg:col-span-4 xl:col-span-3">
```

### Flexbox Utilities

```html
<!-- Bootstrap -->
<div class="d-flex justify-content-center align-items-center">
  Centered content
</div>

<!-- Chassis CSS -->
<div class="d-flex justify-content-center align-items-center">
  Centered content
</div>
```

_Note: Flexbox utilities are largely identical_

## Data Attributes

```html
<!-- Bootstrap -->
<div data-bs-toggle="modal" data-bs-target="#myModal">
<body data-bs-spy="scroll" data-bs-target="#navbar">

<!-- Chassis CSS -->
<div data-cx-toggle="dialog" data-cx-target="#myModal">
<body data-cx-spy="scroll" data-cx-target="#navbar">
```

Some `data-cx-toggle` values follow Chassis's component names rather than Bootstrap's: `modal` → `dialog` (a modal is a `<dialog class="modal dialog">`), `offcanvas` → `drawer`, `dropdown` → `menu`.

## LLM Code Transformation Examples

### Example 1: Button Conversion

```html
<!-- INPUT (Bootstrap) -->
<button class="btn btn-primary btn-lg">Click me</button>
<button class="btn btn-outline-secondary btn-sm">Cancel</button>

<!-- OUTPUT (Chassis CSS) -->
<button class="button primary lg">Click me</button>
<button class="button secondary outline sm">Cancel</button>
```

### Example 2: Typography Conversion

```html
<!-- INPUT (Bootstrap) -->
<h1 class="display-4 text-primary">Main Title</h1>
<p class="lead text-muted">Subtitle text</p>
<small class="text-secondary">Helper text</small>

<!-- OUTPUT (Chassis CSS) -->
<h1 class="font-display font-2xl fg-primary">Main Title</h1>
<p class="font-lead fg-subtle">Subtitle text</p>
<small class="fg-secondary">Helper text</small>
```

### Example 3: Card Component Conversion

```html
<!-- INPUT (Bootstrap) -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title text-primary">Title</h5>
    <p class="card-text text-muted">Content</p>
    <a href="#" class="btn btn-primary btn-sm">Action</a>
  </div>
</div>

<!-- OUTPUT (Chassis CSS) -->
<div class="card">
  <div class="card-body">
    <h5 class="card-title fg-primary">Title</h5>
    <p class="fg-subtle">Content</p>
    <a href="#" class="button primary sm">Action</a>
  </div>
</div>
```

### Example 4: Spacing Conversion

```html
<!-- INPUT (Bootstrap) -->
<div class="p-3 m-2 mb-4">
  <h2 class="mb-3">Heading</h2>
  <p class="mt-2">Paragraph</p>
</div>

<!-- OUTPUT (Chassis CSS) -->
<div class="p-md m-xs mb-xl">
  <h2 class="mb-md">Heading</h2>
  <p class="mt-xs">Paragraph</p>
</div>
```

### Example 5: Responsive Grid Conversion

```html
<!-- INPUT (Bootstrap) -->
<div class="container">
  <div class="row">
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">Column 1</div>
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">Column 2</div>
    <div class="d-none d-md-block col-md-4 col-lg-6">Column 3</div>
  </div>
</div>

<!-- OUTPUT (Chassis CSS) -->
<div class="container">
  <div class="grid">
    <div class="col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3">Column 1</div>
    <div class="col-span-full sm:col-span-6 md:col-span-4 lg:col-span-3">Column 2</div>
    <div class="d-none md:d-block md:col-span-4 lg:col-span-6">Column 3</div>
  </div>
</div>
```

## Complete Migration Example

### Before (Bootstrap)

```html
<div class="card">
  <div class="card-body">
    <h3 class="card-title display-6 text-primary">Quick Stats</h3>
    <div class="row text-center">
      <div class="col-4">
        <div class="display-4 text-primary">150</div>
        <div class="text-muted small">Icons</div>
      </div>
      <div class="col-4">
        <div class="display-4 text-success">98%</div>
        <div class="text-muted small">Coverage</div>
      </div>
    </div>
    <div class="mt-3">
      <a href="/browse" class="btn btn-outline-primary btn-sm me-2">
        Browse All
        <span class="badge bg-primary ms-2">150</span>
      </a>
      <a href="/download" class="btn btn-primary btn-sm">Download</a>
    </div>
  </div>
</div>
```

### After (Chassis CSS)

```html
<div class="card">
  <div class="card-body">
    <h3 class="card-title font-display font-lg fg-primary">Quick Stats</h3>
    <div class="grid gap-xl text-center">
      <div class="col-span-4">
        <div class="font-display font-2xl fg-primary">150</div>
        <div class="fg-subtle text-sm">Icons</div>
      </div>
      <div class="col-span-4">
        <div class="font-display font-2xl fg-success">98%</div>
        <div class="fg-subtle text-sm">Coverage</div>
      </div>
    </div>
    <div class="mt-md">
      <a href="/browse" class="button primary outline sm me-xs">
        Browse All
        <span class="badge primary ms-xs">150</span>
      </a>
      <a href="/download" class="button primary sm">Download</a>
    </div>
  </div>
</div>
```

## LLM Decision Tree

When processing user requests involving CSS frameworks:

1. **Detect Bootstrap patterns**:
   - Classes starting with `btn-`, `text-`, `bg-`, `display-`
   - Numeric spacing patterns (`p-1`, `m-3`, etc.)
   - Component patterns (`card-body`, `alert-primary`)
   - Grid classes (`row`, `col-*`, `offset-*`, `g-*`) and abbreviated breakpoints (`col-sm-*`, `d-md-*`, etc.)

2. **Apply Chassis CSS conversion**:
   - Use mapping tables above
   - Preserve HTML structure
   - Convert class names systematically
   - Move responsive breakpoints from infix to prefix (`d-md-flex` → `md:d-flex`) and rename `xxl` to `2xl`
   - Convert the flexbox grid to the CSS grid (`row` → `grid`, `col-md-6` → `col-span-full md:col-span-6`)

3. **Consider context enhancements**:
   - Suggest semantic improvements (`fg-subtle` vs basic colors)
   - Recommend design token usage
   - Highlight Chassis CSS advantages (better color system, named spacing scale)

4. **Validate output**:
   - Ensure all Bootstrap classes are converted
   - Check for proper Chassis CSS syntax
   - Verify component structure changes

## Migration Checklist

### Typography

- [ ] Replace `display-*` with `font-display font-{size}` (`font-lg` to `font-5xl`)
- [ ] Update `text-muted` to `fg-subtle`
- [ ] Convert `text-{color}` to `fg-{color}`
- [ ] Replace `fw-*` with `font-{weight}` (normal, strong, mass, elegant)
- [ ] Update font family classes (`font-monospace` → `font-code`; `font-monospace` also still works)

### Colors

- [ ] Change `text-*` color classes to `fg-*`
- [ ] Update `bg-*` classes to use semantic variants when needed
- [ ] Consider context-specific colors (`primary-fg-subtle`, etc.)
- [ ] Replace `text-muted` with `fg-subtle` or `fg-slight`

### Spacing

- [ ] Convert numeric spacing (`p-1`, `m-3`) to size names (`p-2xs`, `m-md`)
- [ ] Update spacing scales based on design requirements
- [ ] Consider using responsive spacing utilities

### Components

- [ ] Replace `btn` with `button`, and `btn-sm`/`btn-lg` with `sm`/`lg`
- [ ] `card-body` is unchanged; drop `card-text` (no dedicated class, use a plain element)
- [ ] Update badge background classes (`bg-primary` → `primary`)
- [ ] Change alerts to notifications (`alert alert-primary` → `notification primary`)

### Data Attributes

- [ ] Change `data-bs-*` to `data-cx-*`
- [ ] Update JavaScript selectors if using custom code

### Layout

- [ ] Keep breakpoint abbreviations, but rename `xxl` to `2xl`
- [ ] Convert infix to prefix syntax for every responsive utility (`p-md-3` → `md:p-md`, `d-sm-block` → `sm:d-block`)
- [ ] Convert the grid: `row` → `grid`, `col-*` → `col-span-*`, `offset-*` → `col-start-*`, `row-cols-*` → `grid-cols-*`, `g-*` → `gap-*`
- [ ] Add `col-span-full` to an item that was full width below its first breakpoint
- [ ] Convert compound-class components (`container-lg` → `container lg`, `img-fluid` → `image fluid`)
- [ ] Flexbox utilities remain largely the same (just apply the prefix convention when responsive)
- [ ] Display utilities are compatible (same prefix convention when responsive)

## LLM Processing Notes

### Key Differences to Remember:

- **Chassis CSS uses space-separated modifiers**: `button primary outline` not `btn btn-primary btn-outline`
- **Size names for spacing**: `md`, `lg`, `xl` instead of numbers
- **Breakpoint names**: `sm`, `md`, `lg`, `xl`, `2xl` — Bootstrap's abbreviations except `xxl` → `2xl`, but `lg`, `xl` and `2xl` start at 1024px, 1280px and 1536px
- **Prefix, not infix, for responsive utilities**: `md:p-lg` / `md:d-flex` not `p-md-lg` / `d-md-flex` (see [Breakpoint Prefix Syntax](#-breakpoint-prefix-syntax-v020))
- **One grid, a CSS grid**: `grid` with `col-span-*` and `col-start-*`, not `row` with `col-*` and `offset-*` (see [Grid System](#grid-system))
- **Comprehensive color system**: `fg-subtle`, `fg-slight`, `fg-main` for text variations
- **Context-aware colors**: `primary-fg-subtle`, `secondary-bg-evident` for advanced usage
- **Display fonts require two classes**: `font-display font-2xl` not just `display-4`

### What Stays the Same:

- The container classes (`container`, with compound sizes such as `container lg`)
- Most flexbox utilities (`d-flex`, `justify-content-*`)
- Display utilities (`d-none`, `d-block`)
- Position utilities (`position-relative`, `position-absolute`)

### LLM Optimization Tips:

- Always convert all Bootstrap classes in a code snippet
- Suggest improvements using Chassis CSS's advanced features
- Explain the benefits of the semantic approach when relevant
- Consider responsive design implications
- Highlight design token advantages

## Advanced Features

### Context-Aware Design System

Chassis CSS provides sophisticated context-aware color variants:

```html
<!-- Context colors with variants -->
<div class="primary-fg-main">Main primary text</div>
<div class="primary-fg-subtle">Subtle primary text</div>
<div class="primary-fg-slight">Slight primary text</div>
<div class="primary-fg-highlight">Highlighted primary text</div>
<div class="primary-fg-inverse primary-bg-main">Inverse primary text</div>

<!-- Background variants -->
<div class="primary-bg-main">Main primary background</div>
<div class="primary-bg-evident">Evident primary background</div>
```

### Opacity Utilities

```html
<!-- Fine-grained opacity control -->
<div class="fg-primary fg-opacity-subtle">Subtle opacity</div>
<div class="fg-primary fg-opacity-slight">Slight opacity</div>
<div class="bg-primary bg-opacity-subtle">Subtle background</div>
```

### Design Token Integration

Chassis CSS is built on a comprehensive design token system that provides:

- Consistent sizing scales (`--cx-space-*`, `--cx-font-size-*`, etc.)
- Semantic color naming with automatic contrast
- Fluid font sizes with CSS `clamp()`
- Context-aware component styling

This makes Chassis CSS more maintainable and provides better design consistency than Bootstrap's approach.
