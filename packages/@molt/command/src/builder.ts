import { Help } from './Help/index.js'
import type { FlagSpecExpressionParseResultToPropertyName } from './helpers.js'
import { getLowerCaseEnvironment } from './helpers.js'
import { Input } from './Input/index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import { Settings } from './Settings/index.js'
import type { FlagName } from '@molt/types'
import type { Any } from 'ts-toolbelt'
import { z } from 'zod'

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

type Definition<ParametersSchema extends z.ZodRawShape> = {
  parse: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
  settings: (newSettings: Settings.Input<ParametersSchema>) => Definition<ParametersSchema>
  schema: ParametersSchema
}

export const create = <Schema extends z.ZodRawShape>(schema: Schema): Definition<Schema> => {
  const settings = {
    ...Settings.getDefaults(getLowerCaseEnvironment()),
  }

  const api = {
    settings: (newSettings) => {
      Settings.change(settings, newSettings)
      return api
    },
    parse: (processArguments) => {
      const processArguments_ = processArguments ?? process.argv.slice(2)
      const schema_ = settings.help
        ? {
            ...schema,
            '-h --help': z.boolean().default(false),
          }
        : schema
      const specs = ParameterSpec.parse(schema_, settings)
      // eslint-disable-next-line
      const result = Input.parse(specs, processArguments_)
      // console.log({ result })
      const requiredParamsMissing = specs
        .filter((_) => !_.optional)
        .filter((_) => result.args[_.name.canonical] === undefined)

      // eslint-disable-next-line
      // @ts-expect-error
      const askedForHelp = `help` in result.args && result.args.help === true

      if (result.errors.length > 0 && !askedForHelp) {
        const errors =
          `Cannot run command, you made some mistakes:\n\n` +
          result.errors.map((_) => _.message).join(`\nX `) +
          `\n\nHere are the docs for this command:\n`
        process.stdout.write(errors + `\n`)
        process.stdout.write(Help.render(specs, settings) + `\n`)
        process.exit(1)
        return // When testing we will reach this case
      }

      if (
        (settings.help && askedForHelp) ||
        (settings.helpOnNoArguments && requiredParamsMissing.length > 0)
      ) {
        process.stdout.write(Help.render(specs, settings) + `\n`)
        process.exit(0)
        return // When testing we will reach this case
      }

      return result.args
    },
    schema,
  } as Definition<Schema>
  return api
}
