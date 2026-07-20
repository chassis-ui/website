import { promises as fs } from 'node:fs'
import sizeOf from 'image-size'

/**
 * Reads an image file from disk and returns its pixel dimensions.
 *
 * Intended for build-time use only (e.g. generating `<meta og:image:width/height>`
 * tags). Do not call at runtime in a server or edge context where filesystem
 * access is unavailable.
 *
 * @param imagePath - Absolute path to the image file.
 * @returns An object with `width` and `height` in pixels.
 * @throws If the file cannot be read or its dimensions cannot be determined.
 */
export async function getStaticImageSize(imagePath: string) {
  const buffer = await fs.readFile(imagePath)
  const size = sizeOf(new Uint8Array(buffer))

  if (!size?.height || !size?.width) {
    throw new Error(`Failed to get size of static image at '${imagePath}'.`)
  }

  return { height: size.height, width: size.width }
}

/**
 * Fetches a remote image and returns its pixel dimensions.
 *
 * Intended for build-time use only (e.g. generating `<meta og:image:width/height>`
 * tags) for images hosted outside the project, such as on a CDN.
 *
 * @param imageUrl - Absolute URL of the image.
 * @returns An object with `width` and `height` in pixels.
 * @throws If the image cannot be fetched or its dimensions cannot be determined.
 */
export async function getRemoteImageSize(imageUrl: string) {
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch remote image at '${imageUrl}' (status ${response.status}).`)
  }

  const buffer = await response.arrayBuffer()
  const size = sizeOf(new Uint8Array(buffer))

  if (!size?.height || !size?.width) {
    throw new Error(`Failed to get size of remote image at '${imageUrl}'.`)
  }

  return { height: size.height, width: size.width }
}
