import { parseArgs } from 'node:util'
import { DEFAULT_BRANCH, buildAssets, syncAssets } from './assets.js'
import { DEFAULT_PATHS, defaultIgnores } from './files.js'
import { htmlValidate } from './html-validate.js'
import { CommandError, log } from './shared.js'
import { vnu } from './vnu.js'

export const usage = `Usage: chassis-docs <command> [options]

Paths are relative to the working directory. vendor and sync-submodules work from any
folder of the repository.

Commands:
  vendor                 Build vendor/assets at the commit that the repository pins
  sync-submodules        Move vendor/assets to the latest commit of a branch, and build it
      --branch <name>    The branch of chassis-assets (default: $SUBMODULE_BRANCH or ${DEFAULT_BRANCH})
  html-validate [paths]  Validate the HTML files in paths (default: _site) with html-validate
      --config <file>    A JSON config of html-validate, added to the defaults
  vnu [paths]            Validate paths (default: _site) with the Nu Html Checker. Needs Java
      --filter <regex>   Leave out the messages that match. Repeatable
      --filter-file <f>  Read filters from a file, one per line

  Both validators:
      --ignore <path>        Skip a file or folder as well. Repeatable
      --no-default-ignore    Check static/icons of each path, which is skipped by default
  help                   Show this message

html-validate and vnu need the html-validate and vnu-jar packages in the site's devDependencies.`

const ignoreOptions = {
  ignore: { type: 'string', multiple: true },
  'no-default-ignore': { type: 'boolean' }
}

// The static/icons folder of each path, unless left out, and the paths of --ignore.
function ignoresOf(values, paths) {
  return [...(values['no-default-ignore'] ? [] : defaultIgnores(paths)), ...(values.ignore ?? [])]
}

const commands = {
  vendor: {
    options: {},
    run: () => {
      buildAssets()
      return 0
    }
  },
  'sync-submodules': {
    options: { branch: { type: 'string' } },
    run: ({ values }) => {
      syncAssets({ branch: values.branch ?? process.env.SUBMODULE_BRANCH ?? DEFAULT_BRANCH })
      return 0
    }
  },
  'html-validate': {
    options: { config: { type: 'string' }, ...ignoreOptions },
    positionals: true,
    run: ({ values, paths }) =>
      htmlValidate({
        paths,
        ignores: ignoresOf(values, paths),
        config: values.config
      })
  },
  vnu: {
    options: {
      filter: { type: 'string', multiple: true },
      'filter-file': { type: 'string' },
      ...ignoreOptions
    },
    positionals: true,
    run: ({ values, paths }) =>
      vnu({
        paths,
        ignores: ignoresOf(values, paths),
        filters: values.filter,
        filterFile: values['filter-file']
      })
  }
}

/**
 * Runs a command and returns its exit code.
 * @param {string[]} argv The arguments after `chassis-docs`
 * @returns {Promise<number>}
 */
export async function main(argv) {
  const [name, ...args] = argv

  if (!name || ['help', '--help', '-h'].includes(name)) {
    console.log(usage)
    return 0
  }

  const command = commands[name]

  try {
    if (!Object.hasOwn(commands, name)) {
      throw new CommandError(`Unknown command '${name}'. Run chassis-docs help for the list.`)
    }

    let parsed

    try {
      parsed = parseArgs({
        args,
        options: { ...command.options, help: { type: 'boolean', short: 'h' } },
        allowPositionals: command.positionals ?? false,
        strict: true
      })
    } catch (error) {
      throw new CommandError(`${error.message}. Run chassis-docs help for the options.`, {
        cause: error
      })
    }

    if (parsed.values.help) {
      console.log(usage)
      return 0
    }

    const paths = parsed.positionals.length > 0 ? parsed.positionals : DEFAULT_PATHS

    return await command.run({ values: parsed.values, paths })
  } catch (error) {
    if (!(error instanceof CommandError)) throw error

    log(error.message, 'error')
    return 1
  }
}
