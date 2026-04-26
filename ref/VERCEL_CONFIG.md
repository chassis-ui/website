# Vercel Configuration Guide

> **Document Purpose:** Technical reference for Vercel proxy routing configuration
> **Last Updated:** April 2026
> **Audience:** Developers working on chassis-website deployment

This document describes how environment-specific URL routing works for the Chassis ecosystem using Vercel rewrites and conditional headers.

## 🎯 Problem Statement

The Chassis ecosystem consists of multiple independent repositories, each with its own documentation site. We need to:

1. Present a unified website at `chassis-ui.com`.
2. Route requests to the appropriate project sites (e.g. `/css/*` → `chassis-css.vercel.app`).
3. Support both production (`chassis-ui.com`) and staging (`staging.chassis-ui.com`) environments from a single `vercel.json`.
4. Avoid manual configuration changes when merging `staging` → `main`.
5. Keep search engines indexing only the production custom domain.

## ✅ Solution: Host Header Conditional Rewrites

We use Vercel's conditional rewrites (`has`) to detect the requesting domain and route to the appropriate environment automatically.

### How It Works

`vercel.json` contains conditional rewrites that:
1. Check the `host` header of incoming requests.
2. Route requests on `staging.chassis-ui.com` to staging services.
3. Let production requests fall through to a default rule.

### Configuration Structure

Each service has two rewrite rules per route:

```json
{
  "rewrites": [
    {
      "source": "/css/(.*)",
      "has": [
        { "type": "header", "key": "host", "value": "staging.chassis-ui.com" }
      ],
      "destination": "https://chassis-css-staging.vercel.app/css/$1"
    },
    {
      "source": "/css/(.*)",
      "destination": "https://chassis-css.vercel.app/css/$1"
    }
  ]
}
```

**How the rules work:**
1. **First rule**: If the `host` header equals `staging.chassis-ui.com`, route to the staging service.
2. **Second rule**: Fallback for all other hosts (production).

> 📝 The current configuration uses regex capture groups (`(.*)` / `$1`). The older `:path*` style is also supported by Vercel but is no longer used here.

## URL Mapping

### Project routes

| Path | Staging destination | Production destination |
|------|---------------------|------------------------|
| `/assets/*` | `chassis-assets-staging.vercel.app/assets/*` | `chassis-assets.vercel.app/assets/*` |
| `/css/*` | `chassis-css-staging.vercel.app/css/*` | `chassis-css.vercel.app/css/*` |
| `/tokens/*` | `chassis-tokens-staging.vercel.app/tokens/*` | `chassis-tokens.vercel.app/tokens/*` |
| `/figma/*` | `chassis-figma-staging.vercel.app/figma/*` | `chassis-figma.vercel.app/figma/*` |
| `/icons/*` | `chassis-icons-staging.vercel.app/icons/*` | `chassis-icons.vercel.app/icons/*` |
| `/icons-assets/*` | `chassis-icons-staging.vercel.app/icons-assets/*` | `chassis-icons.vercel.app/icons-assets/*` |
| `/tokens-assets/*` | `chassis-tokens-staging.vercel.app/tokens-assets/*` | `chassis-tokens.vercel.app/tokens-assets/*` |

### `/static/*` rewrites (referer-based)

Each sub-project's pages reference assets under `/static/...` (CSS, JS, images, fonts). When such a request arrives at the website, we cannot tell which sub-project owns it from the path alone — so we use the `Referer` header to disambiguate.

```json
{
  "source": "/static/(.*)",
  "has": [
    { "type": "header", "key": "host", "value": "staging.chassis-ui.com" },
    { "type": "header", "key": "referer", "value": ".*/css/.*" }
  ],
  "destination": "https://chassis-css-staging.vercel.app/static/$1"
},
{
  "source": "/static/(.*)",
  "has": [
    { "type": "header", "key": "referer", "value": ".*/css/.*" }
  ],
  "destination": "https://chassis-css.vercel.app/static/$1"
}
```

The same pattern is repeated for each project (`/css/`, `/icons/`, `/tokens/`, `/figma/`, `/assets/`). Order matters — staging-specific rules must come before production fallbacks.

## 🚫 Indexing-related headers

`vercel.json` also adds an `X-Robots-Tag: noindex, nofollow` header for any request whose `host` header matches `staging.chassis-ui.com`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "has": [
        { "type": "header", "key": "host", "value": "staging.chassis-ui.com" }
      ],
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

This stops staging from being indexed even if external backlinks point at it. See [INDEXING.md](INDEXING.md) for the full per-host indexing strategy.

## ⚠️ Vercel Deployment Protection

**Disable Deployment Protection** on every sub-project that the website rewrites to (Vercel project Settings → Deployment Protection → *Disabled*). When it is enabled, Vercel intercepts proxied requests and 401-redirects them to a Vercel SSO page, which collapses the rewrite into a visible browser redirect to the underlying `*.vercel.app` URL.

**Symptom of a misconfigured project:**

```bash
$ curl -I https://staging.chassis-ui.com/tokens/
HTTP/2 401
set-cookie: _vercel_sso_nonce=...
```

The address bar will change from `staging.chassis-ui.com/tokens/` to `chassis-tokens-staging.vercel.app/...`. Disabling Deployment Protection on `chassis-tokens` (and any other affected sub-project) fixes it.

## Development Workflow

### Working on staging
1. Branch off `staging`, do work, merge into `staging`.
2. Push `staging` → Vercel deploys to `staging.chassis-ui.com`.
3. URLs route to `*-staging.vercel.app` services automatically via host detection.

### Production release
1. Merge `staging` → `main`.
2. Push `main` → Vercel deploys to `chassis-ui.com`.
3. URLs route to production `*.vercel.app` services automatically.
4. **No manual `vercel.json` changes needed** — host detection handles the switch.

## Benefits

- ✅ **Single configuration** — one `vercel.json` works for both environments.
- ✅ **Merge-safe** — no manual edits during `staging` → `main` merges.
- ✅ **Domain-driven** — routing happens automatically based on the requesting host.
- ✅ **Maintainable** — changes apply to both environments simultaneously.

## Technical Details

### Vercel configuration
- Uses `"type": "header", "key": "host"` to detect the requesting domain.
- Uses `"type": "header", "key": "referer"` for `/static/*` disambiguation.
- Uses regex capture groups (`(.*)` / `$1`) in `source` / `destination`.
- Top-level options: `buildCommand`, `outputDirectory`, `trailingSlash: true`.
- Sub-projects use `"public": true` to mark deployments as publicly accessible (independent of Deployment Protection settings, which must also be off).

### Limitations
- **Local development** — conditional rewrites do **not** work with `vercel dev`; must test on real staging/production URLs.
- **Header leakage on rewrites** — Vercel external rewrites pass upstream response headers to the client. This is why production sub-projects must NOT add an `X-Robots-Tag: noindex` header (it would leak to `chassis-ui.com` and de-index production). See [INDEXING.md](INDEXING.md).

## Verification Commands

Test staging:
```bash
curl -sI https://staging.chassis-ui.com/css/
# → HTTP/2 200, x-robots-tag: noindex, nofollow
```

Test production:
```bash
curl -sI https://chassis-ui.com/css/
# → HTTP/2 200, no x-robots-tag
```

Test direct sub-project access (should not be SSO-gated):
```bash
curl -sI https://chassis-tokens.vercel.app/tokens/
# → HTTP/2 200 (not 401)
```

## Configuration Files Reference

- **`vercel.json`** (chassis-website) — main rewrites + staging `X-Robots-Tag` header.
- **`vercel.json`** (each sub-project) — `X-Robots-Tag` for `*-staging.vercel.app` hosts only.
- **`packages/website/src/pages/robots.txt.ts`** — host-aware robots for the website.
- **`<sub-project>/site/src/pages/robots.txt.ts`** — always emits `Disallow: /` (sub-projects are never user-facing).

## Troubleshooting

If the wrong URLs are being used:

1. **Verify `vercel.json`** — confirm the conditional rewrites and `host` header values are correct.
2. **Test direct URLs** — `curl -sI https://chassis-css.vercel.app/css/` should return 200 without an SSO redirect.
3. **Check Deployment Protection** — must be disabled on every sub-project (see above).
4. **Check the latest deployment** — confirm Vercel built from the expected commit on `main` / `staging`.
5. **Branch sync** — confirm local and remote `staging` branches match (`git rev-parse staging` vs `origin/staging`); a stale remote means an outdated deployment.

## Migration Notes

This solution replaced an earlier approach that generated `vercel.json` at build time. The current host-header conditional rewrite approach is more reliable because:

- ✅ Single `vercel.json` works for both staging and production.
- ✅ No manual configuration changes when merging `staging` → `main`.
- ✅ Vercel reads `vercel.json` directly from git — no build-time dependency.
- ✅ No environment-variable detection issues.
- ✅ Works consistently across all deployment types.
