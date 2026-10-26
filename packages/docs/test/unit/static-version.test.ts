import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { getFileVersion, versionStaticPath } from '../../src/libs/static-version'
import { createTempDir } from '../helpers/temp'

describe('getFileVersion', () => {
  test('is the first 8 characters of the MD5 hash of the content', () => {
    const root = createTempDir({ 'a.css': 'body{}' })

    expect(getFileVersion(path.join(root, 'a.css'))).toMatch(/^[0-9a-f]{8}$/)
    expect(getFileVersion(path.join(root, 'a.css'))).toBe(
      getFileVersion(path.join(createTempDir({ 'b.css': 'body{}' }), 'b.css'))
    )
  })

  test('changes with the content', () => {
    const root = createTempDir({ 'a.css': 'body{}' })
    const file = path.join(root, 'a.css')
    const before = getFileVersion(file)

    fs.writeFileSync(file, 'body{color:red}')

    expect(getFileVersion(file)).not.toBe(before)
  })

  test('is undefined without a file', () => {
    const root = createTempDir({ 'dir/': '' })

    expect(getFileVersion(path.join(root, 'missing.css'))).toBeUndefined()
    expect(getFileVersion(path.join(root, 'dir'))).toBeUndefined()
  })
})

describe('versionStaticPath', () => {
  test('adds the version of the file of the public directory', () => {
    const publicDir = createTempDir({ 'static/css/chassis.min.css': 'body{}' })
    const version = getFileVersion(path.join(publicDir, 'static/css/chassis.min.css'))

    expect(versionStaticPath('/static/css/chassis.min.css', publicDir)).toBe(
      `/static/css/chassis.min.css?v=${version}`
    )
  })

  test('returns the path as it is without a file', () => {
    const publicDir = createTempDir({})

    expect(versionStaticPath('/static/css/chassis.min.css', publicDir)).toBe(
      '/static/css/chassis.min.css'
    )
  })

  test('does not read outside the public directory', () => {
    const root = createTempDir({ 'secret.txt': 'x', 'public/': '' })

    expect(versionStaticPath('/../secret.txt', path.join(root, 'public'))).toBe('/../secret.txt')
  })
})
