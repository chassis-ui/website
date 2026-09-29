#!/usr/bin/env node

/**
 * Prints the CHANGELOG entry of one version of @chassis-ui/docs, without its heading, for the
 * body of the GitHub release. Reads both heading styles of packages/docs/CHANGELOG.md: the
 * Changesets style (`## 0.6.0`) and the older hand-written style (`## [0.5.1] - 2026-09-29`).
 *
 * Usage: node build/release-notes.js [version]
 *
 * Without a version, it uses the version in packages/docs/package.json. Fails when the
 * CHANGELOG has no entry for the version, or the entry is empty.
 *
 * Adapted from build/release-notes.js of chassis-ui/tokens.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const changelogFile = path.join(repositoryRoot, 'packages/docs/CHANGELOG.md')
const manifestFile = path.join(repositoryRoot, 'packages/docs/package.json')

function regExpQuote(string) {
  return string.replace(/[$()*+-.?[\\\]^{|}]/g, '\\$&')
}

/**
 * The lines of one version's entry, between its `## ` heading and the next `## ` heading
 * outside a code block. `null` when there is no heading for the version.
 */
export function releaseNotes(changelog, version) {
  const heading = new RegExp(`^## \\[?${regExpQuote(version)}\\]?(?:\\s|$)`)
  const lines = changelog.split('\n')
  const start = lines.findIndex((line) => heading.test(line))

  if (start === -1) {
    return null
  }

  let inFence = false
  let end = lines.length

  for (let index = start + 1; index < lines.length; index++) {
    const line = lines[index]

    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
    } else if (!inFence && /^##? /.test(line)) {
      end = index
      break
    }
  }

  return lines
    .slice(start + 1, end)
    .join('\n')
    .trim()
}

async function main() {
  const version = (
    process.argv[2] ?? JSON.parse(await fs.readFile(manifestFile, 'utf8')).version
  ).replace(/^v/, '')
  const notes = releaseNotes(await fs.readFile(changelogFile, 'utf8'), version)

  if (notes === null) {
    console.error(`packages/docs/CHANGELOG.md has no entry for ${version}`)
    process.exit(1)
  }

  if (notes === '') {
    console.error(`The entry for ${version} in packages/docs/CHANGELOG.md is empty`)
    process.exit(1)
  }

  process.stdout.write(`${notes}\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
