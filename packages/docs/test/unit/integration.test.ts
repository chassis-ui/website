import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { chassisDocs, type ChassisDocsOptions } from '../../src/integration'
import { remarkCxDocsref } from '../../src/libs/remark'
import { createTempDir } from '../helpers/temp'

const configYaml = `
title: 'Site'
subtitle: 'Subtitle'
description: 'Description'
authors: 'Authors'
baseURL: 'https://example.com/site'
docsPath: '/site/docs'
repo: 'https://github.com/chassis-ui/site'
currentVersion: '1.0.0'
`

interface Update {
  site?: string
  markdown?: { processor: { options: { remarkPlugins: unknown[] } } }
  vite?: {
    optimizeDeps: { exclude: string[]; include: string[] }
    resolve: { dedupe: string[] }
    css?: { preprocessorOptions: { scss: { loadPaths: string[] } } }
    plugins: { resolveId: (_id: string) => unknown; load: (_id: string) => unknown }[]
  }
}

// Runs the setup hook of the integration in a site with the given files, and returns what it
// asked Astro to change.
async function setUp(
  files: Record<string, string>,
  options: ChassisDocsOptions = {},
  { command = 'build', site }: { command?: string; site?: string } = {}
) {
  const root = createTempDir({ 'config.yml': configYaml, ...files })
  const integration = chassisDocs(options)
  const updates: Update[] = []
  const watched: string[] = []
  const injected: Record<string, string> = {}
  const hooks = integration.hooks as Record<string, (_params: unknown) => unknown>

  await hooks['astro:config:setup']({
    config: {
      root: pathToFileURL(`${root}/`),
      publicDir: pathToFileURL(`${root}/public/`),
      site
    },
    command,
    updateConfig: (update: Update) => updates.push(update),
    addWatchFile: (file: string) => watched.push(file)
  })
  await hooks['astro:config:done']({
    injectTypes: ({ filename, content }: { filename: string; content: string }) => {
      injected[filename] = content
    }
  })

  const [update] = updates

  async function loadVirtual(name: string) {
    const plugin = update.vite!.plugins[0]
    const id = plugin.resolveId(`virtual:chassis-docs/${name}`) as string

    return plugin.load(id) as string
  }

  return { root, integration, hooks, update, watched, injected, loadVirtual }
}

beforeEach(() => {
  for (const name of ['SITE_URL', 'NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL']) {
    vi.stubEnv(name, undefined)
  }
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('chassisDocs: config', () => {
  test('provides the parsed config with its defaults', async () => {
    const { loadVirtual } = await setUp({})

    expect(await loadVirtual('config')).toContain('"siteBranch":"main"')
  })

  test('provides the static path to the scripts', async () => {
    const { loadVirtual } = await setUp({})

    expect(await loadVirtual('static')).toBe('export const staticPath = "/static"')
  })

  test('watches the config file', async () => {
    const { root, watched } = await setUp({})

    expect(watched).toContain(path.join(root, 'config.yml'))
  })

  test('uses a config that the site passes', async () => {
    const { loadVirtual } = await setUp(
      {},
      {
        config: {
          title: 'Passed',
          subtitle: '',
          description: '',
          authors: '',
          baseURL: 'https://example.com',
          docsPath: '/docs',
          repo: 'https://github.com/a/b',
          currentVersion: '1.0.0',
          analytics: {},
          anchors: { min: 2, max: 3 },
          toc: { min: 2, max: 3 },
          siteBranch: 'main',
          sourceDir: '.',
          staticPath: '/static'
        }
      }
    )

    expect(await loadVirtual('config')).toContain('"title":"Passed"')
  })

  test('fails for an invalid config', async () => {
    await expect(setUp({ 'config.yml': `${configYaml}colour: red\n` })).rejects.toThrow('colour')
  })
})

describe('chassisDocs: site', () => {
  test('sets site from baseURL', async () => {
    const { update } = await setUp({})

    expect(update.site).toBe('https://example.com/site')
  })

  test('keeps a site that the Astro config sets', async () => {
    const { update } = await setUp({}, {}, { site: 'https://other.test' })

    expect(update).not.toHaveProperty('site')
  })
})

describe('chassisDocs: sidebar', () => {
  test('reads data/sidebar.yml when it exists', async () => {
    const { loadVirtual } = await setUp({ 'data/sidebar.yml': '- title: Start\n' })

    expect(await loadVirtual('sidebar')).toBe('export default [{"title":"Start"}]')
  })

  test('provides an empty sidebar when the default file does not exist', async () => {
    const { loadVirtual } = await setUp({})

    expect(await loadVirtual('sidebar')).toBe('export default []')
  })

  test('fails when a sidebar file that the site names does not exist', async () => {
    await expect(setUp({}, { sidebarFile: 'nav.yml' })).rejects.toThrow('nav.yml')
  })

  test('does not read a sidebar when sidebarFile is false', async () => {
    const { loadVirtual } = await setUp(
      { 'data/sidebar.yml': 'not: [valid' },
      { sidebarFile: false }
    )

    expect(await loadVirtual('sidebar')).toBe('export default []')
  })
})

describe('chassisDocs: styles and paths', () => {
  test("imports the site's src/scss/docs.scss when it exists", async () => {
    const { root, loadVirtual } = await setUp({ 'src/scss/docs.scss': '' })

    expect(await loadVirtual('styles')).toBe(
      `import ${JSON.stringify(path.join(root, 'src/scss/docs.scss'))}`
    )
  })

  test("imports the package's styles otherwise", async () => {
    const { loadVirtual } = await setUp({})

    expect(await loadVirtual('styles')).toBe('import "@chassis-ui/docs/scss/main.scss"')
  })

  test('imports the styles that the site names, and none for an empty list', async () => {
    expect(await (await setUp({}, { styles: [] })).loadVirtual('styles')).toBe('')
  })

  test('provides the paths of the site, with sourceDir resolved from the root', async () => {
    const { root, loadVirtual } = await setUp({
      'config.yml': `${configYaml}sourceDir: '../css'\n`
    })
    const paths = await loadVirtual('paths')

    expect(paths).toContain(`export const root = ${JSON.stringify(root)}`)
    expect(paths).toContain(
      `export const sourceDir = ${JSON.stringify(path.resolve(root, '../css'))}`
    )
  })

  test('resolves no other virtual module', async () => {
    const { update } = await setUp({})

    expect(update.vite!.plugins[0].resolveId('virtual:chassis-docs/nope')).toBeUndefined()
  })
})

describe('chassisDocs: one copy of @chassis-ui/css', () => {
  test('serves both packages from source in the dev server', async () => {
    const { update } = await setUp({})

    expect(update.vite!.optimizeDeps.exclude).toEqual(['@chassis-ui/docs', '@chassis-ui/css'])
  })

  test('pre-bundles the CommonJS dependency of the scripts of the package', async () => {
    const { update } = await setUp({})

    expect(update.vite!.optimizeDeps.include).toEqual(['@chassis-ui/docs > clipboard'])
  })

  test("resolves every import of @chassis-ui/css to the site's copy", async () => {
    const { update } = await setUp({})

    expect(update.vite!.resolve.dedupe).toEqual(['@chassis-ui/css'])
  })
})

describe('chassisDocs: Sass load path', () => {
  test('adds the folder of the default chassis-tokens of @chassis-ui/css', async () => {
    const { root, update } = await setUp({ 'node_modules/@chassis-ui/css/package.json': '{}' })

    expect(update.vite!.css!.preprocessorOptions.scss.loadPaths).toEqual([
      path.join(root, 'node_modules/@chassis-ui/css/scss/vendor')
    ])
  })

  test('adds nothing when @chassis-ui/css is not installed', async () => {
    const { update } = await setUp({})

    expect(update.vite).not.toHaveProperty('css')
  })
})

describe('chassisDocs: types', () => {
  test('declares the virtual modules and the shortcodes', async () => {
    const { injected } = await setUp({})

    expect(injected['virtual.d.ts']).toContain("declare module 'virtual:chassis-docs/config'")
    expect(injected['auto-import.d.ts']).toContain('export const Code:')
  })
})

describe('chassisDocs: broken docs links', () => {
  function docsrefOptions(update: Update) {
    const entry = update.markdown!.processor.options.remarkPlugins.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === remarkCxDocsref
    ) as [unknown, { onDocsPath?: (_docsPath: string) => void }]

    return entry[1]
  }

  // Builds `dir` with one page, reports two linked paths, and runs the build hook.
  async function build(options: ChassisDocsOptions = {}) {
    const { update, hooks } = await setUp({}, options)
    const dir = createTempDir({ 'site/docs/present/index.html': '', 'site/docs/file.css': '' })
    const logger = { warn: vi.fn() }
    const { onDocsPath } = docsrefOptions(update)

    onDocsPath!('/present/#part')
    onDocsPath!('/file.css')
    onDocsPath!('/missing')

    const run = () => hooks['astro:build:done']({ dir: pathToFileURL(`${dir}/`), logger })

    return { run, logger }
  }

  test('fails the build by default, and names the broken link only', async () => {
    const { run } = await build()

    expect(run).toThrow(/- \/missing$/)
  })

  test('only warns with brokenDocsrefs: warn', async () => {
    const { run, logger } = await build({ brokenDocsrefs: 'warn' })

    expect(run).not.toThrow()
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('/missing'))
  })

  test('does nothing with brokenDocsrefs: ignore', async () => {
    const { run, logger } = await build({ brokenDocsrefs: 'ignore' })

    expect(run).not.toThrow()
    expect(logger.warn).not.toHaveBeenCalled()
  })

  test('does not collect links in the dev server', async () => {
    const { update } = await setUp({}, {}, { command: 'dev' })

    expect(docsrefOptions(update).onDocsPath).toBeUndefined()
  })
})

describe('chassisDocs: markdown', () => {
  test('runs the plugins of the site after its own', async () => {
    const sitePlugin = () => () => {}
    const { update } = await setUp({}, { markdown: { remarkPlugins: [sitePlugin] } })
    const plugins = update.markdown!.processor.options.remarkPlugins

    expect(plugins.at(-1)).toBe(sitePlugin)
    expect(plugins).toHaveLength(4)
  })
})
