import { describe, expect, test } from 'vitest'
import Head from '../../src/layouts/head/Head.astro'
import { render } from '../helpers/render'

const props = {
  description: 'A page.',
  layout: 'single',
  robots: undefined,
  thumbnail: 'images/social.png',
  title: 'Page'
}

function renderAt(pathname: string): Promise<string> {
  return render(Head, { props, request: new Request(`https://example.com${pathname}`) })
}

describe('<Head>', () => {
  test('titles the page at the path of the base URL with the title and the subtitle', async () => {
    expect(await renderAt('/fixture/')).toContain('<title>Fixture · A site for the tests</title>')
  })

  test('titles every other page with its own title and the title of the site', async () => {
    expect(await renderAt('/fixture/docs/')).toContain('<title>Page · Fixture</title>')
    expect(await renderAt('/')).toContain('<title>Page · Fixture</title>')
  })

  test('links the font stylesheet of the brand under the static path', async () => {
    const html = await renderAt('/fixture/')

    expect(html).toContain('<link rel="stylesheet" href="/static/fonts/fonts.css">')
    for (const role of ['text', 'display', 'code']) {
      expect(html).not.toContain(`/static/fonts/${role}.css`)
    }
    expect(html).not.toContain('fonts.googleapis.com')
    expect(html).not.toContain('fonts.gstatic.com')
  })
})
