# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project

Chassis Website is a pnpm workspace monorepo: the Astro-based documentation/marketing
site for the Chassis Design System, plus the shared `@chassis-ui/docs` package used by
other Chassis doc sites.

```
packages/
  website/   # Main Astro site (src/components, content, layouts, libs, pages, styles)
  docs/      # Shared @chassis-ui/docs utilities (TypeScript)
build/       # Checks and release scripts (check-links.js, fixture-sites.js, etc.)
vendor/      # assets.json pins the release of chassis-ui/website-assets; assets/ is unpacked, not committed
```

Related sibling repos (separate git projects, not part of this monorepo):
`chassis-ui/tokens`, `chassis-ui/website-tokens`, `chassis-ui/css`, `chassis-ui/assets`,
`chassis-ui/icons`, `chassis-ui/website-icons`, `chassis-ui/figma`, `chassis-ui/react`, `chassis-ui/vanilla-example`.

## Setup & commands

- Package manager: **pnpm** (see `packageManager` in package.json). Do not use npm/yarn.
- Node: 24 (`.nvmrc`); `engines` allows `>=22.12.0`.
- Install: `pnpm install`
- Dev server: `pnpm dev` (`pnpm vendor`, then Astro dev at `localhost:4321`). `CHASSIS_BRAND=sinefil pnpm dev` previews another brand
- Build: `pnpm build` (`pnpm vendor` + site + pagefind, as Vercel); `pnpm site` adds vnu HTML lint
- Preview: `pnpm preview` (serves `_site/`)
- Lint: `pnpm lint` (eslint + stylelint + prettier for both packages, then `pnpm spellcheck`)
- Format: `pnpm format` (prettier --write for both packages)
- Tests: `pnpm test` (Vitest: `packages/docs/test` and `api/*.test.ts`)
- Fixture sites: `pnpm test:fixtures` (packs `@chassis-ui/docs`, builds `packages/docs/starter` in two layouts)
- Canary: `pnpm test:canary` (after `pnpm vendor`; builds the sibling sites whose range accepts the packed version)
- Type/diagnostics check: `pnpm check` (runs `astro check` for both packages + `pnpm audit --prod`)
- The full table is under "Commands" in `CONTRIBUTING.md`.
- A pre-commit hook (simple-git-hooks + lint-staged, installed by `pnpm install`) runs ESLint
  and Prettier on staged files of both packages.

Run the relevant lint/check command after making changes before considering a task done.

## Conventions

- Astro components/pages under `packages/website/src`; shared doc utilities under
  `packages/docs/src`.
- Formatting is enforced by Prettier (`.prettierrc.json`) and Stylelint
  (`stylelint.config.js`) — don't hand-format against their rules.
- Content (blog, docs) lives in Astro content collections under
  `packages/website/src/content`.
- Name a sibling by its GitHub repository, as in `chassis-ui/css`. Never by a local folder
  name or a relative path: those differ per contributor.
- `vendor/assets` is unpacked from a release — don't edit its contents; changes belong in the
  `chassis-ui/website-assets` repo.
- The brand switch is for previews. The website is deployed for the `chassis` brand only.

## Reference docs

`ref/` contains deeper reference material — read the relevant doc before working in its
area rather than re-deriving from source:

- [ref/ARCHITECTURE.md](ref/ARCHITECTURE.md) — hybrid monorepo + multi-repo ecosystem structure
- [ref/DEVELOPMENT.md](ref/DEVELOPMENT.md) — detailed dev setup/workflow
- [ref/DEPLOYMENT.md](ref/DEPLOYMENT.md) — environments, branches, deploy triggers
- [ref/OPERATIONS.md](ref/OPERATIONS.md) — rollbacks, a proxied site that is down, credential rotation
- [ref/VERCEL_CONFIG.md](ref/VERCEL_CONFIG.md) — Vercel proxy routing across ecosystem sites
- [ref/INDEXING.md](ref/INDEXING.md) — search engine indexing rules per host/environment
- [ref/CHASSIS_CSS.md](ref/CHASSIS_CSS.md) — Bootstrap → Chassis CSS conversion guide (written for LLMs)
- [ref/ROADMAP.md](ref/ROADMAP.md) — closed record of the 2026-09/10 hardening project: what each
  phase did, and the findings (F), sibling findings (S) and decisions (D) that code and docs cite.
  Open work is in the GitHub issues, not here; don't add tasks or a session log to it
- [ref/CONTRACT_REVIEW.md](ref/CONTRACT_REVIEW.md) — what differed between the sites' copies of
  `src/libs` before `@chassis-ui/docs` 0.6, and of the build scripts before the `chassis-docs`
  commands, and why; the contract itself is in `packages/docs/README.md`

## Cautions

- Never commit or push without being asked.
- Work that belongs in a sibling repo is not done from a session in this repo: tell the
  maintainer.
- Don't edit generated output in `_site/`, `.cache/`, or `node_modules/`.
- `pnpm sync-assets` moves the pin in `vendor/assets.json` to the latest release of
  `chassis-ui/website-assets` — be aware changes there originate from a different repo.
