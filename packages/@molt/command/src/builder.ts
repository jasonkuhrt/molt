import { Help } from './Help/index.js'
import type { FlagSpecExpressionParseResultToPropertyName } from './helpers.js'
import { getLowerCaseEnvironment } from './helpers.js'
import { Input } from './Input/index.js'
import { dump } from './lib/prelude.js'
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
  parseOrThrow: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
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
    parseOrThrow: (processArguments) => {
      const schema_ = settings.help
        ? {
            ...schema,
            '-h --help': z.boolean().default(false),
          }
        : schema
      const specs = ParameterSpec.parse(schema_, settings)
      // eslint-disable-next-line
      const result = Input.parseOrThrow(specs, processArguments ?? process.argv.slice(2))
      // eslint-disable-next-line
      // @ts-expect-error
      if (settings.help && `help` in result.args && result.args.help === true) {
        process.stdout.write(Help.render(specs) + `\n`)
        process.exit(0)
      }
      return result.args
    },
    schema,
  } as Definition<Schema>
  return api
}
