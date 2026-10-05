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

/**
 * Whether a page is the home page of the site: the page at the path of `baseURL`. That is
 * `/` for `https://chassis-ui.com` and `/css/` for `https://chassis-ui.com/css/`.
 *
 * @param baseURL The `baseURL` of the site's `config.yml`.
 * @param pathname URL path of the page, with or without a trailing slash.
 */
export function isHomePath(baseURL: string, pathname: string): boolean {
  const trim = (value: string) => value.replace(/\/+$/, '')

  return trim(pathname) === trim(new URL(baseURL).pathname)
}
