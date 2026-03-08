import type { HTMLAttributes } from 'astro/types'

export function getChassisCssProps(direction: 'rtl' | undefined) {
  let cxCssLinkHref = '/static/css/chassis'

  if (direction === 'rtl') {
    cxCssLinkHref = `${cxCssLinkHref}.rtl`
  }

  if (import.meta.env.PROD) {
    cxCssLinkHref = `${cxCssLinkHref}.min`
  }

  cxCssLinkHref = `${cxCssLinkHref}.css`

  const cxCssLinkProps: HTMLAttributes<'link'> = {
    href: cxCssLinkHref,
    rel: 'stylesheet'
  }

  return cxCssLinkProps
}

export function getChassisJsProps() {
  let cxJsScriptSrc = '/static/js/chassis.bundle'

  if (import.meta.env.PROD) {
    cxJsScriptSrc = `${cxJsScriptSrc}.min`
  }

  cxJsScriptSrc = `${cxJsScriptSrc}.js`

  const cxJsLinkProps: HTMLAttributes<'script'> = {
    src: cxJsScriptSrc
  }

  return cxJsLinkProps
}
