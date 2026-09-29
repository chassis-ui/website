# Vercel Configuration Guide

> **Document Purpose:** Technical reference for Vercel proxy routing configuration
> **Last Updated:** September 2026 (security headers and the contact firewall rule added)
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
| `/react/*` | `chassis-react-staging.vercel.app/react/*` | `chassis-react.vercel.app/react/*` |

chassis-react has no staging deployment yet, so `staging.chassis-ui.com/react/` answers 404
until it has one. The route is there so that staging never shows production content.

### Sitemap routes

Each sub-project's sitemaps live at the **root** of their Vercel deployment (e.g. `chassis-tokens.vercel.app/sitemap-index.xml`), not under a path prefix. The general `/tokens/(.*)` rewrite maps to `/tokens/$1` on the sub-project, which would miss the root-level sitemap files. Dedicated sitemap rewrites placed **before** the catch-all rules handle this:

```json
{ "source": "/tokens/sitemap(.*)", "destination": "https://chassis-tokens.vercel.app/sitemap$1" },
{ "source": "/css/sitemap(.*)",    "destination": "https://chassis-css.vercel.app/sitemap$1" },
{ "source": "/figma/sitemap(.*)",  "destination": "https://chassis-figma.vercel.app/sitemap$1" },
{ "source": "/icons/sitemap(.*)",  "destination": "https://chassis-icons.vercel.app/sitemap$1" },
{ "source": "/assets/sitemap(.*)", "destination": "https://chassis-assets.vercel.app/sitemap$1" },
{ "source": "/react/sitemap(.*)",  "destination": "https://chassis-react.vercel.app/sitemap$1" }
```

Each also has a staging variant (with `has: host = staging.chassis-ui.com`) immediately before the production fallback. After these rewrites, `chassis-ui.com/tokens/sitemap-index.xml` correctly proxies to the sub-project's sitemap.

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

The same pattern is repeated for each project (`/css/`, `/icons/`, `/tokens/`, `/figma/`, `/assets/`, `/react/`). Order matters — staging-specific rules must come before production fallbacks.

A request without a `Referer`, or with one from another site, gets the website's own file,
or a 404. That is why the rules are being replaced (decision D6 of the
[roadmap](ROADMAP.md)).

### `/<project>/static/*` rewrites (path-based)

Next to the referrer-based rules, each project has a static prefix of its own, which needs
no `Referer`:

```json
{ "source": "/css/static/(.*)", "destination": "https://chassis-css.vercel.app/static/$1" }
```

The files stay where they are, under `/static/` of the project's deployment. Only the URLs
in the project's pages change. Each pair of rules sits before the project's catch-all rule,
which would otherwise send `/css/static/…` to `/css/static/…` of the deployment, where
nothing is.

A project moves to its prefix in two steps, task A6 in [SIBLING_TASKS.md](SIBLING_TASKS.md):

1. `@chassis-ui/docs` gets an option for the prefix of static URLs. The package writes
   `/static/` today.
2. The project sets it to `/<project>/static`, and adds a rewrite from
   `/<project>/static/(.*)` to `/static/$1` in its own `vercel.json`, so that its
   deployment still works when opened directly.

When all six projects have moved, the referrer-based rules are removed.

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

## 🔒 Security headers

The first entry of `headers` in `vercel.json` applies to every path. Vercel adds the
headers of this project to the responses of external rewrites too, so they cover the
proxied sibling pages as well as the website's own.

| Header                                | Value                                               | Why                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy-Report-Only` | See below                                           | Reports what the policy would block and blocks nothing yet.                                                                                          |
| `X-Content-Type-Options`              | `nosniff`                                           | A script or stylesheet must be served with its own type.                                                                                             |
| `X-Frame-Options`                     | `SAMEORIGIN`                                        | Other sites cannot frame a page. It is set on its own because `frame-ancestors` has no effect in a report-only policy.                              |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin`                   | Other sites see the origin only. Requests to the site itself keep the full URL, which the referrer-based `/static/*` rewrites need. Do not use `no-referrer`, `origin` or `strict-origin`: they break those rewrites. |
| `Permissions-Policy`                  | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | No page uses these. Leave `fullscreen` and `autoplay` alone: the YouTube embed of the chassis-css docs uses them.                           |

HSTS is not set here. Vercel sends it for every custom domain.

### The content security policy

The policy was written from a crawl of every sitemap URL of the six sites on 2026-09-29,
then checked by serving production through a local proxy with the policy enforced. Each
source is there for a reason:

| Directive     | Sources beyond `'self'`                                                                        | Needed by                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `script-src`  | `'unsafe-inline'`, `'wasm-unsafe-eval'`, `cdn.jsdelivr.net`, `*.googletagmanager.com`          | Inline scripts of Astro and the `onclick` examples of chassis-css. Pagefind, which is WebAssembly. GSAP and Swiper on the home page, Fuse on chassis-icons. Google Analytics. |
| `style-src`   | `'unsafe-inline'`, `cdn.jsdelivr.net`, `fonts.googleapis.com`                                  | `style` attributes throughout the docs. The Swiper stylesheet. Google Fonts.                                              |
| `font-src`    | `data:`, `fonts.gstatic.com`                                                                   | The icon font inside the Swiper stylesheet. Google Fonts.                                                                  |
| `img-src`     | `data:`, `i.pravatar.cc`, `github.com`, `avatars.githubusercontent.com`, Google Analytics hosts | Inline images of the docs. The avatar examples and the team page of chassis-css.                                          |
| `connect-src` | Google Analytics hosts                                                                         | The analytics hits. Search, the contact form and the Pagefind index are on the site itself.                               |
| `frame-src`   | `www.youtube.com`, `www.youtube-nocookie.com`                                                  | The ratio example of chassis-css.                                                                                          |
| `worker-src`  | none                                                                                           | The Pagefind worker.                                                                                                       |

`object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'self'`
close the rest. `'unsafe-inline'` stays as long as the sites have inline scripts and
event handlers: a static site behind a proxy cannot use nonces, and hashes would differ per
build and per site.

Browsers send each violation to `/api/csp-report`, which writes one line per violation to
the function log of the website project: `CSP violation {"directive":…,"blocked":…,"page":…}`.
Violations of the sibling pages arrive there as well.

**To add a source,** add it to the right directive, and add a row to the table above. **To
enforce the policy,** rename the header to `Content-Security-Policy` once the log has shown
no unexplained violations for a while. `frame-ancestors` then takes effect, and
`X-Frame-Options` can stay for older browsers.

## 🧱 Firewall rule for the contact endpoint

The contact form posts to `/api/contact`. The endpoint checks the origin, the size and the
fields, and escapes what it puts into the email. Counting requests needs state that an Edge
function does not have, so the rate limit is a rule of the Vercel Web Application Firewall,
set in the dashboard, not in this repository:

| Setting    | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| Name       | Contact form rate limit                                        |
| If         | Request Path matches the expression `^/api/contact/?$`, and Method equals `POST` |
| Then       | Rate Limit, Fixed Window, 10 minutes, 5 requests, key IP       |
| Action     | Default (429)                                                  |

The site redirects `/api/contact` to `/api/contact/`, because of `trailingSlash`. The form
posts to `/api/contact/` directly, so that a message counts once. The expression matches
both paths, so a client that posts without the slash counts twice and is limited sooner.
The form tells the visitor to wait when it gets a 429. Hobby allows one rate-limit rule per
project, and this is it. To create it: the website project, **Firewall**, **Configure**,
**New Rule**, then **Review Changes** and **Publish**, which applies it to the production
deployment. It was created on 2026-09-29.

## 📦 Functions

Vercel turns every file in `api/` into a function. `.vercelignore` leaves out
`api/*.test.ts`, so that the tests next to the endpoints are not deployed. A module shared
by two endpoints would need a name that starts with `_` for the same reason.

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

- **`vercel.json`** (chassis-website) — main rewrites, security headers, staging `X-Robots-Tag` header.
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
