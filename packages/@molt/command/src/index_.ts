import { parseProcessArguments } from './parse.js'
import { getLowerCaseEnvironment } from './parseEnvironment.js'
import { Settings } from './Settings/index.js'
import type { Input } from './Settings/settings.js'
import type { FlagSpecExpressionParseResultToPropertyName } from './types.js'
import type { FlagName } from '@molt/types'
import type { Any } from 'ts-toolbelt'
import type { z } from 'zod'

// const OrThrow = <T>(messageConstructor: string | (() => string), value: T): Exclude<T, null> => {
//   if (value === null) {
//     throw new Error(typeof messageConstructor === `string` ? messageConstructor : messageConstructor())
//   }
//   return value as Exclude<T, null>
// }

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

type Definition<ParametersSchema extends z.ZodRawShape> = {
  parseOrThrow: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
  settings: (newSettings: Input<ParametersSchema>) => Definition<ParametersSchema>
  schema: ParametersSchema
}

export const create = <Schema extends z.ZodRawShape>(schema: Schema): Definition<Schema> => {
  const settings = {
    ...Settings.getDefaults(getLowerCaseEnvironment()),
  }

  const api = {
    settings: (newSettings) => {
      Settings.change(settings, newSettings)
      // dump(settings)
      return api
    },
    parseOrThrow: (processArguments) => {
      // eslint-disable-next-line
      return parseProcessArguments(schema, processArguments ?? process.argv.slice(2), settings) as any
    },
    schema,
  } as Definition<Schema>
  return api
}
