import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { describe, expect, test } from 'vitest'
import ResponsiveImage from '../../src/components/ResponsiveImage.astro'
import { render } from '../helpers/render'

const logo = new URL('../fixture/public/static/images/site-logo.svg', import.meta.url)
const version = createHash('md5').update(fs.readFileSync(logo)).digest('hex').slice(0, 8)

describe('<ResponsiveImage>', () => {
  test('links a file of public with its version, and a missing one as it is', async () => {
    const html = await render(ResponsiveImage, {
      props: { imgPath: '/static/images/site-logo.svg', alt: 'Logo', width: 4, height: 2 }
    })

    expect(html).toContain(`src="/static/images/site-logo.svg?v=${version}"`)
    expect(html).toContain(
      `srcset="/static/images/site-logo.svg?v=${version}, /static/images/site-logo@2x.svg 2x"`
    )
    expect(html).toContain('width="4" height="2"')
  })
})
