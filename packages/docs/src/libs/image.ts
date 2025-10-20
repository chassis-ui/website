import { promises as fs } from 'node:fs'
import sizeOf from 'image-size'

export async function getStaticImageSize(imagePath: string) {
  const buffer = await fs.readFile(imagePath)
  const size = await sizeOf(new Uint8Array(buffer))

  if (!size?.height || !size?.width) {
    throw new Error(`Failed to get size of static image at '${imagePath}'.`)
  }

  return { height: size.height, width: size.width }
}
