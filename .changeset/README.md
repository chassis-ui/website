# Changesets

A change to `@chassis-ui/docs` adds a changeset: a Markdown file in this folder that names the
version bump and the text of the changelog entry. Run `pnpm changeset` to write one. Changes to
the website need none.

Before 1.0, a breaking change is a `minor` bump and everything else is a `patch`. See
[Versioning](../packages/docs/README.md#versioning) in the package README.

To release, run `pnpm changeset version` on `develop`. It bumps the version and writes
`packages/docs/CHANGELOG.md`. Commit that, and push it to `develop`, `staging` and `main`. The
push to `main` publishes the version. See [Releases](../CONTRIBUTING.md#releases).
