import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { getRemoteImageSize, getStaticImageSize } from '../../src/libs/image'

// The signature and the IHDR chunk of a PNG are enough for its size.
function png(width: number, height: number): Buffer {
  const header = Buffer.alloc(33)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(header, 0)
  header.writeUInt32BE(13, 8)
  header.write('IHDR', 12, 'ascii')
  header.writeUInt32BE(width, 16)
  header.writeUInt32BE(height, 20)
  header.writeUInt8(8, 24)
  header.writeUInt8(6, 25)
  return header
}

let directory: string

beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chassis-docs-image-'))
  fs.writeFileSync(path.join(directory, 'social.png'), png(1200, 630))
  fs.writeFileSync(path.join(directory, 'broken.png'), 'not an image')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getStaticImageSize', () => {
  test('reads the size of an image on disk', async () => {
    expect(await getStaticImageSize(path.join(directory, 'social.png'))).toEqual({
      width: 1200,
      height: 630
    })
  })

  test('fails for a file that is not an image', async () => {
    await expect(getStaticImageSize(path.join(directory, 'broken.png'))).rejects.toThrow()
  })

  test('fails for a file that does not exist', async () => {
    await expect(getStaticImageSize(path.join(directory, 'missing.png'))).rejects.toThrow()
  })
})

describe('getRemoteImageSize', () => {
  test('reads the size of a fetched image', async () => {
    vi.stubGlobal('fetch', async () => new Response(new Uint8Array(png(800, 400))))

    expect(await getRemoteImageSize('https://cdn.test/image.png')).toEqual({
      width: 800,
      height: 400
    })
  })

  test('fails with the status when the fetch fails', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }))

    await expect(getRemoteImageSize('https://cdn.test/missing.png')).rejects.toThrow('status 404')
  })
})
