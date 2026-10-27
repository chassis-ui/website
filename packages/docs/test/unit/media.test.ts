import { describe, expect, test } from 'vitest'
import {
  encodeMediaPath,
  getImageType,
  getMediaImageSrcSet,
  getMediaImageUrl,
  getMediaImageWidths,
  isMediaPath
} from '../../src/libs/media'
import { configSchema, zMediaPath } from '../../src/libs/schema'

const upload = 'https://res.cloudinary.com/chassis/image/upload'

describe('encodeMediaPath', () => {
  test('keeps the folders and encodes each segment', () => {
    expect(encodeMediaPath('blog/2026/color system/cover.jpg')).toBe(
      'blog/2026/color%20system/cover.jpg'
    )
  })

  test.each([
    'https://example.com/cover.jpg',
    'media:blog/cover.jpg',
    '/blog/cover.jpg',
    'blog//cover.jpg',
    'blog/../cover.jpg',
    'blog/./cover.jpg',
    'blog/cover.jpg?v=2',
    'blog/cover.jpg#top',
    'blog\\cover.jpg',
    ''
  ])('refuses %j', (file) => {
    expect(() => encodeMediaPath(file)).toThrow(
      'Expected the path of an image in the media library'
    )
    expect(isMediaPath(file)).toBe(false)
  })
})

describe('getMediaImageUrl', () => {
  test('crops to the ratio of both sizes around the subject', () => {
    expect(getMediaImageUrl('chassis', 'blog/cover.jpg', { width: 800, height: 420 })).toBe(
      `${upload}/c_fill,g_auto,w_800,h_420,f_auto,q_auto/blog/cover.jpg`
    )
  })

  test('keeps the ratio of the image, and never enlarges it, with one size', () => {
    expect(getMediaImageUrl('chassis', 'cover.jpg', { width: 640 })).toBe(
      `${upload}/c_limit,w_640,f_auto,q_auto/cover.jpg`
    )
    expect(getMediaImageUrl('chassis', 'cover.jpg', { height: 300 })).toBe(
      `${upload}/c_limit,h_300,f_auto,q_auto/cover.jpg`
    )
  })

  test('takes a format and a quality', () => {
    expect(getMediaImageUrl('chassis', 'cover.png', { format: 'jpg', quality: 80 })).toBe(
      `${upload}/f_jpg,q_80/cover.png`
    )
  })

  test.each([{ width: 0 }, { width: 12.5 }, { height: -1 }, { quality: 101 }])(
    'refuses %j',
    (transform) => {
      expect(() => getMediaImageUrl('chassis', 'cover.jpg', transform)).toThrow()
    }
  )
})

describe('getMediaImageWidths', () => {
  test('lists the widths up to twice the width, and the width', () => {
    expect(getMediaImageWidths(500)).toEqual([320, 480, 500, 640, 800])
    expect(getMediaImageWidths(1200)).toEqual([
      320, 480, 640, 800, 1024, 1200, 1280, 1600, 1920, 2400
    ])
  })
})

describe('getMediaImageSrcSet', () => {
  test('crops every copy to the ratio of the image', () => {
    expect(
      getMediaImageSrcSet('chassis', 'cover.jpg', [400, 800], { width: 1200, height: 630 })
    ).toBe(
      `${upload}/c_fill,g_auto,w_400,h_210,f_auto,q_auto/cover.jpg 400w, ` +
        `${upload}/c_fill,g_auto,w_800,h_420,f_auto,q_auto/cover.jpg 800w`
    )
  })

  test('limits the width of every copy without a height', () => {
    expect(getMediaImageSrcSet('chassis', 'cover.jpg', [400], { width: 1200 })).toBe(
      `${upload}/c_limit,w_400,f_auto,q_auto/cover.jpg 400w`
    )
  })
})

describe('getImageType', () => {
  test.each([
    ['social.png', 'image/png'],
    ['https://example.com/cover.JPG?v=1', 'image/jpeg'],
    ['cover.webp', 'image/webp'],
    ['cover', undefined],
    ['cover.txt', undefined]
  ])('%s is %s', (file, type) => {
    expect(getImageType(file)).toBe(type)
  })
})

describe('media schemas', () => {
  test('zMediaPath accepts a path of the library and refuses a URL', () => {
    expect(zMediaPath.safeParse('blog/2026/cover.jpg').success).toBe(true)
    expect(zMediaPath.safeParse('/static/images/cover.jpg').success).toBe(false)
  })

  test('media of the config takes a cloud name, not a URL', () => {
    const base = {
      authors: 'A',
      baseURL: 'https://example.com',
      currentVersion: '1.0.0',
      description: 'D',
      docsPath: '/docs',
      repo: 'https://github.com/chassis-ui/website',
      subtitle: 'S',
      title: 'T'
    }

    expect(configSchema.safeParse({ ...base, media: { cloudinary: 'bknbaorg' } }).success).toBe(
      true
    )
    expect(
      configSchema.safeParse({ ...base, media: { cloudinary: 'https://res.cloudinary.com/x' } })
        .success
    ).toBe(false)
    expect(configSchema.safeParse({ ...base, media: { url: 'x' } }).success).toBe(false)
  })
})
