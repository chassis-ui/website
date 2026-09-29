import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { VFile } from 'vfile'
import { describe, expect, test } from 'vitest'
import {
  remarkCxConfig,
  remarkCxDocsref,
  replaceConfigInText,
  replaceDocsrefInText
} from '../../src/libs/remark'

const config = {
  repo: 'https://github.com/chassis-ui/css',
  currentVersion: '0.5.2',
  cdn: { css: 'https://cdn.test/chassis.css' },
  anchors: { min: 2 }
}

describe('replaceConfigInText', () => {
  test('replaces top-level and nested keys', () => {
    expect(replaceConfigInText('[[config:repo]] at [[config:cdn.css]]', config)).toBe(
      'https://github.com/chassis-ui/css at https://cdn.test/chassis.css'
    )
  })

  test('fails for a key that does not exist, and names it', () => {
    expect(() => replaceConfigInText('[[config:nope.missing]]', config)).toThrow("'nope.missing'")
  })

  test('fails for a value that is not a string', () => {
    expect(() => replaceConfigInText('[[config:anchors.min]]', config)).toThrow("'anchors.min'")
  })
})

describe('replaceDocsrefInText', () => {
  test('replaces each link with the path of the docs page', () => {
    expect(
      replaceDocsrefInText('[[docsref:/components/button]] and [[docsref:/layout#grid]]', {
        docsPath: '/css/docs'
      })
    ).toBe('/css/docs/components/button and /css/docs/layout#grid')
  })

  test('reports each linked path', () => {
    const linked: string[] = []
    replaceDocsrefInText('[[docsref:/a]] [[docsref:/b/c#d]]', {
      docsPath: '/docs',
      onDocsPath: (docsPath) => linked.push(docsPath)
    })

    expect(linked).toEqual(['/a', '/b/c#d'])
  })
})

function processMdx(source: string, plugin: unknown, options: unknown, frontmatter?: object) {
  const file = new VFile({ value: source, data: frontmatter ? { astro: { frontmatter } } : {} })
  const processor = remark()
    .use(remarkMdx)
    .use(plugin as never, options as never)
  const result = processor.processSync(file)

  return { output: String(result), frontmatter }
}

describe('remarkCxConfig', () => {
  test('replaces keys in text, code, links, images and JSX attributes', () => {
    const { output } = processMdx(
      [
        'Version [[config:currentVersion]], `v[[config:currentVersion]]`.',
        '',
        '[Repository]([[config:repo]]) ![Logo [[config:currentVersion]]]([[config:cdn.css]])',
        '',
        '<Example code="[[config:repo]]" />',
        '',
        '```sh',
        'npm i chassis@[[config:currentVersion]]',
        '```'
      ].join('\n'),
      remarkCxConfig,
      { config }
    )

    expect(output).not.toContain('[[config:')
    expect(output).toContain('Version 0.5.2, `v0.5.2`.')
    expect(output).toContain('[Repository](https://github.com/chassis-ui/css)')
    expect(output).toContain('![Logo 0.5.2](https://cdn.test/chassis.css)')
    expect(output).toContain('<Example code="https://github.com/chassis-ui/css" />')
    expect(output).toContain('npm i chassis@0.5.2')
  })

  test('replaces keys in the frontmatter, including arrays of strings and objects', () => {
    const { frontmatter } = processMdx(
      'Text',
      remarkCxConfig,
      { config },
      {
        title: 'Chassis [[config:currentVersion]]',
        aliases: ['/v[[config:currentVersion]]/'],
        extraJs: [{ src: '[[config:cdn.css]]' }]
      }
    )

    expect(frontmatter).toEqual({
      title: 'Chassis 0.5.2',
      aliases: ['/v0.5.2/'],
      extraJs: [{ src: 'https://cdn.test/chassis.css' }]
    })
  })
})

describe('remarkCxDocsref', () => {
  test('replaces links in text, links and JSX attributes', () => {
    const linked: string[] = []
    const { output } = processMdx(
      [
        'See [buttons]([[docsref:/components/button]]).',
        '',
        '<Callout>Read [[docsref:/about]] and <a href="[[docsref:/layout]]">layout</a>.</Callout>'
      ].join('\n'),
      remarkCxDocsref,
      { docsPath: '/css/docs', onDocsPath: (docsPath: string) => linked.push(docsPath) }
    )

    expect(output).toContain('[buttons](/css/docs/components/button)')
    expect(output).toContain('Read /css/docs/about')
    expect(output).toContain('<a href="/css/docs/layout">')
    expect(linked).toEqual(['/components/button', '/about', '/layout'])
  })

  test('replaces links in the frontmatter', () => {
    const { frontmatter } = processMdx(
      'Text',
      remarkCxDocsref,
      { docsPath: '/docs' },
      {
        aliases: '[[docsref:/old]]'
      }
    )

    expect(frontmatter).toEqual({ aliases: '/docs/old' })
  })
})
