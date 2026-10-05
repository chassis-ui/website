# Operations

> **Purpose:** what to do when something is wrong on chassis-ui.com, and how to rotate the
> credentials the site uses.
>
> **Audience:** the maintainer, and anyone they hand the site to.
>
> **Related:** [DEPLOYMENT.md](DEPLOYMENT.md) for the normal release flow,
> [VERCEL_CONFIG.md](VERCEL_CONFIG.md) for the rewrites, the headers and the firewall rule.

## Who is told

The maintainer runs the site and is the only person to tell. A security problem arrives
through GitHub's private vulnerability reporting, as [SECURITY.md](../.github/SECURITY.md)
describes. There is no on-call rota and no status page.

## How problems are noticed

| Signal                                      | Where                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| A deployment fails                          | Vercel's email, and the deployment in the Vercel dashboard                                                                                   |
| A broken link after a deployment            | The Links workflow in GitHub Actions. A link of a proxied project, or into one, is a warning, not a failure                                  |
| Accessibility or performance after a deploy | The Lighthouse workflow in GitHub Actions                                                                                                    |
| A content security policy violation         | The function log of the website project in Vercel. Search for `CSP violation`. Vercel keeps it for one hour on Hobby, see D23 of the roadmap |
| Abuse of the contact form                   | The firewall overview of the website project in Vercel, rule "Contact form rate limit". It counts requests on staging and production alike   |
| The site is down                            | Nothing yet. Uptime monitoring is a task of roadmap session 4.4                                                                              |

## Roll back the website

Production is the latest deployment of `main`, and staging the latest of `staging`.

**Fastest: go back to the previous deployment.** In the Vercel dashboard, open the
`chassis-website` project and choose **Instant Rollback** on the Production Deployment tile.
On the Hobby plan, the previous production deployment is the only one it offers. From a
terminal:

```bash
vercel rollback <url-or-id-of-the-good-deployment> --scope ozgurgunes
```

A rollback turns off the automatic promotion of new production deployments, so that the next
push to `main` does not undo it. When the fix is on `main`, choose **Undo Rollback** on the
Production Deployment tile and promote the fixed deployment, or run
`vercel promote <url-or-id>`. New pushes to `main` then go live again. The rolled-back
deployment keeps the environment variables it was built with.

For a deployment older than the previous one, revert in Git.

**Durable: revert in Git.** Revert the commit on `develop`, let CI pass, then push the same
commit to `staging` and `main`, as every change goes. The ruleset of `main` and `staging`
requires the checks, so there is no shortcut past CI. Staging has no Instant Rollback: a
revert is the way back.

`vercel.json` acts on every proxied site at once. A bad rewrite or header breaks all six
projects, so roll back first and investigate on staging.

## Roll back a release of `@chassis-ui/docs`

A published version cannot be changed, and npm allows unpublishing only in narrow cases.
Instead:

1. Deprecate the bad version, so that installs warn:

   ```bash
   npm deprecate @chassis-ui/docs@<version> "Broken: use <good-version>"
   ```

2. If it was published to `latest`, point `latest` back at the good version:

   ```bash
   npm dist-tag add @chassis-ui/docs@<good-version> latest
   ```

3. Release a fixed patch the usual way, as [CONTRIBUTING.md](../CONTRIBUTING.md#releases)
   describes.

Each sibling's lockfile pins a version, so a bad release reaches a sibling only when it
updates.

## A proxied site is down

`/css/`, `/tokens/`, `/icons/`, `/assets/`, `/figma/` and `/react/` are served by the
projects' own Vercel deployments. The website only forwards the requests.

1. Open the project's deployment directly, for example `https://chassis-css.vercel.app/css/`.
   If it fails there too, the problem is in that project: roll back its latest deployment
   in its own Vercel project, and fix it in its repository.
2. If it works directly and fails through chassis-ui.com, the problem is here. Check the
   latest change to `vercel.json`, and roll back the website.
3. If the address bar changes to `*.vercel.app` and shows a Vercel login, Deployment
   Protection is on for that project. Turn it off, as "Vercel Deployment Protection" in
   [VERCEL_CONFIG.md](VERCEL_CONFIG.md) describes.
4. If only its styles, scripts or images fail, the referrer-based `/static/*` rules did not
   match. A page opened without a `Referer`, or a browser that strips it, gets the website's
   files instead. See "`/static/*` rewrites" in [VERCEL_CONFIG.md](VERCEL_CONFIG.md).

While a project is down, the rest of the site keeps working. There is no fallback page for
a single project.

## Rotate the Resend API key

The contact form sends mail with `RESEND_API_KEY`. `.env.example` names the variables.

1. In Resend, create a new API key with sending access only.
2. In Vercel, `chassis-website` project, **Settings**, **Environment Variables**, replace
   `RESEND_API_KEY` for Production and Preview.
3. Redeploy production and staging, since a deployment reads the variables when it is
   built. Promote or push as usual, or redeploy the current deployment from the dashboard.
4. Send the form on staging, and check that the mail arrives.
5. Delete the old key in Resend.

Do it at once if the key may have leaked, and check Resend's log for mail the site did not
send.

## Rotate npm credentials

This repository has no npm token. The release workflow uses npm trusted publishing: npm
trusts `.github/workflows/release.yml` of `chassis-ui/website` on `main`, and
issues a short-lived credential for each run. There is nothing to rotate.

- If the workflow file is renamed or moved, update the trusted publisher in the package's
  settings on npmjs.com, or publishing fails. The file was `publish-packages.yml` until
  2026-10-02.
- If an unexpected version appears on npm, check its provenance on the package page, which
  names the workflow run that built it. Then deprecate it as above, and review who can push
  to `main` and who has access to the package on npm.
- No workflow of the Chassis repositories reads the organisation secret `NPM_CHASSIS_UI`
  any more, checked on 2026-10-05: every package is published with trusted publishing.
  Delete the secret from the organisation and revoke its token on npm, if they still
  exist.

## Content security policy reports

The policy is in report-only mode, so a violation breaks nothing. The Vercel function log
keeps each report as one line, for one hour on the Hobby plan. Where to keep them longer is
decision D23 of the [roadmap](ROADMAP.md). A new host in the log usually means a new embed or script on
one of the projects: add it to the policy, as [VERCEL_CONFIG.md](VERCEL_CONFIG.md)
describes, or ask the project to remove it. The policy is enforced once the log has been
quiet for two weeks, a task of roadmap session 4.4.
