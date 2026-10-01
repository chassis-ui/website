import { describe, expect, test } from 'vitest'
import { loadConfig, loadData, loadSidebar } from '../../src/libs/config'
import { configSchema, z } from '../../src/libs/schema'
import { createTempDir } from '../helpers/temp'

const minimal = `
title: 'Site'
subtitle: 'Subtitle'
description: 'Description'
authors: 'Authors'
baseURL: 'https://example.com/site'
docsPath: '/site/docs'
repo: 'https://github.com/chassis-ui/site'
currentVersion: '1.0.0'
`

function load(yaml: string, schema?: z.ZodType) {
  return loadConfig({ root: createTempDir({ 'config.yml': yaml }), schema })
}

describe('loadConfig', () => {
  test('fills in the defaults', () => {
    expect(load(minimal)).toMatchObject({
      analytics: {},
      anchors: { min: 2, max: 5 },
      toc: { min: 2, max: 6 },
      siteBranch: 'main',
      sourceDir: '.',
      staticPath: '/static'
    })
  })

  test('takes a static path under a prefix', () => {
    const root = createTempDir({ 'config.yml': `${minimal}staticPath: '/css/static'\n` })

    expect(loadConfig({ root }).staticPath).toBe('/css/static')
  })

  test.each(['static', '/static/', '/', ''])('rejects the static path %j', (staticPath) => {
    expect(() => load(`${minimal}staticPath: '${staticPath}'\n`)).toThrow(/staticPath/)
  })

  test('reads a config file with another name', () => {
    const root = createTempDir({ 'site.yml': minimal })

    expect(loadConfig({ root, file: 'site.yml' }).title).toBe('Site')
  })

  test('names every renamed key', () => {
    const yaml = `${minimal}current_version: '1.0.0'\ngithub_org: 'chassis-ui'\nanalytics:\n  google_id: 'G-1'\n`

    expect(() => load(yaml)).toThrow(
      /`analytics.google_id` was renamed to `analytics.googleId`[\s\S]*`current_version` was renamed to `currentVersion`[\s\S]*`github_org` was renamed to `githubOrg`/
    )
  })

  test('says what to do about a removed key', () => {
    expect(() => load(`${minimal}docsDir: '.'\n`)).toThrow('`docsDir` was removed')
  })

  test('rejects an unknown key', () => {
    expect(() => load(`${minimal}colour: 'red'\n`)).toThrow('Unrecognized key: "colour"')
  })

  test('rejects a missing required key, and names it', () => {
    expect(() => load(minimal.replace(/^title:.*$/m, ''))).toThrow(/- title:/)
  })

  test('rejects a URL in githubOrg', () => {
    expect(() => load(`${minimal}githubOrg: 'https://github.com/chassis-ui'\n`)).toThrow(
      'Expected a GitHub organisation name, not a URL'
    )
  })

  test('rejects a docsPath without a leading slash', () => {
    expect(() => load(minimal.replace("'/site/docs'", "'site/docs'"))).toThrow(/docsPath/)
  })

  test('accepts the keys of an extended schema', () => {
    const schema = configSchema.extend({ blog: z.object({ pageSize: z.number() }) })

    expect(load(`${minimal}blog:\n  pageSize: 10\n`, schema)).toMatchObject({
      blog: { pageSize: 10 }
    })
  })

  test('fails with the path of a file that does not exist', () => {
    expect(() => loadConfig({ root: createTempDir() })).toThrow(/config\.yml/)
  })
})

describe('loadData', () => {
  test('reads and validates a data file', () => {
    const root = createTempDir({ 'data/sizes.yml': '- sm\n- md\n' })

    expect(loadData({ root, file: 'data/sizes.yml', schema: z.string().array() })).toEqual([
      'sm',
      'md'
    ])
  })

  test('fails with the path of an invalid file', () => {
    const root = createTempDir({ 'data/sizes.yml': '- 1\n' })

    expect(() => loadData({ root, file: 'data/sizes.yml', schema: z.string().array() })).toThrow(
      /sizes\.yml` is invalid/
    )
  })
})

describe('loadSidebar', () => {
  test('reads data/sidebar.yml', () => {
    const root = createTempDir({
      'data/sidebar.yml': '- title: Start\n  iconColor: primary\n  pages:\n    - title: Intro\n'
    })

    expect(loadSidebar({ root })).toEqual([
      { title: 'Start', iconColor: 'primary', pages: [{ title: 'Intro' }] }
    ])
  })

  test('rejects the key icon_color, and names the new one', () => {
    const root = createTempDir({ 'data/sidebar.yml': '- title: Start\n  icon_color: primary\n' })

    expect(() => loadSidebar({ root })).toThrow('renamed to `iconColor`')
  })
})
