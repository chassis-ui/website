import { parseArgs } from 'node:util'
import { CHECKOUT_VARIABLE, syncAssets, vendorAssets } from './assets.js'
import { DEFAULT_PATHS, defaultIgnores } from './files.js'
import { htmlValidate } from './html-validate.js'
import { CommandError, log } from './shared.js'
import { vnu } from './vnu.js'

export const usage = `Usage: chassis-docs <command> [options]

Paths are relative to the working directory. vendor and sync-assets work from any folder
of the repository.

Commands:
  vendor                 Unpack the archive of the assets that vendor/assets.json pins into
                         vendor/assets. $CHASSIS_BRAND and $CHASSIS_APP choose another one,
                         and $${CHECKOUT_VARIABLE} copies the build of a local checkout
  sync-assets            Move vendor/assets.json to a release of the assets, and unpack it
      --version <x.y.z>  The release (default: the latest)
      --repository <o/r> The GitHub repository (default: the one of vendor/assets.json)
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
    run: async () => {
      await vendorAssets()
      return 0
    }
  },
  'sync-assets': {
    options: { version: { type: 'string' }, repository: { type: 'string' } },
    run: async ({ values }) => {
      await syncAssets({ version: values.version, repository: values.repository })
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
