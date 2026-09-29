import type { Root } from 'mdast'
import type { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { joinDocsPath } from './docs-path'

// [[config:foo]]
// [[config:foo.bar]]
const configRegExp = /\[\[config:(?<name>[\w.]+)\]\]/g
// [[docsref:/foo]]
// [[docsref:/foo/bar#baz]]
const docsrefRegExp = /\[\[docsref:(?<path>[\w./#-]+)\]\]/g

type Replacer = (_text: string) => string
type MdxAttributes = (MdxJsxAttribute | MdxJsxExpressionAttribute)[]

export interface RemarkCxConfigOptions {
  /** The parsed `config.yml`. */
  config: object
}

export interface RemarkCxDocsrefOptions {
  /** The `docsPath` of the site's `config.yml`. */
  docsPath: string
  /** Called with each docs path that a page links to. */
  onDocsPath?: (_path: string) => void
}

/** Replaces each `[[config:key]]` in `text` with the value of that key. */
export function replaceConfigInText(text: string, config: object): string {
  return text.replace(configRegExp, (_match, keyPath: string) => {
    const value = keyPath.split('.').reduce<unknown>((values, part) => {
      return values && typeof values === 'object'
        ? (values as Record<string, unknown>)[part]
        : undefined
    }, config)

    if (typeof value !== 'string' || !value) {
      throw new Error(`Failed to find a valid configuration value for '${keyPath}'.`)
    }

    return value
  })
}

/** Replaces each `[[docsref:/path]]` in `text` with the URL path of that docs page. */
export function replaceDocsrefInText(text: string, options: RemarkCxDocsrefOptions): string {
  return text.replace(docsrefRegExp, (_match, inputPath: string) => {
    options.onDocsPath?.(inputPath)

    return joinDocsPath(options.docsPath, inputPath)
  })
}

function replaceInAttributes(attributes: MdxAttributes, replacer: Replacer) {
  return attributes.map((attribute) => {
    if (attribute.type === 'mdxJsxAttribute' && typeof attribute.value === 'string') {
      attribute.value = replacer(attribute.value)
    }

    return attribute
  })
}

function replaceInFrontmatter(record: Record<string, unknown>, replacer: Replacer) {
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string') {
      record[key] = replacer(value)
    } else if (Array.isArray(value)) {
      record[key] = value.map((arrayValue) => {
        return typeof arrayValue === 'string'
          ? replacer(arrayValue)
          : typeof arrayValue === 'object'
            ? replaceInFrontmatter(arrayValue, replacer)
            : arrayValue
      })
    }
  }

  return record
}

function containsFrontmatter(data: unknown): data is { frontmatter: Record<string, unknown> } {
  return data != undefined && typeof data === 'object' && 'frontmatter' in data
}

/**
 * A remark plugin that replaces config values in Markdown and MDX files. `[[config:foo]]`
 * becomes the value of the `foo` key of `config.yml`, and `[[config:foo.bar]]` reads a nested
 * key. It also works in frontmatter.
 */
export const remarkCxConfig: Plugin<[RemarkCxConfigOptions], Root> = function ({ config }) {
  const replacer: Replacer = (text) => replaceConfigInText(text, config)

  return function remarkCxConfigPlugin(ast, file) {
    if (containsFrontmatter(file.data.astro)) {
      replaceInFrontmatter(file.data.astro.frontmatter, replacer)
    }

    // https://github.com/syntax-tree/mdast#nodes
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#nodes
    visit(
      ast,
      ['code', 'definition', 'image', 'inlineCode', 'link', 'mdxJsxFlowElement', 'text'],
      (node) => {
        switch (node.type) {
          case 'code':
          case 'inlineCode':
          case 'text': {
            node.value = replacer(node.value)
            break
          }
          case 'image': {
            if (node.alt) {
              node.alt = replacer(node.alt)
            }

            node.url = replacer(node.url)
            break
          }
          case 'definition':
          case 'link': {
            node.url = replacer(node.url)
            break
          }
          case 'mdxJsxFlowElement': {
            node.attributes = replaceInAttributes(node.attributes, replacer)
            break
          }
        }
      }
    )
  }
}

/**
 * A remark plugin that turns `[[docsref:/foo]]` into a link to the docs page `/foo`, under
 * the `docsPath` of `config.yml`. It also works in frontmatter.
 */
export const remarkCxDocsref: Plugin<[RemarkCxDocsrefOptions], Root> = function (options) {
  const replacer: Replacer = (text) => replaceDocsrefInText(text, options)

  return function remarkCxDocsrefPlugin(ast, file) {
    if (containsFrontmatter(file.data.astro)) {
      replaceInFrontmatter(file.data.astro.frontmatter, replacer)
    }

    // https://github.com/syntax-tree/mdast#nodes
    // https://github.com/syntax-tree/mdast-util-mdx-jsx#nodes
    visit(
      ast,
      [
        'code',
        'definition',
        'image',
        'inlineCode',
        'link',
        'mdxJsxFlowElement',
        'mdxJsxTextElement',
        'text'
      ],
      (node) => {
        switch (node.type) {
          case 'code':
          case 'inlineCode':
          case 'text': {
            node.value = replacer(node.value)
            break
          }
          case 'definition':
          case 'link': {
            node.url = replacer(node.url)
            break
          }
          case 'mdxJsxFlowElement':
          case 'mdxJsxTextElement': {
            node.attributes = replaceInAttributes(node.attributes, replacer)
            break
          }
        }
      }
    )
  }
}
