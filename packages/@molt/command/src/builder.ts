import { Help } from './Help/index.js'
import type { FlagSpecExpressionParseResultToPropertyName } from './helpers.js'
import { lowerCaseObjectKeys } from './helpers.js'
import { getLowerCaseEnvironment } from './helpers.js'
import { Input } from './Input/index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import { Settings } from './Settings/index.js'
import type { FlagName } from '@molt/types'
import type { Any } from 'ts-toolbelt'
import type { z } from 'zod'

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

type Definition<ParametersSchema extends z.ZodRawShape> = {
  schema: ParametersSchema
  settings: (newSettings: Settings.Input<ParametersSchema>) => Definition<ParametersSchema>
  parse: (inputs?: {
    line?: Input.Line.RawInputs
    environment?: Input.Environment.RawInputs
  }) => ParametersToArguments<ParametersSchema>
}

export const create = <Schema extends ParameterSpec.SomeSpecInput>(schema: Schema): Definition<Schema> => {
  const settings = {
    ...Settings.getDefaults(getLowerCaseEnvironment()),
  }

  const chain = {
    settings: (newSettings) => {
      Settings.change(settings, newSettings)
      return chain
    },
    parse: (inputs) => {
      const lineInputs = inputs?.line ?? process.argv.slice(2)
      const environmentInputs = inputs?.environment
        ? lowerCaseObjectKeys(inputs.environment)
        : getLowerCaseEnvironment()
      const specs = ParameterSpec.parse(schema, settings)
      // eslint-disable-next-line
      const result = Input.parse(specs, lineInputs, environmentInputs)
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
  return chain
}
