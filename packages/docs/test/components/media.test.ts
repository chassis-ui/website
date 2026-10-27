import { describe, expect, test } from 'vitest'
import MediaImage from '../../src/components/MediaImage.astro'
import Social from '../../src/layouts/head/Social.astro'
import { render } from '../helpers/render'

const upload = 'https://res.cloudinary.com/fixture/image/upload'

describe('<MediaImage>', () => {
  test('renders the image of the library with a srcset of cropped copies', async () => {
    const html = await render(MediaImage, {
      props: { src: 'blog/cover.jpg', alt: 'A cover', width: 400, height: 210, class: 'image' }
    })

    expect(html).toContain(`src="${upload}/c_fill,g_auto,w_400,h_210,f_auto,q_auto/blog/cover.jpg"`)
    expect(html).toContain(
      `srcset="${upload}/c_fill,g_auto,w_320,h_168,f_auto,q_auto/blog/cover.jpg 320w, `
    )
    expect(html).toContain(`${upload}/c_fill,g_auto,w_800,h_420,f_auto,q_auto/blog/cover.jpg 800w"`)
    expect(html).toContain('sizes="(width >= 400px) 400px, 100vw"')
    expect(html).toContain('width="400" height="210"')
    expect(html).toContain('loading="lazy" decoding="async"')
    expect(html).toContain('alt="A cover"')
    expect(html).toContain('class="image"')
  })

  test('keeps the ratio of the image without a height, and takes its own widths and loading', async () => {
    const html = await render(MediaImage, {
      props: {
        src: 'figma/button.png',
        alt: '',
        width: 600,
        widths: [600],
        sizes: '50vw',
        loading: 'eager'
      }
    })

    expect(html).toContain(`srcset="${upload}/c_limit,w_600,f_auto,q_auto/figma/button.png 600w"`)
    expect(html).toContain('sizes="50vw"')
    expect(html).not.toContain('height=')
    expect(html).toContain('loading="eager"')
  })
})

describe('<Social>', () => {
  const props = { description: 'A page.', layout: 'single', title: 'Page' }

  test('links a 1200 × 630 JPEG copy of a media thumbnail, without loading it', async () => {
    const html = await render(Social, { props: { ...props, thumbnail: 'media:blog/cover.png' } })
    const url = `${upload}/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/blog/cover.png`

    expect(html).toContain(`<meta property="og:image" content="${url}">`)
    expect(html).toContain(`<meta name="twitter:image" content="${url}">`)
    expect(html).toContain('<meta property="og:image:type" content="image/jpeg">')
    expect(html).toContain('<meta property="og:image:width" content="1200">')
    expect(html).toContain('<meta property="og:image:height" content="630">')
  })

  test('names the large card for X and the type of a static thumbnail', async () => {
    const html = await render(Social, { props: { ...props, thumbnail: 'images/social.png' } })

    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(html).toContain('<meta property="og:image:type" content="image/png">')
  })
})
