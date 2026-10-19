import { describe, expect, test } from 'vitest'
import SiteLogo from '../../src/layouts/SiteLogo.astro'
import { render } from '../helpers/render'

describe('<SiteLogo>', () => {
  test('inlines the logo of the static files, hidden from assistive technology', async () => {
    const html = await render(SiteLogo)

    expect(html).toBe(
      '<svg aria-hidden="true" focusable="false" class="site-logo" viewBox="0 0 4 2"><path d="M0 0h4v2H0z" class="icon-default"/></svg>'
    )
  })
})
