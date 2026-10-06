# Vercel Configuration Guide

> **Document Purpose:** Technical reference for Vercel proxy routing configuration
> **Last Updated:** October 2026
> **Audience:** Developers working on chassis-website deployment

This document describes how environment-specific URL routing works for the Chassis ecosystem using Vercel rewrites and conditional headers.

## 🎯 Problem Statement

The Chassis ecosystem consists of multiple independent repositories, each with its own documentation site. We need to:

1. Present a unified website at `chassis-ui.com`.
2. Route requests to the appropriate project sites (e.g. `/css/*` → `chassis-css.vercel.app`).
3. Support both production (`chassis-ui.com`) and staging (`staging.chassis-ui.com`) environments from a single `vercel.json`.
4. Avoid manual configuration changes when a commit moves from `staging` to `main`.
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

None of the six staging deployments is behind Vercel's deployment protection: the
maintainer turned it off for chassis-react-staging.vercel.app, the last one, on 2026-10-05.
Each answers with `X-Robots-Tag: noindex, nofollow`.
The route sends staging to it, so that staging never shows production content.

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
    { "type": "header", "key": "referer", "value": "https?://[^/]+/(?:static/)?css/.*" }
  ],
  "destination": "https://chassis-css-staging.vercel.app/static/$1"
},
{
  "source": "/static/(.*)",
  "has": [
    { "type": "header", "key": "referer", "value": "https?://[^/]+/(?:static/)?css/.*" }
  ],
  "destination": "https://chassis-css.vercel.app/static/$1"
}
```

The same pattern is repeated for each project (`/css/`, `/icons/`, `/tokens/`, `/figma/`, `/assets/`, `/react/`). Order matters — staging-specific rules must come before production fallbacks.

The pattern matches the project as the first part of the path of the page, not anywhere in
it. Until 2026-10-01 it was `.*/css/.*`, which also matched `/icons/category/css/`: that
page of the icons site got its files from the css deployment, and lost those that only the
icons site has. The optional `static/` keeps one case of the old pattern: a font that a
stylesheet under `/static/css/` or `/static/icons/` loads has that stylesheet as its
`Referer`, and goes to the css or the icons deployment as before.

A request without a `Referer`, or with one whose path names no project, gets the website's
own file, or a 404. The rules read the path of the `Referer` and not its host, so a
`Referer` of any host with a path under `/css/` is routed to the css deployment. A page of
another site does not send one: under the browsers' default policy it sends its origin
only, without the path. Browsers send the full header for a page's own files under the
site's `Referrer-Policy`, so this is accepted (decision D6 of the [roadmap](ROADMAP.md)).

A rewrite applies only when the website's deployment has no file at the path: Vercel
serves a file of the deployment first. So a file under `/static/` that the website also
builds, such as the shared CSS, the fonts, the icons and the docs images of the assets
submodule, comes from the website for every site, and a sibling's own copy is reached only
for a file that the website lacks. A shared file therefore changes for all sites when the
website deploys it: after a sibling moves its assets pin, the website moves its own (finding
F65 of the [roadmap](ROADMAP.md)).

The files that Astro builds are the exception. A script under `/static/astro/` that another
script imports has that script as its `Referer`, which names no project, so the request
gets the website's file or a 404. Each sibling therefore writes Astro's files to
`<project>/static/astro/` of its build, with `build.assets`, and its pages request them as
`/<project>/static/astro/…`. The `/<project>/(.*)` rule routes them by path, and the
sibling needs no rewrite: the file is
at the path of its URL, on the deployment and on a local `astro preview`. They have a hash
of the site in their name and were never shared.

One URL for all sites is what lets the browser keep one copy of the shared CSS, fonts and
icons. The files are sent with `max-age=0, must-revalidate`: the browser asks each time,
and gets a 304 when the file of the site it is on is the same as its copy, and that site's
file when it differs.

From 2026-09-29 to 2026-10-01 each project also had a prefix of its own,
`/<project>/static/*`, for a move away from the `Referer` header. The move was called off
because it ends the shared cache, and the rules were removed (decision D6).

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
| `script-src`  | `'unsafe-inline'`, `'wasm-unsafe-eval'`, `cdn.jsdelivr.net`, `*.googletagmanager.com`          | Inline scripts of Astro and the `onclick` examples of chassis-css. Pagefind, which is WebAssembly. GSAP on the home page, Fuse on chassis-icons. Google Analytics.            |
| `style-src`   | `'unsafe-inline'`, `cdn.jsdelivr.net`, `fonts.googleapis.com`                                  | `style` attributes throughout the docs. Google Fonts. Was also the Swiper stylesheet, see below.                          |
| `font-src`    | `data:`, `fonts.gstatic.com`                                                                   | Google Fonts. `data:` was the icon font inside the Swiper stylesheet, see below.                                           |
| `img-src`     | `data:`, `i.pravatar.cc`, `github.com`, `avatars.githubusercontent.com`, Google Analytics hosts | Inline images of the docs. The avatar examples and the team page of chassis-css.                                          |
| `connect-src` | Google Analytics hosts                                                                         | The analytics hits. Search, the contact form and the Pagefind index are on the site itself.                               |
| `frame-src`   | `www.youtube.com`, `www.youtube-nocookie.com`                                                  | The ratio example of chassis-css.                                                                                          |
| `worker-src`  | none                                                                                           | The Pagefind worker.                                                                                                       |

The home page dropped Swiper for the carousel of Chassis CSS on 2026-10-06. Nothing on this
site needs `cdn.jsdelivr.net` in `style-src` or `data:` in `font-src` since. Both stay until
`pnpm site:lint:csp --all` on a deployment of the policy without them shows that no sibling
page needs them either.

`object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'self'`
close the rest. `'unsafe-inline'` stays as long as the sites have inline scripts and
event handlers: a static site behind a proxy cannot use nonces, and hashes would differ per
build and per site.

Browsers send each violation to `/api/csp-report`, which writes one line per violation to
the function log of the website project: `CSP violation {"directive":…,"blocked":…,"page":…,"source":…}`.
Vercel keeps that log for one hour on the Hobby plan, so it shows what happens now, not a
history. Violations of the sibling pages arrive there as well. The reports are not stored
anywhere else, decision D23 of the [roadmap](ROADMAP.md): the sites are static, so
`pnpm site:lint:csp https://chassis-ui.com` finds the same violations by opening the pages
of the seven sites in Chrome. See `build/check-csp.js`.

**To add a source,** add it to the right directive, and add a row to the table above. **To
enforce the policy,** rename the header to `Content-Security-Policy` once
`pnpm site:lint:csp` finds no violation on production, with `--all` for each project in
turn. The check reads either header, so it keeps working afterwards. `frame-ancestors`
then takes effect, and
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
**New Rule**, then **Review Changes** and **Publish**. It was created on 2026-09-29, and it
applies to staging as well as production: six test requests on staging from one address
got a 429 on 2026-09-29. Testing the endpoint on staging therefore uses up the limit of the
tester's network for ten minutes, for production too.

## 📦 Functions

Vercel turns every file in `api/` into a function. `.vercelignore` leaves out
`api/*.test.ts`, so that the tests next to the endpoints are not deployed. A module shared
by two endpoints would need a name that starts with `_` for the same reason.

## ⚠️ Vercel Deployment Protection

**Disable Deployment Protection** on every sub-project that the website rewrites to (Vercel project Settings → Deployment Protection → *Disabled*). When it is enabled, Vercel answers a proxied request with its login instead of the site, and the address bar changes from `staging.chassis-ui.com/tokens/` to the underlying `*.vercel.app` URL.

**Symptom of a misconfigured project:** the page of the project shows a Vercel login. The status does not always show it. A request can get a 401 with a `_vercel_sso_nonce` cookie:

```bash
$ curl -I https://staging.chassis-ui.com/tokens/
HTTP/2 401
set-cookie: _vercel_sso_nonce=...
```

It can also get a redirect to Vercel's login, which answers 200: that is what `staging.chassis-ui.com/react/` did on 2026-09-29, and why the link check passed it (F64 of the [roadmap](ROADMAP.md)). `build/check-links.js` and `build/check-csp.js` therefore look at where the root of each project ends up.

Disabling Deployment Protection on the affected sub-project fixes it. A bypass token is not an alternative: each sub-project would need its own, and a token in `vercel.json` would be public.

## Development Workflow

The branch flow is in [DEPLOYMENT.md](DEPLOYMENT.md): work is merged into `develop`, and the same commit is then pushed to `staging` and to `main`.

### Staging
1. Push the commit to `staging` → Vercel deploys to `staging.chassis-ui.com`.
2. URLs route to `*-staging.vercel.app` services automatically via host detection.

### Production release
1. Push the same commit to `main` → Vercel deploys to `chassis-ui.com`.
2. URLs route to production `*.vercel.app` services automatically.
3. **No manual `vercel.json` changes needed** — host detection handles the switch.

## Benefits

- ✅ **Single configuration** — one `vercel.json` works for both environments.
- ✅ **Release-safe** — no manual edits when a commit moves from `staging` to `main`.
- ✅ **Domain-driven** — routing happens automatically based on the requesting host.
- ✅ **Maintainable** — changes apply to both environments simultaneously.

## Technical Details

### Vercel configuration
- Uses `"type": "header", "key": "host"` to detect the requesting domain.
- Uses `"type": "header", "key": "referer"` for `/static/*` disambiguation.
- Uses regex capture groups (`(.*)` / `$1`) in `source` / `destination`.
- Top-level options: `buildCommand`, `outputDirectory`, `trailingSlash: true`, and `git.deploymentEnabled`, which lets Vercel deploy `main` and `staging` and not `develop` or the `dependabot/**` branches.
- A sub-project's own `vercel.json` sets `buildCommand`, `outputDirectory`, `git.deploymentEnabled` and the `X-Robots-Tag` header of its staging host. Whether its deployments are public is the project's Deployment Protection setting, which must be off.

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
- **`packages/website/src/pages/robots.txt.ts`** — robots for the website, by build environment: a production build allows crawling, any other disallows it.
- **`src/pages/robots.txt.ts`** of each sub-project's site (`packages/site`, or `site/` in icons and figma) — always emits `Disallow: /` (sub-projects are never user-facing).

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
- ✅ No manual configuration changes when a commit moves from `staging` to `main`.
- ✅ Vercel reads `vercel.json` directly from git — no build-time dependency.
- ✅ No environment-variable detection issues.
- ✅ Works consistently across all deployment types.
