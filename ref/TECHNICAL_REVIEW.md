# Chassis Ecosystem — Technical Review Report

> **Date:** April 15, 2026
> **Scope:** All 6 repositories in the Chassis Design System workspace
> **Reviewer:** Automated technical audit

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository Overview](#2-repository-overview)
3. [Cross-Repo Consistency Audit](#3-cross-repo-consistency-audit)
4. [Issues by Severity](#4-issues-by-severity)
5. [Per-Repo Findings](#5-per-repo-findings)
6. [ref/ Folder Accuracy Audit](#6-ref-folder-accuracy-audit)
7. [Improvement Recommendations](#7-improvement-recommendations)

---

## 1. Executive Summary

The Chassis Design System is a well-architected, production-quality multi-repo ecosystem comprising 6 repositories: **website** (monorepo hub), **css** (framework), **tokens** (design tokens), **icons** (icon library), **assets** (multi-platform asset management), and **figma** (Figma component documentation). The system demonstrates strong engineering discipline with comprehensive linting, build pipelines, and deployment infrastructure.

**Overall Grade: A-**

**Key Strengths:**
- Modern tooling throughout (Astro 5, ESLint 9 flat config, TypeScript 5.9, Style Dictionary v4)
- Unified linting standards enforced across all repos (ESLint + Stylelint + Prettier + VNU)
- Design token enforcement via Stylelint (prevents hardcoded values)
- Clever Vercel routing via host-header conditional rewrites
- Multi-platform token generation (web/iOS/Android)
- Shared docs package (`@chassis-ui/docs`) promoting consistency

**Critical Action Items:** 5 high-priority, 8 medium-priority, 6 low-priority issues identified.

---

## 2. Repository Overview

| Repository | Package | Version | Purpose | Build Tool | Deploy |
|---|---|---|---|---|---|
| chassis-website | @chassis-ui/docs (0.1.7) | monorepo | Hub site + shared docs | Astro 5.13.9 | Vercel |
| chassis-css | @chassis-ui/css | 0.1.2 | CSS framework | Rollup + Sass | Vercel |
| chassis-tokens | @chassis-ui/tokens | 0.1.3 | Design tokens | Style Dictionary v4 | Vercel |
| chassis-icons | @chassis-ui/icons | 0.1.1 | Icon library (489 icons) | SVGO + Fantasticon | Vercel |
| chassis-assets | @chassis-ui/assets | 0.1.4 | Multi-platform assets | Custom Node.js | Vercel |
| chassis-figma | @chassis-ui/figma | 0.1.0 | Figma docs | Astro 5.13.9 | Vercel |

### Dependency Flow
```
@chassis-ui/docs (0.1.7, npm) ← consumed by all 5 project repos
@chassis-ui/tokens ← consumed by css, icons, figma, assets, website
@chassis-ui/css ← consumed by icons, figma, assets, website
@chassis-ui/icons ← consumed by css, figma, website
```

---

## 3. Cross-Repo Consistency Audit

### 3.1 pnpm Version Drift

| Repository | packageManager | Status |
|---|---|---|
| chassis-css | pnpm@10.7.0 | ✅ |
| chassis-icons | pnpm@10.7.0 | ✅ |
| chassis-tokens | pnpm@10.7.0 | ✅ |
| chassis-website | pnpm@10.7.0 | ✅ |
| chassis-figma | **pnpm@9.15.5** | ⚠️ **OUTDATED** |
| chassis-assets | **pnpm@9.15.5** | ⚠️ **OUTDATED** |

**Impact:** Different lockfile formats between pnpm 9 and 10. May cause CI inconsistencies.

### 3.2 @chassis-ui/docs Version

| Repository | Dependency Version | Status |
|---|---|---|
| All 5 project repos | ^0.1.7 | ✅ Aligned |
| ARCHITECTURE.md reference | ^0.1.3 | ⚠️ **Outdated doc** |

### 3.3 Sass Version

| Repository | Sass Version | Strategy |
|---|---|---|
| chassis-css | **1.78.0** (exact) | ⚠️ Pinned |
| chassis-icons | **1.78.0** (exact) | ⚠️ Pinned |
| chassis-tokens | ^1.93.0 | ✅ Range |
| chassis-assets | ^1.93.0 | ✅ Range |
| chassis-figma | ^1.93.0 | ✅ Range |

**Impact:** chassis-css and chassis-icons are locked to Sass 1.78.0 (missing 15+ patch releases including bug/security fixes). The other repos use ^1.93.0.

### 3.4 Base URL Configuration

| Repository | config.yml baseURL | Status |
|---|---|---|
| chassis-css | `https://chassis-ui.com/css/` | ⚠️ **Trailing slash** |
| chassis-tokens | `https://chassis-ui.com/tokens` | ✅ |
| chassis-icons | `https://chassis-ui.com/icons` | ✅ |
| chassis-assets | `https://chassis-ui.com/assets` | ✅ |
| chassis-figma | `https://chassis-ui.com/figma` | ✅ |

### 3.5 Vercel Deployment Configuration

| Repository | vercel.json | Format | Build Command | Status |
|---|---|---|---|---|
| chassis-website | ✅ | v2 with rewrites | `pnpm site:build` | ✅ |
| chassis-css | ❌ **MISSING** | — | — | 🔴 **CRITICAL** |
| chassis-tokens | ✅ | Simple | `pnpm site:build` | ✅ |
| chassis-icons | ✅ | Simple | `pnpm site:build` | ✅ |
| chassis-assets | ✅ | **v2 (builds array)** | `npm run build:site` | ⚠️ Different format |
| chassis-figma | ✅ | **v2 (builds array)** | `npm run build:site` | ⚠️ Different format |

### 3.6 Vercel Routing vs. Actual Config

| ref/ docs say | vercel.json actually has | Match? |
|---|---|---|
| `/docs/css/*` → chassis-css | `/css/:path*` → chassis-css | ❌ **NO `/docs/` prefix** |
| `/docs/tokens/*` → chassis-tokens | `/tokens/:path*` → chassis-tokens | ❌ **NO `/docs/` prefix** |
| `/docs/assets/*` → chassis-assets | `/assets/:path*` → chassis-assets | ❌ **NO `/docs/` prefix** |
| `/docs/icons/*` → chassis-icons | `/icons/:path*` → chassis-icons | ❌ **NO `/docs/` prefix** |
| `/docs/figma/*` → chassis-figma | `/figma/:path*` → chassis-figma | ❌ **NO `/docs/` prefix** |

**This is a significant documentation inaccuracy in ARCHITECTURE.md and DEPLOYMENT.md.**

---

## 4. Issues by Severity

### 🔴 HIGH Priority

| # | Issue | Repository | Details |
|---|---|---|---|
| H1 | **ref/ docs: wrong routing paths** | chassis-website | ARCHITECTURE.md, DEPLOYMENT.md show `/docs/css/*` etc., but actual vercel.json uses `/css/*`, `/tokens/*` etc. without `/docs/` prefix |
| H2 | **ARCHITECTURE.md: outdated @chassis-ui/docs version** | chassis-website | References v0.1.3 but current is v0.1.7 |
| H3 | **chassis-css: missing vercel.json** | chassis-css | No deployment config for Vercel — relies on Vercel auto-detection or dashboard config |
| H4 | **chassis-figma: vercel.json name mismatch** | chassis-figma | `"name": "chassis-assets"` in vercel.json — should be `"chassis-figma"` |
| H5 | **chassis-figma: build command mismatch** | chassis-figma | vercel.json references `npm run build:site` but package.json script is `site:build` |

### 🟡 MEDIUM Priority

| # | Issue | Repository | Details |
|---|---|---|---|
| M1 | **pnpm version drift** | chassis-figma, chassis-assets | Still on pnpm 9.15.5 while others use 10.7.0 |
| M2 | **Sass version pinning** | chassis-css, chassis-icons | Locked to 1.78.0 (exact) — 15+ versions behind the ^1.93.0 used elsewhere |
| M3 | **Silenced Sass deprecations** | chassis-assets, others | `color-functions`, `import`, `global-builtin` deprecations suppressed — technical debt accumulating |
| M4 | **VERCEL_CONFIG.md self-contradiction** | chassis-website | Doc first says "No manual configuration changes needed" (conditional rewrites), then later says "Update vercel.json on main branch" and suggests `cp vercel.staging.json vercel.json` |
| M5 | **GitHub branch references** | All project repos | Dependencies like `github:chassis-ui/css#app/docs` are fragile — branch deletion or force-push breaks installs |
| M6 | **chassis-assets vercel.json format** | chassis-assets | Uses v2 builds array format while tokens/icons use simple format — inconsistent |
| M7 | **svg-sprite release candidate** | chassis-icons | Using svg-sprite 3.0.0-rc3 (not stable) in production |
| M8 | **DEPLOYMENT.md: pnpm version** | chassis-website | References "pnpm 8+" but repos use 9.15.5 or 10.7.0 |

### 🟠 LOW Priority

| # | Issue | Repository | Details |
|---|---|---|---|
| L1 | **ESLint `no-unused-vars` as warn** | All repos | Should be `error` for CI enforcement |
| L2 | **`prettier/prettier` as warn** | All repos | Should be `error` for CI enforcement |
| L3 | **chassis-css trailing slash** | chassis-css | baseURL has trailing slash; others don't |
| L4 | **PostCSS config format** | chassis-icons | Uses `.cjs` while project is ES modules |
| L5 | **Missing root tsconfig** | chassis-website | No root-level tsconfig.json for the monorepo |
| L6 | **Empty .gitmodules-monorepo** | chassis-website | Legacy file in examples/ directory |

---

## 5. Per-Repo Findings

### 5.1 chassis-website

**Strengths:**
- Excellent hybrid monorepo architecture (pnpm workspaces + multi-repo)
- Comprehensive reference documentation in `ref/`
- Smart Vercel routing via host-header conditional rewrites
- Lighthouse CI configured (performance/a11y thresholds at 0.9)
- Clear separation between `@chassis-ui/docs` (shared) and website (private)

**Issues:**
- ref/ documentation has multiple inaccuracies (see Section 6)
- No unit test framework configured
- Missing pre-commit hooks for linting

### 5.2 chassis-css

**Strengths:**
- Production-quality CSS framework with RTL support
- Multi-format JS output (UMD, ESM, Bundle)
- Comprehensive testing (Sass True, Karma/Jasmine, BrowserStack)
- SRI hash generation for CDN security
- Bundle size monitoring via bundlewatch

**Issues:**
- Missing `vercel.json` — deployment relies on Vercel dashboard config
- Sass pinned to exact 1.78.0 (security/bug fix risk)
- baseURL trailing slash inconsistency

### 5.3 chassis-tokens

**Strengths:**
- Multi-platform token generation (web rem/px/vw, iOS Swift, Android XML)
- Style Dictionary v4 with Tokens Studio integration
- Vitest testing framework configured
- Clean build pipeline with brand/theme/screen permutations

**Issues:**
- Minimal — best-maintained repo in the ecosystem

### 5.4 chassis-icons

**Strengths:**
- 489 icons with comprehensive build pipeline (SVG → Sprite → Font)
- Multi-format output (WOFF2, WOFF, CSS, SCSS, SVG, JSON)
- Icon validation script catches build inconsistencies
- Automated MDX page generation per icon

**Issues:**
- svg-sprite 3.0.0-rc3 is a release candidate (stability risk)
- Sass pinned to exact 1.78.0

### 5.5 chassis-assets

**Strengths:**
- Multi-brand, multi-platform asset management (web, iOS, Android)
- Comprehensive test suite (build, API, analyze)
- Asset analysis and validation tools

**Issues:**
- pnpm 9.15.5 (behind other repos at 10.7.0)
- vercel.json uses older v2 format

### 5.6 chassis-figma

**Strengths:**
- Figma component documentation with tabbed interface design
- Content collections for docs, figma, and callouts

**Issues:**
- vercel.json `"name": "chassis-assets"` — copy-paste error
- Build command mismatch (`npm run build:site` vs `site:build`)
- pnpm 9.15.5 (behind other repos)
- Homepage claims "100+ components" but library has ~30 (per internal COPY_REVIEW.md)
- Static Figma data pending `astro sync` type generation

---

## 6. ref/ Folder Accuracy Audit

### ARCHITECTURE.md

| Claim | Actual | Accurate? |
|---|---|---|
| @chassis-ui/docs version ^0.1.3 | v0.1.7 (all repos use ^0.1.7) | ❌ **Outdated** |
| Domain routing: `/docs/css/*` → chassis-css | Actual: `/css/:path*` (no `/docs/` prefix) | ❌ **Wrong path** |
| Domain routing: `/docs/tokens/*` → chassis-tokens | Actual: `/tokens/:path*` | ❌ **Wrong path** |
| Domain routing: `/docs/assets/*` → chassis-assets | Actual: `/assets/:path*` | ❌ **Wrong path** |
| Domain routing: `/docs/icons/*` → chassis-icons | Actual: `/icons/:path*` | ❌ **Wrong path** |
| Domain routing: `/docs/figma/*` → chassis-figma | Actual: `/figma/:path*` | ❌ **Wrong path** |
| Monorepo structure diagram | Matches actual structure | ✅ Accurate |
| Per-repo structure (tokens, css, etc.) | Mostly correct (minor path differences) | ✅ Accurate |
| Shared assets strategy (GitHub branch refs) | Still uses `#app/docs` branches | ✅ Accurate |

### DEPLOYMENT.md

| Claim | Actual | Accurate? |
|---|---|---|
| Build command: `pnpm build` | Actual: `pnpm site:build` (in vercel.json) | ⚠️ **Partial** — `pnpm build` exists as script but vercel.json uses `site:build` |
| Unified routing uses `/docs/*` paths | Actual uses `/css/*`, `/tokens/*` etc. | ❌ **Wrong paths** |
| GitHub Actions workflow example | Uses pnpm v8 | ⚠️ **Outdated** — repos use pnpm 9.15.5-10.7.0 |
| Production URLs: `/docs/css/`, `/docs/tokens/` etc. | Actual: `/css/`, `/tokens/` etc. | ❌ **Wrong paths** |
| Lighthouse CI reference | lighthouse.json exists in repo | ✅ Accurate |

### DEVELOPMENT.md

| Claim | Actual | Accurate? |
|---|---|---|
| Prerequisites: pnpm 8.0.0+ | Repos use pnpm 9.15.5-10.7.0 | ⚠️ **Outdated minimum** |
| Dev server port: 4321 | Correct for website | ✅ Accurate |
| Workspace config | Matches pnpm-workspace.yaml | ✅ Accurate |
| @chassis-ui/docs v0.1.3 | Actual: 0.1.7 | ❌ **Outdated** |
| Linting commands | Match package.json scripts | ✅ Accurate |
| Build output: `../../_site/` | Correct | ✅ Accurate |

### VERCEL_CONFIG.md

| Claim | Actual | Accurate? |
|---|---|---|
| Host-header conditional rewrites | ✅ Used in vercel.json | ✅ Accurate |
| Staging/production environment routing | ✅ Implemented | ✅ Accurate |
| URL mapping table paths (uses `/docs/` prefix) | Actual: no `/docs/` prefix | ❌ **Wrong paths** |
| "No manual configuration changes needed" | Contradicted later in same doc | ⚠️ **Self-contradictory** |
| `vercel.staging.json` / `vercel.production.json` templates | Not found in repo | ⚠️ **Referenced files may not exist** |

### Summary: ref/ Accuracy Score

| Document | Accuracy | Key Problem |
|---|---|---|
| ARCHITECTURE.md | **65%** | Wrong routing paths, outdated version refs |
| DEPLOYMENT.md | **60%** | Wrong routing paths, outdated pnpm version |
| DEVELOPMENT.md | **80%** | Outdated version refs |
| VERCEL_CONFIG.md | **70%** | Wrong paths, self-contradictory, missing template files |

---

## 7. Improvement Recommendations

### Immediate Actions (This Sprint)

1. **Update ref/ documentation routing paths** — Replace all `/docs/css/` references with `/css/`, `/docs/tokens/` with `/tokens/`, etc. across all 4 ref files
2. **Update version references** — Change `@chassis-ui/docs@^0.1.3` to `@chassis-ui/docs@^0.1.7` in ARCHITECTURE.md and DEVELOPMENT.md
3. **Fix chassis-figma vercel.json** — Change `"name": "chassis-assets"` → `"chassis-figma"` and fix build command
4. **Resolve VERCEL_CONFIG.md contradictions** — Remove the outdated branch-switching section that contradicts the conditional rewrite approach
5. **Update pnpm version references** — Change "pnpm 8+" to "pnpm 10+" in DEPLOYMENT.md and DEVELOPMENT.md

### Short-Term (Next Release Cycle)

6. **Standardize pnpm version** — Upgrade chassis-figma and chassis-assets from pnpm 9.15.5 to 10.7.0
7. **Update Sass versions** — Upgrade chassis-css and chassis-icons from pinned 1.78.0 to ^1.93.0 (test for breaking changes from deprecated APIs first)
8. **Add vercel.json to chassis-css** — Create deployment config matching other repos
9. **Standardize vercel.json format** — Use consistent simple format across all repos or document why some use v2 format
10. **Address Sass deprecations** — Migrate away from deprecated `@import`, `global-builtin`, and `color-functions` APIs before Sass removes them

### Medium-Term (Backlog)

11. **Promote ESLint rules to error** — Change `no-unused-vars` and `prettier/prettier` from `warn` to `error` for CI enforcement
12. **Upgrade svg-sprite** — Move from 3.0.0-rc3 to stable release when available
13. **Add pre-commit hooks** — Implement husky + lint-staged across all repos
14. **Pin GitHub branch dependencies** — Consider publishing internal packages to npm or using tagged commits instead of `#app/docs` branch refs
15. **Add unit testing** — chassis-website and chassis-figma lack test frameworks (chassis-tokens has Vitest as a model)
16. **Remove legacy files** — Clean up `examples/.gitmodules-monorepo` and any `.DS_Store` files
17. **Verify template files exist** — VERCEL_CONFIG.md references `vercel.staging.json` and `vercel.production.json` — confirm they exist or remove references

---

*End of Technical Review Report*
