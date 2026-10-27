// Images of the media library, which is a Cloudinary account. A page names an image by its
// path in the library, such as `blog/2026/color-system/cover.jpg`, and these functions build
// the URL of a resized copy. Only this file knows the URL format of the provider, so a move
// to another provider changes this file and `media` of the config, and no page.

/** How the copy of an image is resized and encoded. */
export interface MediaTransform {
  /** Width of the copy in pixels. */
  width?: number
  /**
   * Height of the copy in pixels. With `width`, the copy is cropped to that ratio around the
   * subject of the image. Without, the copy keeps the ratio of the image.
   */
  height?: number
  /** `auto` serves AVIF or WebP to a browser that accepts them. Default `auto`. */
  format?: 'auto' | 'avif' | 'jpg' | 'png' | 'webp'
  /** A number from 1 to 100, or `auto` for the lowest that looks the same. Default `auto`. */
  quality?: 'auto' | number
}

const MEDIA_FORMAT_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp'
}

/**
 * The media type of an image file from its extension, e.g. `image/png` for `social.png`.
 * `undefined` when the extension is not one of an image.
 */
export function getImageType(file: string): string | undefined {
  const extension = file
    .split(/[?#]/)[0]
    .match(/\.([a-z0-9]+)$/i)?.[1]
    ?.toLowerCase()

  return extension ? MEDIA_FORMAT_TYPES[extension] : undefined
}

function assertPositiveInteger(name: string, value: number | undefined): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 1)) {
    throw new Error(`The ${name} of a media image must be a positive integer, not ${value}.`)
  }
}

/**
 * Checks the path of an image in the media library and returns it encoded for a URL.
 *
 * @throws For a URL, a path that starts with `/`, an empty segment, `.` or `..`, a query or
 *   a hash.
 */
export function encodeMediaPath(file: string): string {
  const segments = file.split('/')

  if (
    /^[a-z][\w+.-]*:/i.test(file) ||
    /[?#\\]/.test(file) ||
    segments.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new Error(
      `Expected the path of an image in the media library, such as "blog/cover.jpg", not "${file}".`
    )
  }

  return segments.map((segment) => encodeURIComponent(segment)).join('/')
}

/** Whether `file` is the path of an image in the media library, as `encodeMediaPath()` takes it. */
export function isMediaPath(file: string): boolean {
  try {
    encodeMediaPath(file)
    return true
  } catch {
    return false
  }
}

/**
 * URL of a copy of an image of the media library.
 *
 * @example
 * ```ts
 * getMediaImageUrl('chassis', 'blog/cover.jpg', { width: 800, height: 420 })
 * // https://res.cloudinary.com/chassis/image/upload/c_fill,g_auto,w_800,h_420,f_auto,q_auto/blog/cover.jpg
 * ```
 */
export function getMediaImageUrl(
  cloudName: string,
  file: string,
  transform: MediaTransform = {}
): string {
  const { format = 'auto', height, quality = 'auto', width } = transform

  assertPositiveInteger('width', width)
  assertPositiveInteger('height', height)

  if (typeof quality === 'number' && (!Number.isInteger(quality) || quality < 1 || quality > 100)) {
    throw new Error(`The quality of a media image must be from 1 to 100, not ${quality}.`)
  }

  // `c_fill` crops to the ratio of both sizes, around the subject (`g_auto`). `c_limit` keeps
  // the ratio and never makes the image larger than it is.
  const parts =
    width && height
      ? ['c_fill', 'g_auto', `w_${width}`, `h_${height}`]
      : width || height
        ? ['c_limit', width ? `w_${width}` : `h_${height}`]
        : []

  parts.push(`f_${format}`, `q_${quality}`)

  return `https://res.cloudinary.com/${cloudName}/image/upload/${parts.join(',')}/${encodeMediaPath(file)}`
}

/** Widths that `getMediaImageWidths()` picks from. */
export const MEDIA_IMAGE_WIDTHS = [320, 480, 640, 800, 1024, 1280, 1600, 1920, 2400]

/**
 * The widths of the copies of an image that is shown at most `width` pixels wide: the widths
 * up to twice `width`, for screens with two device pixels per CSS pixel, and `width` itself.
 */
export function getMediaImageWidths(width: number, widths = MEDIA_IMAGE_WIDTHS): number[] {
  assertPositiveInteger('width', width)

  return [...new Set([...widths.filter((candidate) => candidate <= width * 2), width])].sort(
    (a, b) => a - b
  )
}

/**
 * The `srcset` of an image of the media library: a copy at each of `widths`. With `height`,
 * every copy is cropped to the ratio of `width` and `height`.
 */
export function getMediaImageSrcSet(
  cloudName: string,
  file: string,
  widths: number[],
  transform: MediaTransform = {}
): string {
  const { height, width } = transform

  return widths
    .map((copyWidth) => {
      const copyHeight = width && height ? Math.round((copyWidth * height) / width) : undefined
      const url = getMediaImageUrl(cloudName, file, {
        ...transform,
        width: copyWidth,
        height: copyHeight
      })

      return `${url} ${copyWidth}w`
    })
    .join(', ')
}
