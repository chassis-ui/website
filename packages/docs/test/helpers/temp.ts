import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Creates a directory with the given files and returns its path. Keys are paths relative to
 * the directory. A key that ends in `/` creates an empty directory.
 */
export function createTempDir(files: Record<string, string> = {}): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'chassis-docs-')))

  for (const [file, content] of Object.entries(files)) {
    const target = path.join(root, file)

    if (file.endsWith('/')) {
      fs.mkdirSync(target, { recursive: true })
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, content)
    }
  }

  return root
}
