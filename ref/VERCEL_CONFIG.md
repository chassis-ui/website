# Vercel Configuration Guide

> **Document Purpose:** Technical reference for Vercel proxy routing configuration  
> **Last Updated:** February 2026  
> **Audience:** Developers working on chassis-website deployment

This document describes how environment-specific URL routing works for the Chassis ecosystem using Vercel rewrites.

## 🎯 Problem Statement

The Chassis ecosystem consists of multiple independent repositories, each with its own documentation site. We need to:

1. Present a unified website at `chassis-ui.com`
2. Route requests to appropriate project sites (e.g., `/docs/css/` → `chassis-css.vercel.app`)
3. Support both production and staging environments
4. Avoid manual configuration changes when merging staging → main

## ✅ Solution: Host Header Conditional Rewrites

We use Vercel's conditional rewrite functionality to detect the requesting domain and route to the appropriate environment automatically.

### How It Works

The `vercel.json` file contains conditional rewrites that:
1. Check the `host` header of incoming requests
2. Route staging domain requests (`staging.chassis-ui.com`) to staging services
3. Let production requests fall through to production services

### Configuration Structure

Each service has two rewrite rules in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/icons/:path*",
      "has": [
        {
          "type": "header",
          "key": "host", 
          "value": "staging.chassis-ui.com"
        }
      ],
      "destination": "https://chassis-icons-staging.vercel.app/:path*"
    },
    {
      "source": "/icons/:path*",
      "destination": "https://chassis-icons.vercel.app/:path*"
    }
  ]
}
```

**How the rules work:**
1. **First rule**: If `host` header equals `staging.chassis-ui.com`, route to staging service
2. **Second rule**: Fallback rule for all other domains (production)

## URL Mapping

| Path | Staging Domain | Production Domain |
|------|----------------|-------------------|
| `/assets/:path*` | `chassis-assets-staging.vercel.app` | `chassis-assets.vercel.app` |
| `/css/:path*` | `chassis-css-staging.vercel.app` | `chassis-css.vercel.app` |
| `/tokens/:path*` | `chassis-tokens-staging.vercel.app` | `chassis-tokens.vercel.app` |
| `/figma/:path*` | `chassis-figma-staging.vercel.app` | `chassis-figma.vercel.app` |
| `/icons/:path*` | `chassis-icons-staging.vercel.app` | `chassis-icons.vercel.app` |
| `/icons-assets/:path*` | `chassis-icons-staging.vercel.app/icons-assets/` | `chassis-icons.vercel.app/icons-assets/` |
| `/tokens-assets/:path*` | `chassis-tokens-staging.vercel.app/tokens-assets/` | `chassis-tokens.vercel.app/tokens-assets/` |

## Development Workflow

### Working with Staging
1. Work on the `staging` branch
2. Push changes → Deploys to `staging.chassis-ui.com`
3. URLs automatically route to `-staging` services due to domain detection

### Production Release
1. Merge `staging` branch to `main` 
2. Push to `main` → Deploys to `chassis-ui.com`
3. URLs automatically route to production services due to domain detection
4. **No manual configuration changes needed!** 🎉

## Benefits

✅ **Single Configuration**: One `vercel.json` works for both environments  
✅ **Merge-Safe**: No manual editing required during staging→main merges  
✅ **Domain-Based**: Routing happens automatically based on the requesting domain  
✅ **Maintainable**: Changes apply to both environments simultaneously  

## Technical Details

### Vercel Configuration
- Uses `"type": "header", "key": "host"` to detect the requesting domain
- Follows Vercel's documented conditional rewrite patterns
- Works in production deployments (not in `vercel dev` locally)

### Limitations
- **Local Development**: Conditional rewrites don't work with `vercel dev` 
- **Testing**: Must test on actual staging/production URLs, not localhost

## Verification Commands

Test staging environment:
```bash
curl -I https://staging.chassis-ui.com/icons/
# Should show 401/404 from chassis-icons-staging.vercel.app
```

Test production environment:
```bash
curl -I https://chassis-ui.com/icons/
# Should show 401/404 from chassis-icons.vercel.app  
```

## Configuration Files Reference

- **`vercel.json`** - Main configuration with conditional rewrites (single file works for both environments)

## Development Workflow

### For Staging Changes
1. Work on the `staging` branch
2. Push changes → Automatically deploys with staging URLs
3. Test on `staging.chassis-ui.com`

### For Production Release
1. Merge `staging` branch to `main` 
2. Push to `main` → Automatically deploys with production URLs
3. Test on `chassis-ui.com`
4. **No manual configuration changes needed** — host-header detection handles environment routing automatically

## Verification

To verify the configuration is working:

```bash
# Test staging routing (should return 401 - means routing works)
curl -I "https://staging.chassis-ui.com/icons"

# Test production routing (should return 401 - means routing works)  
curl -I "https://chassis-ui.com/icons"

# Test direct staging service access
curl -I "https://chassis-icons-staging.vercel.app/icons"

# Test direct production service access
curl -I "https://chassis-icons.vercel.app/icons"
```

## Troubleshooting

If the wrong URLs are being used:

1. **Verify vercel.json**: Check that `vercel.json` contains the correct conditional rewrites
2. **Test Direct URLs**: Verify the target services are accessible
3. **Check Deployment**: Ensure the latest commit is deployed on Vercel

## Migration Notes

This solution replaced a previous approach that attempted to generate `vercel.json` during build time. The current host-header conditional rewrite approach is more reliable because:

- ✅ Single `vercel.json` works for both staging and production
- ✅ No manual configuration changes needed when merging staging → main
- ✅ Vercel reads `vercel.json` directly from git (no build-time dependencies)
- ✅ No environment variable detection issues
- ✅ Works consistently across all deployment types
