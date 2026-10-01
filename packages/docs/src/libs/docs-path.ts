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

/** Joins the static path of the config and a file: `('/css/static', 'css/chassis.css')`. */
export function joinStaticPath(staticPath: string, file = ''): string {
  const name = file.replace(/^\/+/, '')

  return name ? `${staticPath}/${name}` : staticPath
}
