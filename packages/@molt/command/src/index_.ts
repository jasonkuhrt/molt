import { Errors } from './Errors/index.js'
import type { FlagSpec } from './flagSpec.js'
import { parseFlagSpecs } from './flagSpec.js'
import {
  getProcessEnvironmentLowerCase,
  lookupEnvironmentVariableArgument,
  parseEnvironmentVariableBoolean,
  parsePrimitive,
  stripeDashPrefix,
} from './helpers.js'
import type {
  ArgumentsInput,
  ArgumentsInputStructured,
  ArgumentsInputStructuredArgFlag,
  ArgumentsInputStructuredBooleanFlag,
} from './structureProcessArguments.js'
import { structureProcessArguments } from './structureProcessArguments.js'
import type { FlagName } from '@molt/types'
import { Alge } from 'alge'
import type { Any } from 'ts-toolbelt'
import { z } from 'zod'

const defaultParameterNamePrefixes = [`CLI_PARAMETER`, `CLI_PARAM`] as const

export const environmentArgumentName = (name: string) => `${defaultParameterNamePrefixes[0]}_${name}`

const toCanonicalParameterName = (parameterName: string) =>
  parameterName.replace(/^cli_(?:param|parameter)_/i, ``)

const ZodTypeToPrimitive = {
  ZodBoolean: `boolean`,
  ZodString: `string`,
  ZodNumber: `number`,
} as const

// const OrThrow = <T>(messageConstructor: string | (() => string), value: T): Exclude<T, null> => {
//   if (value === null) {
//     throw new Error(typeof messageConstructor === `string` ? messageConstructor : messageConstructor())
//   }
//   return value as Exclude<T, null>
// }

// prettier-ignore
type FlagSpecExpressionParseResultToPropertyName<result extends FlagName.Types.SomeParseResult> = 
	FlagName.Errors.$Is<result> extends true 		? result :
	result extends { long: string } 						? result['long'] :
	result extends { short: string} 						? result['short'] :
																							  never

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

interface SettingsNormalized {
  description?: string
  environmentArguments: boolean
}

interface SettingsInput {
  description?: string
  readArgumentsFromEnvironment?: boolean
}

type Definition<ParametersSchema extends z.ZodRawShape> = {
  parseOrThrow: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
  settings: (newSettings: SettingsInput) => Definition<ParametersSchema>
  schema: ParametersSchema
}

export const create = <Schema extends z.ZodRawShape>(schema: Schema): Definition<Schema> => {
  const settingsDefaults: SettingsNormalized = {
    environmentArguments: false,
  }
  const settings = { ...settingsDefaults }

  const api = {
    settings: (newSettings) => {
      settings.description = newSettings.description ?? settings.description
      settings.environmentArguments =
        newSettings.readArgumentsFromEnvironment ?? settings.environmentArguments
      return api
    },
    parseOrThrow: (processArguments) => {
      // eslint-disable-next-line
      // console.log({ settings })
      return parseProcessArguments(schema, processArguments ?? process.argv.slice(2), settings) as any
    },
    schema,
  } as Definition<Schema>
  return api
}

const findStructuredArgument = (
  structuredArguments: ArgumentsInputStructured,
  flagSpec: FlagSpec
): null | {
  via: 'Short' | 'Long'
  givenName: string
  arg: ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag
} => {
  // TODO handle aliases
  return Alge.match(flagSpec)
    .Long((flagSpec) => {
      if (structuredArguments[flagSpec.long])
        return {
          via: flagSpec._tag,
          givenName: flagSpec.long,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.long]!,
        }
      return null
    })
    .Short((flagSpec) => {
      if (structuredArguments[flagSpec.short])
        return {
          via: flagSpec._tag,
          givenName: flagSpec.short,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.short]!,
        }
      return null
    })
    .LongShort((flagSpec) => {
      if (structuredArguments[flagSpec.long])
        return {
          via: `Long` as const,
          givenName: flagSpec.long,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.long]!,
        }
      if (structuredArguments[flagSpec.short])
        return {
          via: `Short` as const,
          givenName: flagSpec.short,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.short]!,
        }
      return null
    })
    .done()
}

const parseProcessArguments = (
  schema: z.ZodRawShape,
  processArguments: ArgumentsInput,
  settings: SettingsNormalized
): object => {
  // console.log({ processArguments })
  const args: Record<string, unknown> = {}
  const flagSpecs = parseFlagSpecs(schema)
  const structuredArguments = structureProcessArguments(processArguments)
  // console.log(structuredArguments)
  // TODO only get when enabled and even then only when needed (args missing)
  const processEnvLowerCase = getProcessEnvironmentLowerCase()

  const isEnvironmentArgumentsEnabled = processEnvLowerCase[`cli_settings_read_arguments_from_environment`]
    ? //eslint-disable-next-line
      parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_settings_read_arguments_from_environment`]!)
    : // : processEnvLowerCase[`cli_environment_arguments`]
      // ? //eslint-disable-next-line
      //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_environment_arguments`]!)
      // : processEnvLowerCase[`cli_env_args`]
      // ? //eslint-disable-next-line
      //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_args`]!)
      // : processEnvLowerCase[`cli_env_arguments`]
      // ? //eslint-disable-next-line
      //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_arguments`]!)
      settings.environmentArguments

  for (const flagSpec of flagSpecs) {
    // console.log(flagSpec)

    const flagInput = findStructuredArgument(structuredArguments, flagSpec)
    // console.log({ flagInput })

    if (!flagInput) {
      // console.log(flagSpec)
      // console.log(processEnvLowerCase)
      // console.log({ isEnvironmentArgumentsEnabled })
      if (isEnvironmentArgumentsEnabled) {
        const environmentVariableLookupResult = lookupEnvironmentVariableArgument(
          defaultParameterNamePrefixes,
          processEnvLowerCase,
          flagSpec.canonical
        )
        // console.log({ environmentVariableLookupResult })
        if (environmentVariableLookupResult) {
          const argValidatedNot = parsePrimitive(
            environmentVariableLookupResult.value,
            ZodTypeToPrimitive[flagSpec.schemaBase]
          )
          const argValidated = flagSpec.schema.safeParse(argValidatedNot)
          if (!argValidated.success)
            throw new Errors.ErrorInvalidArgument({
              environmentVariableName: environmentVariableLookupResult.name.toUpperCase(),
              parameterName: toCanonicalParameterName(environmentVariableLookupResult.name),
              validationError: argValidated.error,
            })
          args[flagSpec.canonical] = argValidated.data
          continue
        }
      }

      // @ts-expect-error todo
      if (typeof flagSpec.schema._def.defaultValue === `function`) {
        // @ts-expect-error todo
        //eslint-disable-next-line
        args[flagSpec.canonical] = flagSpec.schema._def.defaultValue()
        continue
      }

      if (flagSpec.schemaBase !== `ZodBoolean`) {
        throw new Errors.ErrorMissingArgument({
          flagSpec: flagSpec,
        })
      }
      continue
    }

    Alge.match(flagInput.arg)
      .Boolean((arg) => {
        if (flagSpec.schemaBase !== `ZodBoolean`) {
          throw new Errors.ErrorMissingFlagArgument({ flagName: flagInput.givenName })
        }
        args[flagSpec.canonical] = arg.negated ? false : true
      })
      .Arguments((arg) => {
        if (arg.arguments.length === 0) {
          throw new Errors.ErrorMissingFlagArgument({ flagName: flagInput.givenName })
        }
        try {
          // TODO getZodBaseTypeName
          const argument =
            // @ts-expect-error todo
            flagSpec.schema._def.typeName === `ZodNumber` ? Number(arg.arguments[0]) : arg.arguments[0]
          args[flagSpec.canonical] = flagSpec.schema.parse(argument)
          //eslint-disable-next-line
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Errors.ErrorInvalidArgument({
              parameterName: flagInput.givenName,
              validationError: error,
            })
          }
          throw error
        }
      })
      .done()
  }

  return args
}
