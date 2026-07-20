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
examples/    # Example implementations consuming Chassis
build/       # Build scripts (build-site.js, sync-submodules.js, etc.)
vendor/      # Git submodule(s), e.g. vendor/assets (chassis-ui/assets)
```

Related sibling repos (separate git projects, not part of this monorepo):
`chassis-tokens`, `chassis-css`, `chassis-assets`, `chassis-icons`, `chassis-figma`.

## Setup & commands

- Package manager: **pnpm** (see `packageManager` in package.json). Do not use npm/yarn.
- Install: `pnpm install`
- Dev server: `pnpm dev` (syncs submodules, then Astro dev at `localhost:4321`)
- Build: `pnpm build` / `pnpm site` (build + pagefind + vnu HTML lint)
- Type/diagnostics check: `pnpm check` (runs `astro check` for both packages + `pnpm audit`)
- Lint: `pnpm site:lint` (eslint + stylelint + prettier + html validation), `pnpm docs:lint`
- Format: `pnpm docs:format` (prettier --write for packages/docs)

Run the relevant lint/check command after making changes before considering a task done.

## Conventions

- Astro components/pages under `packages/website/src`; shared doc utilities under
  `packages/docs/src`.
- Formatting is enforced by Prettier (`.prettierrc.json`) and Stylelint
  (`stylelint.config.js`) — don't hand-format against their rules.
- Content (blog, docs) lives in Astro content collections under
  `packages/website/src/content`.
- `vendor/assets` is a git submodule — don't edit its contents directly here; changes
  belong in the `chassis-assets` repo.

## Reference docs

`ref/` contains deeper reference material — read the relevant doc before working in its
area rather than re-deriving from source:

- [ref/ARCHITECTURE.md](ref/ARCHITECTURE.md) — hybrid monorepo + multi-repo ecosystem structure
- [ref/DEVELOPMENT.md](ref/DEVELOPMENT.md) — detailed dev setup/workflow
- [ref/DEPLOYMENT.md](ref/DEPLOYMENT.md) — environments, branches, deploy triggers
- [ref/VERCEL_CONFIG.md](ref/VERCEL_CONFIG.md) — Vercel proxy routing across ecosystem sites
- [ref/INDEXING.md](ref/INDEXING.md) — search engine indexing rules per host/environment
- [ref/CHASSIS_CSS.md](ref/CHASSIS_CSS.md) — Bootstrap → Chassis CSS conversion guide (written for LLMs)

## Cautions

- Never commit or push without being asked.
- Don't edit generated output in `_site/`, `.cache/`, or `node_modules/`.
- Submodule sync (`pnpm sync-submodules`) pulls from the `app/docs` branch of
  `chassis-ui/assets` — be aware changes there originate from a different repo.
