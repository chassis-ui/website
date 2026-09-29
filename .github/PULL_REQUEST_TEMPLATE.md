## What this changes

<!-- One or two sentences. If it fixes an open issue, add "Fixes #123". -->

## Why

<!-- The problem this solves. -->

## How to check it

<!--
The quickest way for a reviewer to see it: a page to open with `pnpm dev`, the config to try,
or the test that fails without the change. Add screenshots for visual changes.
-->

---

- [ ] The pull request targets `develop`
- [ ] `pnpm lint`, `pnpm check` and `pnpm test` pass locally
- [ ] **Changeset** (`pnpm changeset`) if `packages/docs` changed, with **Breaking.** for a
      change to what its README documents (see the
      [versioning policy](https://github.com/chassis-ui/website/blob/develop/packages/docs/README.md#versioning))
- [ ] Docs updated, if the change affects a command, a config key or anything the package
      README describes

See [CONTRIBUTING.md](https://github.com/chassis-ui/website/blob/develop/CONTRIBUTING.md#branches-and-pull-requests).
