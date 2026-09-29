import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ASSETS_OUTPUT, ASSETS_PATH, buildAssets, syncAssets } from '../../src/cli/assets.js'
import { defaultIgnores, expandPaths, findHtmlFiles, isIgnored } from '../../src/cli/files.js'
import { defaultConfig, mergeConfig } from '../../src/cli/html-validate.js'
import { main } from '../../src/cli/main.js'
import { CommandError } from '../../src/cli/shared.js'
import { DEFAULT_FILTERS, readFilterFile, vnuArgs } from '../../src/cli/vnu.js'
import { createTempDir } from '../helpers/temp'

afterEach(() => {
  vi.restoreAllMocks()
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

// Records the commands, and answers the queries of `git` like a checkout would.
function fakeRun(root: string, answers: Record<string, string | Error> = {}) {
  const calls: string[] = []
  const run = (command: string, args: string[], options: { cwd?: string } = {}) => {
    const line = [command, ...args].join(' ')
    const where = path.relative(root, options.cwd ?? root) || '.'

    calls.push(`${where}: ${line}`)

    if (line === 'pnpm assets:site') {
      fs.mkdirSync(path.join(root, ASSETS_PATH, ASSETS_OUTPUT), { recursive: true })
    }

    const answer = answers[line]

    if (answer instanceof Error) throw answer
    return answer ?? ''
  }

  return { calls, run }
}

const build = [
  `${ASSETS_PATH}: git lfs install --local`,
  `${ASSETS_PATH}: git lfs pull`,
  `${ASSETS_PATH}: pnpm install --ignore-workspace`,
  `${ASSETS_PATH}: pnpm assets:site`
]

describe('buildAssets', () => {
  test('checks out the pinned commit and builds it', () => {
    silence()
    const root = createTempDir({ [`${ASSETS_PATH}/`]: '' })
    const { calls, run } = fakeRun(root)

    buildAssets({ root, run })

    expect(calls).toEqual([`.: git submodule update --init ${ASSETS_PATH}`, ...build])
  })

  test('fails when the build writes nothing', () => {
    silence()
    const root = createTempDir({ [`${ASSETS_PATH}/`]: '' })
    const run = () => ''

    expect(() => buildAssets({ root, run })).toThrow(/wrote nothing/)
  })
})

describe('syncAssets', () => {
  test('pulls the branch that is checked out', () => {
    silence()
    const root = createTempDir({ [`${ASSETS_PATH}/.git`]: '' })
    const { calls, run } = fakeRun(root, { 'git rev-parse --abbrev-ref HEAD': 'app/docs\n' })

    syncAssets({ root, run })

    expect(calls.slice(0, 2)).toEqual([
      `${ASSETS_PATH}: git rev-parse --abbrev-ref HEAD`,
      `${ASSETS_PATH}: git pull --ff-only origin app/docs`
    ])
    expect(calls.slice(2, 6)).toEqual(build)
  })

  test('creates the branch from the fetch when a fresh checkout has none', () => {
    silence()
    const root = createTempDir({ [`${ASSETS_PATH}/.git`]: '' })
    const { calls, run } = fakeRun(root, {
      'git rev-parse --abbrev-ref HEAD': 'HEAD\n',
      'git rev-parse --verify --quiet refs/heads/main': new Error('no branch')
    })

    syncAssets({ root, branch: 'main', run })

    expect(calls).toContain(`${ASSETS_PATH}: git fetch origin main`)
    expect(calls).toContain(`${ASSETS_PATH}: git checkout -b main FETCH_HEAD`)
  })

  test('checks out the local branch when there is one', () => {
    silence()
    const root = createTempDir({ [`${ASSETS_PATH}/.git`]: '' })
    const { calls, run } = fakeRun(root, { 'git rev-parse --abbrev-ref HEAD': 'HEAD\n' })

    syncAssets({ root, run })

    expect(calls).toContain(`${ASSETS_PATH}: git checkout app/docs`)
  })

  test('initialises the submodule first when it is missing', () => {
    silence()
    const root = createTempDir()
    const { calls, run } = fakeRun(root, { 'git rev-parse --abbrev-ref HEAD': 'app/docs\n' })

    syncAssets({ root, run })

    expect(calls[0]).toBe(`.: git submodule update --init ${ASSETS_PATH}`)
  })

  test('stops when the submodule has uncommitted changes', () => {
    silence()
    const root = createTempDir({ [`${ASSETS_PATH}/.git`]: '' })
    const { calls, run } = fakeRun(root, {
      'git rev-parse --abbrev-ref HEAD': 'HEAD\n',
      'git status --porcelain': ' M package.json\n'
    })

    expect(() => syncAssets({ root, run })).toThrow(/uncommitted changes/)
    expect(calls).not.toContain(`${ASSETS_PATH}: git fetch origin app/docs`)
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
