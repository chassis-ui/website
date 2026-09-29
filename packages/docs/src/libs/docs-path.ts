/**
 * URL path of a docs page.
 *
 * @param docsPath The `docsPath` of the site's `config.yml`, e.g. `"/css/docs"`.
 * @param inputPath Path of the page inside the docs, e.g. `"/components/button/"`.
 */
export function joinDocsPath(docsPath: string, inputPath: string): string {
  const base = docsPath.replace(/\/+$/, '')
  const page = inputPath.replace(/^\/+/, '')

  return page ? `${base}/${page}` : base
}
