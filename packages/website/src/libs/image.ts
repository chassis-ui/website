import path from 'node:path'
import { promises as fs } from 'node:fs'
import sizeOf from 'image-size'
import { getDocsStaticFsPath, getDocsPublicFsPath } from './path'

export async function getStaticImageSize(imagePath: string) {
  const fullPath = path.join(getDocsPublicFsPath(), 'assets', imagePath)
  const buffer = await fs.readFile(fullPath)
  const size = await sizeOf(buffer)

  if (!size?.height || !size?.width) {
    throw new Error(`Failed to get size of static image at '${imagePath}'.`)
  }

  return { height: size.height, width: size.width }
}
