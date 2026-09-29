# Security Policy

## Supported versions

`@chassis-ui/docs` is pre-1.0. Only the latest published version gets fixes; there are no
maintenance branches for older versions. The website is deployed from `main`, so only what
runs on [chassis-ui.com](https://chassis-ui.com) today is supported.

## What to report

This repository holds two things that run for other people:

- **The website, chassis-ui.com.** Its contact form sends email through the endpoint in
  `api/contact.ts`. The site also routes `/css/`, `/tokens/`, `/icons/`, `/assets/` and
  `/figma/` to the sites of the other Chassis projects, with the rewrites in `vercel.json`.
  A way to send mail the form was not meant to send, to inject markup into that mail, or to
  make a route serve content that is not the project's own, is a vulnerability.
- **`@chassis-ui/docs`**, the package every Chassis documentation site is built with. Most
  of it runs at build time, on the machine that builds a site. The scripts in
  `packages/docs/src/js/` run in visitors' browsers, such as search, the copy button and the
  color mode switch. A way to run script through them, or a published version that
  differs from what the source in this repository builds, is a vulnerability.

A problem in the site of another Chassis project belongs to that project's repository, even
when it shows under chassis-ui.com.

## Reporting a vulnerability

**Please don't open a public GitHub issue for a security vulnerability.**

Instead, use GitHub's private vulnerability reporting for this repository:
[github.com/chassis-ui/website/security/advisories/new](https://github.com/chassis-ui/website/security/advisories/new).
This opens a private thread visible only to you and the maintainers, so a fix can be released
before any public write-up.

If you can't use GitHub's private reporting, open a regular issue asking a maintainer to reach out
for a private channel, without including any details of the vulnerability.

We'll acknowledge new reports and keep you updated while we investigate and fix a confirmed issue.
Please give us reasonable time to release a fix before any public disclosure.
