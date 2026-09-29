import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { chassisAutoImport, createAutoImportPlugin } from '../../src/libs/shortcodes'
import { createTempDir } from '../helpers/temp'

// Stand-ins for the package's shortcodes, so the tests do not depend on the real list.
const packageDir = createTempDir({ 'Code.astro': '', 'Icon.astro': '', 'Callout.astro': '' })

function site(files: Record<string, string> = {}) {
  return createTempDir({ 'src/components/shortcodes/': '', ...files })
}

describe('chassisAutoImport', () => {
  test('imports the package shortcodes by package path, and the site shortcodes by file', () => {
    const root = site({ 'src/components/shortcodes/Gallery.astro': '' })
    const { imports } = chassisAutoImport({ root, packageDir })

    expect(imports).toEqual([
      '@chassis-ui/docs/shortcodes/Callout.astro',
      '@chassis-ui/docs/shortcodes/Code.astro',
      '@chassis-ui/docs/shortcodes/Icon.astro',
      path.join(root, 'src/components/shortcodes/Gallery.astro')
    ])
  })

  test('lets a site shortcode replace the package shortcode of the same name', () => {
    const root = site({ 'src/components/shortcodes/Icon.astro': '' })
    const { imports } = chassisAutoImport({ root, packageDir })

    expect(imports).not.toContain('@chassis-ui/docs/shortcodes/Icon.astro')
    expect(imports).toContain(path.join(root, 'src/components/shortcodes/Icon.astro'))
  })

  test('leaves out excluded shortcodes', () => {
    const { imports } = chassisAutoImport({ root: site(), packageDir, exclude: ['Icon'] })

    expect(imports).toEqual([
      '@chassis-ui/docs/shortcodes/Callout.astro',
      '@chassis-ui/docs/shortcodes/Code.astro'
    ])
  })

  test('imports only included shortcodes of the package', () => {
    const root = site({ 'src/components/shortcodes/Gallery.astro': '' })
    const { imports } = chassisAutoImport({ root, packageDir, include: ['Code'] })

    expect(imports).toEqual([
      '@chassis-ui/docs/shortcodes/Code.astro',
      path.join(root, 'src/components/shortcodes/Gallery.astro')
    ])
  })

  test('reads the site shortcodes from dir', () => {
    const root = createTempDir({ 'components/mdx/Tabs.astro': '' })
    const { imports } = chassisAutoImport({ root, dir: 'components/mdx', packageDir })

    expect(imports).toContain(path.join(root, 'components/mdx/Tabs.astro'))
  })

  test('works for a site without shortcodes of its own', () => {
    expect(chassisAutoImport({ root: createTempDir(), packageDir }).imports).toHaveLength(3)
  })

  test('declares each Astro component as a global', () => {
    const root = site({
      'src/components/shortcodes/Gallery.astro': '',
      'src/components/shortcodes/data.json': ''
    })
    const { typeDefinitions } = chassisAutoImport({ root, packageDir })

    expect(typeDefinitions).toContain(
      "export const Code: typeof import('@chassis-ui/docs/shortcodes/Code.astro').default"
    )
    expect(typeDefinitions).toContain(
      `export const Gallery: typeof import('${path.join(root, 'src/components/shortcodes/Gallery.astro')}').default`
    )
    expect(typeDefinitions).not.toContain('data')
  })

  test('finds the shortcodes of the installed package by default', () => {
    const { imports } = chassisAutoImport({ root: createTempDir() })

    expect(imports).toContain('@chassis-ui/docs/shortcodes/Code.astro')
    expect(imports).toContain('@chassis-ui/docs/shortcodes/Callout.astro')
  })
})

describe('createAutoImportPlugin', () => {
  function run(basename: string) {
    const tree = { type: 'root', children: [{ type: 'paragraph' }] }
    createAutoImportPlugin(['/a/Card.astro', '@scope/pkg/Button-Group.astro'])()(tree, { basename })

    return tree.children
  }

  test('prepends one import per component to an MDX file', () => {
    const [imports] = run('page.mdx') as [
      {
        type: string
        data: {
          estree: {
            body: { specifiers: { local: { name: string } }[]; source: { value: string } }[]
          }
        }
      }
    ]

    expect(imports.type).toBe('mdxjsEsm')
    expect(
      imports.data.estree.body.map((node) => [node.specifiers[0].local.name, node.source.value])
    ).toEqual([
      ['Card', '/a/Card.astro'],
      ['ButtonGroup', '@scope/pkg/Button-Group.astro']
    ])
  })

  test('leaves a Markdown file alone', () => {
    expect(run('page.md')).toEqual([{ type: 'paragraph' }])
  })
})
