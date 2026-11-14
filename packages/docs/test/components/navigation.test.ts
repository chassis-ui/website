import { describe, expect, test } from 'vitest'
import Navigation from '../../src/layouts/header/Navigation.astro'
import { render } from '../helpers/render'

function renderAt(pathname: string, layout: string): Promise<string> {
  return render(Navigation, {
    props: { layout },
    request: new Request(`https://example.com${pathname}`)
  })
}

const toggler =
  /<button class="nav-link caret cxd-docs-toggler"[^>]*aria-label="([^"]*)"[^>]*>\s*(\w+)\s*<\/button>/

describe('<Navigation>', () => {
  test('names the link to the docs navigation after the package of the page', async () => {
    const html = await renderAt('/tokens/docs/getting-started/introduction/', 'docs')

    expect(html.match(toggler)?.slice(1)).toEqual(['Browse the Tokens docs', 'Tokens'])
    expect(html).toContain('data-cx-target="#cxdSidebar"')
  })

  test('names it Docs where the page is under no package', async () => {
    const html = await renderAt('/docs/getting-started/introduction/', 'docs')

    expect(html.match(toggler)?.slice(1)).toEqual(['Browse the docs', 'Docs'])
  })

  test('names the Packages menu after the package of the page', async () => {
    const menu = /data-cx-toggle="menu"[^>]*>\s*(\w+)\s*<\/button>/

    expect((await renderAt('/tokens/', 'single')).match(menu)?.[1]).toBe('Tokens')
    expect((await renderAt('/blog/', 'single')).match(menu)?.[1]).toBe('Packages')
  })

  test('marks Docs, not the menu, as active on a docs page of a package', async () => {
    const menuActive = /class="nav-link caret active"[^>]*data-cx-toggle="menu"/
    const docsActive =
      /<a[^>]*class="[^"]*\bactive\b[^"]*"[^>]*href="\/tokens\/docs"|<a[^>]*href="\/tokens\/docs"[^>]*class="[^"]*\bactive\b/

    const docsPage = await renderAt('/tokens/docs/getting-started/introduction/', 'docs')
    expect(docsPage).not.toMatch(menuActive)
    expect(docsPage).toMatch(docsActive)

    const home = await renderAt('/tokens/', 'single')
    expect(home).toMatch(menuActive)
    expect(home).not.toMatch(docsActive)
  })

  test('links Docs to the docs of the package on a page of a package', async () => {
    expect(await renderAt('/tokens/', 'single')).toContain('href="/tokens/docs"')
    expect(await renderAt('/tokens/', 'single')).not.toContain('href="/docs"')
    expect(await renderAt('/blog/', 'single')).toContain('href="/docs"')
  })

  test('has no link to the docs navigation outside the docs', async () => {
    expect(await renderAt('/tokens/', 'single')).not.toContain('cxd-docs-toggler')
  })
})
