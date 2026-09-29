import { afterEach, describe, expect, test, vi } from 'vitest'
import { getSiteUrl } from '../../src/libs/site'

const config = { baseURL: 'https://chassis-ui.com/css' }

describe('getSiteUrl', () => {
  const argv = process.argv

  afterEach(() => {
    vi.unstubAllEnvs()
    process.argv = argv
  })

  function stubEnv(env: Record<string, string | undefined>) {
    for (const name of [
      'SITE_URL',
      'NODE_ENV',
      'VERCEL_ENV',
      'VERCEL_URL',
      'VERCEL_PROJECT_PRODUCTION_URL',
      'PORT'
    ]) {
      vi.stubEnv(name, env[name])
    }
  }

  test('prefers SITE_URL over everything else', () => {
    stubEnv({
      SITE_URL: 'https://override.test',
      NODE_ENV: 'development',
      VERCEL_ENV: 'production'
    })

    expect(getSiteUrl(config)).toBe('https://override.test')
  })

  test('uses localhost and the default port in development', () => {
    stubEnv({ NODE_ENV: 'development' })
    process.argv = ['node', 'astro', 'dev']

    expect(getSiteUrl(config)).toBe('http://localhost:4321')
  })

  test('uses the --port flag in development', () => {
    stubEnv({ NODE_ENV: 'development' })
    process.argv = ['node', 'astro', 'dev', '--port', '4400']

    expect(getSiteUrl(config)).toBe('http://localhost:4400')
  })

  test('lets PORT win over the --port flag', () => {
    stubEnv({ NODE_ENV: 'development', PORT: '5000' })
    process.argv = ['node', 'astro', 'dev', '--port', '4400']

    expect(getSiteUrl(config)).toBe('http://localhost:5000')
  })

  test('ignores a port that is out of range', () => {
    stubEnv({ NODE_ENV: 'development', PORT: '70000' })
    process.argv = ['node', 'astro', 'dev']

    expect(getSiteUrl(config)).toBe('http://localhost:4321')
  })

  test('uses baseURL in a Vercel production deployment', () => {
    stubEnv({ VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'chassis-css.vercel.app' })

    expect(getSiteUrl(config)).toBe('https://chassis-ui.com/css')
  })

  test('uses the deployment URL in a Vercel preview', () => {
    stubEnv({ VERCEL_ENV: 'preview', VERCEL_URL: 'chassis-css-abc123.vercel.app' })

    expect(getSiteUrl(config)).toBe('https://chassis-css-abc123.vercel.app')
  })

  test('falls back to baseURL', () => {
    stubEnv({})

    expect(getSiteUrl(config)).toBe('https://chassis-ui.com/css')
  })
})
