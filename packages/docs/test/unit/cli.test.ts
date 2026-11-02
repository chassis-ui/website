import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { strToU8, zipSync } from 'fflate'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ASSETS_PATH, CHECKOUT_VARIABLE, syncAssets, vendorAssets } from '../../src/cli/assets.js'
import { defaultIgnores, expandPaths, findHtmlFiles, isIgnored } from '../../src/cli/files.js'
import { defaultConfig, mergeConfig } from '../../src/cli/html-validate.js'
import { main } from '../../src/cli/main.js'
import { CommandError } from '../../src/cli/shared.js'
import { DEFAULT_FILTERS, readFilterFile, vnuArgs } from '../../src/cli/vnu.js'
import { ASSETS_PIN } from '../../src/libs/brand.js'
import { createTempDir } from '../helpers/temp'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

function silence() {
  vi.spyOn(process.stdout, 'write').mockReturnValue(true)
  vi.spyOn(process.stderr, 'write').mockReturnValue(true)
  vi.spyOn(console, 'log').mockReturnValue()
}

// A site's output folder, with the icon files that a site copies from @chassis-ui/icons
function createSite() {
  return createTempDir({
    '_site/index.html': '',
    '_site/about/index.html': '',
    '_site/static/css/chassis.css': '',
    '_site/static/icons/icons/preview.html': '',
    '_site/node_modules/x/index.html': ''
  })
}

describe('isIgnored', () => {
  test('matches the path itself and what is inside it', () => {
    expect(isIgnored('_site/static/icons', ['_site/static/icons'])).toBe(true)
    expect(isIgnored('_site/static/icons/a.html', ['_site/static/icons'])).toBe(true)
  })

  test('does not match a sibling that starts with the same name', () => {
    expect(isIgnored('_site/static/icons-2/a.html', ['_site/static/icons'])).toBe(false)
    expect(isIgnored('_site/static', ['_site/static/icons'])).toBe(false)
  })
})

describe('defaultIgnores', () => {
  test('skips static/icons of each path', () => {
    expect(defaultIgnores(['_site', 'dist'])).toEqual([
      path.join('_site', 'static/icons'),
      path.join('dist', 'static/icons')
    ])
  })
})

describe('findHtmlFiles', () => {
  test('lists HTML files, without ignored folders and node_modules', () => {
    const root = createSite()
    const files = findHtmlFiles([path.join(root, '_site')], [path.join(root, '_site/static/icons')])

    expect(files.map((file) => path.relative(root, file))).toEqual([
      path.join('_site', 'about/index.html'),
      path.join('_site', 'index.html')
    ])
  })

  test('takes files as well as folders', () => {
    const root = createSite()

    expect(findHtmlFiles([path.join(root, '_site/index.html')], [])).toHaveLength(1)
  })

  test('fails when a path does not exist', () => {
    expect(() => findHtmlFiles(['/does/not/exist'], [])).toThrow(CommandError)
  })
})

describe('expandPaths', () => {
  test('keeps a folder that contains nothing ignored', () => {
    const root = createSite()
    const site = path.join(root, '_site')

    expect(expandPaths([site], [])).toEqual([site])
  })

  test('replaces a folder that contains an ignored path by its entries', () => {
    const root = createSite()
    const site = path.join(root, '_site')
    const paths = expandPaths([site], [path.join(site, 'static/icons')])

    expect(paths.map((entry) => path.relative(site, entry))).toEqual([
      'about',
      'index.html',
      'node_modules',
      path.join('static', 'css')
    ])
  })
})

describe('mergeConfig', () => {
  test('appends extends, merges rules and replaces elements', () => {
    const config = mergeConfig(defaultConfig, {
      extends: ['./more.json'],
      rules: { 'require-sri': 'error', 'prefer-button': 'off' },
      elements: ['html5']
    })

    expect(config.extends).toEqual([...defaultConfig.extends, './more.json'])
    expect(config.rules['require-sri']).toBe('error')
    expect(config.rules['prefer-button']).toBe('off')
    expect(config.rules['void-style']).toBe('off')
    expect(config.elements).toEqual(['html5'])
  })

  test('returns the defaults when the site has no config', () => {
    expect(mergeConfig(defaultConfig)).toEqual(defaultConfig)
  })
})

describe('vnu', () => {
  test('joins the filters into one pattern', () => {
    const args = vnuArgs({ jar: 'vnu.jar', paths: ['_site'], filters: ['a.*', 'b'] })

    expect(args).toEqual([
      '-jar',
      'vnu.jar',
      '--skip-non-html',
      '--Werror',
      '--filterpattern',
      'a.*|b',
      '_site'
    ])
  })

  test('gives 32-bit Java a smaller stack', () => {
    expect(vnuArgs({ jar: 'vnu.jar', paths: [], filters: [], is32bit: true })[0]).toBe('-Xss512k')
  })

  test('reads a filter file without blank lines and comments', () => {
    const root = createTempDir({ 'filters.txt': '# Astro\nTrailing slash.*\n\n  Bad value.*  \n' })

    expect(readFilterFile(path.join(root, 'filters.txt'))).toEqual([
      'Trailing slash.*',
      'Bad value.*'
    ])
  })

  test('filters the trailing slash that Astro writes by default', () => {
    expect(DEFAULT_FILTERS).toEqual(['Trailing slash on void elements.*'])
  })
})

// A zip of the given files, and a `fetch` that serves it and the release of the GitHub API.
function fakeRelease(files: Record<string, string>) {
  const zip = Buffer.from(
    zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])))
  )
  const digest = `sha256:${createHash('sha256').update(zip).digest('hex')}`
  const urls: string[] = []
  const fetcher = async (url: string) => {
    urls.push(url)

    return url.startsWith('https://api.github.com')
      ? Response.json({
          tag_name: 'v1.2.0',
          assets: [
            { name: 'website-assets-web-docs-sinefil-1.2.0.zip', digest: 'sha256:b' },
            { name: 'website-assets-web-docs-chassis-1.2.0.zip', digest },
            { name: 'website-assets-ios-demo-chassis-1.2.0.zip', digest: 'sha256:c' },
            { name: 'website-assets-manifest-1.2.0.json', digest: 'sha256:d' }
          ]
        })
      : new Response(zip)
  }

  return { digest, fetcher, urls }
}

function pinOf(digest: string, brand = 'chassis') {
  return JSON.stringify({
    repository: 'chassis-ui/website-assets',
    version: '1.2.0',
    app: 'docs',
    brand,
    archives: {
      'website-assets-web-docs-chassis-1.2.0.zip': digest,
      'website-assets-web-docs-sinefil-1.2.0.zip': 'sha256:b'
    }
  })
}

describe('vendorAssets', () => {
  const output = path.join(ASSETS_PATH, 'dist/web/docs/chassis')

  function setup(digestOverride?: string) {
    silence()
    const release = fakeRelease({ 'fonts/fonts.css': 'a', 'images/logo.svg': 'b' })
    const root = createTempDir({
      '.git/': '',
      [ASSETS_PIN]: pinOf(digestOverride ?? release.digest)
    })

    return { ...release, root, cacheDir: createTempDir() }
  }

  test('unpacks the pinned archive, and leaves no file of its own in the folder', async () => {
    const { root, cacheDir, fetcher, urls } = setup()

    await vendorAssets({ root, cacheDir, fetcher: fetcher as typeof fetch })

    expect(urls).toEqual([
      'https://github.com/chassis-ui/website-assets/releases/download/v1.2.0/website-assets-web-docs-chassis-1.2.0.zip'
    ])
    expect(fs.readFileSync(path.join(root, output, 'fonts/fonts.css'), 'utf8')).toBe('a')
    expect(fs.readdirSync(path.join(root, output)).toSorted()).toEqual(['fonts', 'images'])
  })

  test('does nothing when the folder holds that archive, and keeps a download in the cache', async () => {
    const { root, cacheDir, fetcher, urls } = setup()
    const options = { root, cacheDir, fetcher: fetcher as typeof fetch }

    await vendorAssets(options)
    fs.writeFileSync(path.join(root, output, 'fonts/fonts.css'), 'kept')
    await vendorAssets(options)

    expect(urls).toHaveLength(1)
    expect(fs.readFileSync(path.join(root, output, 'fonts/fonts.css'), 'utf8')).toBe('kept')

    fs.rmSync(path.join(root, ASSETS_PATH), { recursive: true })
    await vendorAssets(options)

    expect(urls).toHaveLength(1)
    expect(fs.readFileSync(path.join(root, output, 'fonts/fonts.css'), 'utf8')).toBe('a')
  })

  test('replaces what is in the folder, such as an older checkout', async () => {
    const { root, cacheDir, fetcher } = setup()

    fs.mkdirSync(path.join(root, output), { recursive: true })
    fs.writeFileSync(path.join(root, output, 'stale.txt'), '')

    await vendorAssets({ root, cacheDir, fetcher: fetcher as typeof fetch })

    expect(fs.existsSync(path.join(root, output, 'stale.txt'))).toBe(false)
  })

  test('fails on a wrong digest, and writes nothing', async () => {
    const { root, cacheDir, fetcher } = setup('sha256:wrong')

    await expect(
      vendorAssets({ root, cacheDir, fetcher: fetcher as typeof fetch })
    ).rejects.toThrow(/the SHA-256 is/)
    expect(fs.existsSync(path.join(root, output))).toBe(false)
    expect(fs.readdirSync(cacheDir)).toEqual([])
  })

  test('replaces a file of the cache that does not match the pin', async () => {
    const { root, cacheDir, fetcher, digest } = setup()
    const cached = path.join(
      cacheDir,
      'assets/chassis-ui-website-assets/website-assets-web-docs-chassis-1.2.0.zip'
    )

    fs.mkdirSync(path.dirname(cached), { recursive: true })
    fs.writeFileSync(cached, 'damaged')

    await vendorAssets({ root, cacheDir, fetcher: fetcher as typeof fetch })

    expect(`sha256:${createHash('sha256').update(fs.readFileSync(cached)).digest('hex')}`).toBe(
      digest
    )
  })

  test('fails on an unknown brand or app and names what the pin has', async () => {
    const { root, cacheDir, fetcher, urls } = setup()

    vi.stubEnv('CHASSIS_BRAND', 'acme')

    await expect(
      vendorAssets({ root, cacheDir, fetcher: fetcher as typeof fetch })
    ).rejects.toThrow(/brand 'acme' at 1.2.0. It has: docs-chassis, docs-sinefil/)
    expect(urls).toEqual([])
  })

  test('fails without a pin, and on a brand that is no name', async () => {
    silence()
    const root = createTempDir({ '.git/': '' })

    await expect(vendorAssets({ root })).rejects.toThrow(/assets.json is missing/)

    vi.stubEnv('CHASSIS_BRAND', '../up')

    await expect(vendorAssets({ root })).rejects.toThrow(CommandError)
  })

  test('copies the build of a local checkout, and returns to the release without it', async () => {
    const { root, cacheDir, fetcher } = setup()
    const options = { root, cacheDir, fetcher: fetcher as typeof fetch }
    const checkout = createTempDir({ 'dist/web/docs/chassis/fonts/fonts.css': 'local' })

    await vendorAssets(options)

    vi.stubEnv(CHECKOUT_VARIABLE, checkout)
    await vendorAssets(options)

    expect(fs.readFileSync(path.join(root, output, 'fonts/fonts.css'), 'utf8')).toBe('local')

    vi.unstubAllEnvs()
    await vendorAssets(options)

    expect(fs.readFileSync(path.join(root, output, 'fonts/fonts.css'), 'utf8')).toBe('a')
  })
})

describe('syncAssets', () => {
  test('writes the digest of every web archive, keeps the brand, and unpacks', async () => {
    silence()
    const { digest, fetcher, urls } = fakeRelease({ 'fonts/fonts.css': 'a' })
    const root = createTempDir({
      '.git/': '',
      [ASSETS_PIN]: JSON.stringify({ version: '1.0.0', brand: 'chassis', app: 'docs' })
    })

    await syncAssets({ root, cacheDir: createTempDir(), fetcher: fetcher as typeof fetch })

    expect(urls[0]).toBe('https://api.github.com/repos/chassis-ui/website-assets/releases/latest')
    expect(JSON.parse(fs.readFileSync(path.join(root, ASSETS_PIN), 'utf8'))).toEqual({
      repository: 'chassis-ui/website-assets',
      version: '1.2.0',
      app: 'docs',
      brand: 'chassis',
      archives: {
        'website-assets-web-docs-chassis-1.2.0.zip': digest,
        'website-assets-web-docs-sinefil-1.2.0.zip': 'sha256:b'
      }
    })
    expect(fs.existsSync(path.join(root, ASSETS_PATH, 'dist/web/docs/chassis/fonts'))).toBe(true)
  })

  test('takes a version and a repository, and writes the pin when there is none', async () => {
    silence()
    const { fetcher, urls } = fakeRelease({})
    const root = createTempDir({ '.git/': '' })

    await syncAssets({
      root,
      version: '1.2.0',
      repository: 'chassis-ui/website-assets',
      cacheDir: createTempDir(),
      fetcher: fetcher as typeof fetch
    })

    expect(urls[0]).toBe(
      'https://api.github.com/repos/chassis-ui/website-assets/releases/tags/v1.2.0'
    )
    expect(fs.existsSync(path.join(root, ASSETS_PIN))).toBe(true)
  })

  test('fails on a request that fails', async () => {
    silence()
    const root = createTempDir({ '.git/': '' })
    const fetcher = async () => new Response('', { status: 403 })

    await expect(syncAssets({ root, fetcher: fetcher as typeof fetch })).rejects.toThrow(/HTTP 403/)
  })
})

describe('main', () => {
  test('prints the usage', async () => {
    silence()

    expect(await main([])).toBe(0)
    expect(await main(['help'])).toBe(0)
    expect(await main(['vnu', '--help'])).toBe(0)
  })

  test('fails on an unknown command or option', async () => {
    silence()

    expect(await main(['build'])).toBe(1)
    expect(await main(['toString'])).toBe(1)
    expect(await main(['vnu', '--bogus'])).toBe(1)
    expect(await main(['vendor', 'extra'])).toBe(1)
    expect(await main(['vendor', '--subset'])).toBe(1)
    expect(await main(['sync-submodules'])).toBe(1)
    expect(await main(['sync-assets', '--version'])).toBe(1)
  })

  test('fails when the output folder does not exist', async () => {
    silence()

    expect(await main(['html-validate', '/does/not/exist'])).toBe(1)
  })

  const goodPage =
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>Page</title>\n</head>\n<body>\n<main>\n<h1>Page</h1>\n</main>\n</body>\n</html>\n'
  const badPage =
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>Bad</title>\n</head>\n<body>\n<main>\n<h1>Bad</h1>\n<p><div></div></p>\n</main>\n</body>\n</html>\n'

  test('validates a built page with html-validate', async () => {
    silence()
    const root = createTempDir({ '_site/index.html': goodPage, '_site/bad.html': badPage })
    const site = path.join(root, '_site')

    expect(await main(['html-validate', site, '--ignore', path.join(site, 'bad.html')])).toBe(0)
    expect(await main(['html-validate', site])).toBe(1)
  })

  test('skips static/icons as well as the paths of --ignore', async () => {
    silence()
    const root = createTempDir({
      '_site/index.html': goodPage,
      '_site/bad.html': badPage,
      '_site/static/icons/preview.html': badPage
    })
    const site = path.join(root, '_site')
    const ignoreBad = ['--ignore', path.join(site, 'bad.html')]

    expect(await main(['html-validate', site, ...ignoreBad])).toBe(0)
    expect(await main(['html-validate', site, ...ignoreBad, '--no-default-ignore'])).toBe(1)
  })
})
