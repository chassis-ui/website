# Search Engine Indexing Configuration

> **Document Purpose:** Reference for how the Chassis ecosystem controls search engine indexing across production, staging, and direct Vercel deployment URLs.
> **Last Updated:** July 2026
> **Audience:** Developers maintaining the website and sub-project sites.

This document describes how indexing is allowed on the production domain (`chassis-ui.com`) and blocked everywhere else (staging domain + every direct `*.vercel.app` host).

## 🎯 Goals

| Host | Should be indexed? |
|---|---|
| `chassis-ui.com/*` (production custom domain) | ✅ Yes |
| `staging.chassis-ui.com/*` (staging custom domain) | ❌ No |
| `chassis-{tokens,css,icons,figma,assets}.vercel.app/*` (production Vercel previews) | ❌ No |
| `chassis-{tokens,css,icons,figma,assets}-staging.vercel.app/*` (staging Vercel previews) | ❌ No |

The sub-project sites (`chassis-tokens`, `chassis-css`, etc.) exist only as proxy targets behind `chassis-ui.com`. Crawlers must never index those URLs directly.

## 🧱 Strategy Overview

Indexing is controlled with **two layers**:

| Layer | Per-host? | Used for |
|---|---|---|
| `robots.txt` (Astro endpoint) | Yes — each host serves its own | Tells crawlers whether to crawl the host. **Safe to use on sub-project hosts** because `robots.txt` is fetched only when a crawler hits that host directly — it does not affect what crawlers see at `chassis-ui.com`. |
| `X-Robots-Tag` HTTP header (Vercel `vercel.json`) | Conditional on host | Strong signal for staging URLs. **Must NOT be set on production sub-project hosts** because Vercel external rewrites pass upstream response headers to the client, which would leak `noindex` to `chassis-ui.com`. |

### Why both?

- `robots.txt` blocks crawling but doesn't *de-index* URLs that Google already discovered through external links — Google may keep them in the index without content.
- `X-Robots-Tag: noindex` actively removes pages from the index even if backlinks exist.
- Staging deployments get **both**.
- Production sub-project Vercel hosts get **only `robots.txt`** (header would leak through proxy).

## 🗺️ Per-host Configuration Map

| Host | `robots.txt` | `X-Robots-Tag` |
|---|---|---|
| `chassis-ui.com` | `Disallow:` (allow all) + sitemap | (none) |
| `staging.chassis-ui.com` | `Disallow: /` | `noindex, nofollow` |
| `chassis-*.vercel.app` (production previews) | `Disallow: /` | (none — would leak via proxy) |
| `chassis-*-staging.vercel.app` (staging previews) | `Disallow: /` | `noindex, nofollow` |

## 📂 Where each rule lives

### Website (chassis-website)

**`packages/website/src/pages/robots.txt.ts`** — emits sitemap and `Disallow:` only when the build is a production Astro build (`import.meta.env.PROD`) **and** either `VERCEL_ENV` is unset or equals `production`. Staging (`VERCEL_ENV=preview`) and local dev builds emit `Disallow: /`.

```ts
const vercelEnv = process.env.VERCEL_ENV
const allowCrawling = import.meta.env.PROD && (!vercelEnv || vercelEnv === 'production')
```

**`vercel.json`** — adds `X-Robots-Tag: noindex, nofollow` for any request whose `host` header matches `staging.chassis-ui.com`:

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

### Sub-projects (chassis-tokens, chassis-css, chassis-icons, chassis-figma, chassis-assets)

**`site/src/pages/robots.txt.ts`** — always emits `Disallow: /`. These hosts are never user-facing; they only serve as proxy targets.

```ts
const robotsTxt = `# www.robotstxt.org
User-agent: *
Disallow: /
`
```

**`vercel.json`** — adds `X-Robots-Tag: noindex, nofollow` only when host matches `*-staging.vercel.app` (production `*.vercel.app` must NOT receive this header):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "has": [
        { "type": "header", "key": "host", "value": ".*-staging\\.vercel\\.app" }
      ],
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

## ⚠️ Vercel Deployment Protection

Vercel's **Deployment Protection** (project Settings → Deployment Protection) intercepts requests to a deployment and 401-redirects them to a Vercel SSO page. When this is enabled on a sub-project that's used as a rewrite target, the proxied request from `chassis-ui.com/<path>/` collapses into a visible browser redirect to the underlying `*.vercel.app` URL.

**Required setting:** Disable Deployment Protection (or use "Standard Protection + Bypass for Automation" with a query token) on every sub-project that the website rewrites to.

Symptom of misconfiguration:
```
$ curl -I https://staging.chassis-ui.com/tokens/
HTTP/2 401
set-cookie: _vercel_sso_nonce=...
```

## ✅ Verification

Run after deploying any indexing-related change:

```bash
echo "── robots.txt per host ──"
for h in \
  https://chassis-ui.com \
  https://staging.chassis-ui.com \
  https://chassis-tokens.vercel.app \
  https://chassis-css.vercel.app \
  https://chassis-icons.vercel.app \
  https://chassis-figma.vercel.app \
  https://chassis-assets.vercel.app \
  https://chassis-tokens-staging.vercel.app \
  https://chassis-css-staging.vercel.app \
  https://chassis-icons-staging.vercel.app \
  https://chassis-figma-staging.vercel.app \
  https://chassis-assets-staging.vercel.app ; do
  echo "── $h/robots.txt"
  curl -s "$h/robots.txt"
  echo ""
done

echo "── X-Robots-Tag headers ──"
for url in \
  https://chassis-ui.com/ \
  https://chassis-ui.com/tokens/ \
  https://staging.chassis-ui.com/ \
  https://staging.chassis-ui.com/tokens/ \
  https://chassis-tokens.vercel.app/ \
  https://chassis-tokens-staging.vercel.app/ ; do
  hdrs=$(curl -sI "$url")
  st=$(echo "$hdrs" | head -1 | tr -d '\r')
  xrt=$(echo "$hdrs" | grep -i "^x-robots-tag" | tr -d '\r')
  printf "%-60s %-12s %s\n" "$url" "$st" "${xrt:-(no x-robots-tag)}"
done
```

**Expected results:**

| URL | robots.txt | `X-Robots-Tag` |
|---|---|---|
| `chassis-ui.com/*` | `Disallow:` (allow) | (none) |
| `staging.chassis-ui.com/*` | `Disallow: /` | `noindex, nofollow` |
| `chassis-*.vercel.app/*` | `Disallow: /` | (none) |
| `chassis-*-staging.vercel.app/*` | `Disallow: /` | `noindex, nofollow` |

## 📝 Canonical URLs

`getSiteUrl()` in `packages/docs/src/libs/site.ts` determines the Astro `site` value used for sitemap generation and canonical `<link>` tags. In production (`VERCEL_ENV === 'production'`) it returns `config.baseURL`, which is set to the correct path-prefixed `chassis-ui.com` URL in each project's `config.yml` (e.g. `https://chassis-ui.com/tokens/` for chassis-tokens).

This means sub-project sitemaps and canonical tags correctly reference `chassis-ui.com/...` URLs in production builds — not the bare `*.vercel.app` host.

The `Disallow: /` and `X-Robots-Tag: noindex` rules remain the primary defence against direct `*.vercel.app` indexing regardless.

## 🐛 Troubleshooting

### Production page shows `noindex` unexpectedly
Check that the matching sub-project's `vercel.json` does **not** apply `X-Robots-Tag` to its production `*.vercel.app` host. If it does, remove the header rule or scope its `has` condition more tightly to `*-staging.vercel.app` only. Otherwise the header leaks through the website's external rewrite.

### Staging page is indexable
1. Confirm `staging` branch is pushed and Vercel finished rebuilding.
2. Re-fetch `https://staging.chassis-ui.com/robots.txt` — should be `Disallow: /`.
3. Check `curl -sI https://staging.chassis-ui.com/ | grep x-robots` — should show `noindex, nofollow`.
4. Verify `VERCEL_ENV` for the staging deployment is `preview` (not `production`).

### Direct `*.vercel.app` URL is indexable
1. Check `https://<project>.vercel.app/robots.txt` returns `Disallow: /`.
2. If allow rule is shown instead, the sub-project's `staging` branch wasn't pushed — verify with `git rev-parse staging` vs `git rev-parse origin/staging` in that repo.

### Already-indexed URLs in Google
`robots.txt` does not de-index existing entries. Submit a removal request in Google Search Console for any leaked URLs after the noindex headers are live.

## 🔗 Related documents

- [VERCEL_CONFIG.md](VERCEL_CONFIG.md) — proxy rewrite configuration that this strategy interacts with
- [DEPLOYMENT.md](DEPLOYMENT.md) — deployment workflow
