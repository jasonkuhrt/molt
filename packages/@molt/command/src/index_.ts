import {
  defaultParameterNamePrefixes,
  getProcessEnvironmentLowerCase,
  lookupEnvironmentVariableArgument,
} from './environment.js'
import { Errors } from './Errors/index.js'
import type { FlagSpec } from './flagSpec.js'
import { parseFlagSpecs } from './flagSpec.js'
import { parseEnvironmentVariableBoolean, parsePrimitive } from './helpers.js'
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
  environmentArguments: {
    enabled: boolean
    prefix: string[]
  }
}

interface SettingsInput {
  description?: string
  environmentArguments?:
    | boolean
    | {
        enabled?: boolean
        prefix?: null | string | string[]
      }
}

type Definition<ParametersSchema extends z.ZodRawShape> = {
  parseOrThrow: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
  settings: (newSettings: SettingsInput) => Definition<ParametersSchema>
  schema: ParametersSchema
}

export const create = <Schema extends z.ZodRawShape>(schema: Schema): Definition<Schema> => {
  const settingsDefaults: SettingsNormalized = {
    environmentArguments: {
      prefix: defaultParameterNamePrefixes,
      enabled: true,
    },
  }
  const settings = { ...settingsDefaults }

  const api = {
    settings: (newSettings) => {
      settings.description = newSettings.description ?? settings.description

      if (newSettings.environmentArguments !== undefined) {
        if (typeof newSettings.environmentArguments === `boolean`) {
          settings.environmentArguments.enabled = newSettings.environmentArguments
        } else {
          if (newSettings.environmentArguments.enabled !== undefined) {
            settings.environmentArguments.enabled = newSettings.environmentArguments.enabled
          }
          if (newSettings.environmentArguments.prefix !== undefined) {
            if (newSettings.environmentArguments.prefix === null) {
              settings.environmentArguments.prefix = []
            } else if (typeof newSettings.environmentArguments.prefix === `string`) {
              settings.environmentArguments.prefix = [newSettings.environmentArguments.prefix]
            } else {
              settings.environmentArguments.prefix = newSettings.environmentArguments.prefix
            }
          }
        }
      }
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

  if (settings.environmentArguments.prefix.length > 0) {
    const argsPassedVia = Object.entries(getProcessEnvironmentLowerCase())
      .filter(([prefixedName]) => {
        return Boolean(
          settings.environmentArguments.prefix.find((prefix) => prefixedName.startsWith(prefix.toLowerCase()))
        )
      })
      .reduce((acc, [prefixedName, value]) => {
        const prefix = settings.environmentArguments.prefix.find((prefix) =>
          prefixedName.startsWith(prefix.toLowerCase())
        )!
        const name = prefixedName.replace(prefix.toLowerCase() + `_`, ``)
        const unknownName =
          flagSpecs.find(
            (spec) =>
              spec.long === name ||
              spec.short === name ||
              Boolean(spec.aliases.long.find((_) => _ === name)) ||
              Boolean(spec.aliases.short.find((_) => _ === name))
          ) === undefined
        acc[name] = acc[name] ?? []
        acc[name]!.push([prefix, value, unknownName])
        return acc
      }, {} as Record<string, [string, string | undefined, boolean][]>)

    const argsPassedUnknown = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return Boolean(environmentVariables.find((envar) => envar[2]))
      })
      .map((entry) => [entry[0], entry[1].map((envar) => [envar[0], envar[1]])])
    if (argsPassedUnknown.length > 0) {
      throw new Error(
        `Environment variables appearing to be CLI parameter arguments were found but do not correspond to any actual parameters. This probably indicates a typo or some other kind of error: ${JSON.stringify(
          // @ts-expect-error todo
          Object.fromEntries(argsPassedUnknown.map((entry) => [entry[0], Object.fromEntries(entry[1])])),
          null,
          2
        )}`
      )
    }
    const argsPassedViaMultiple = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return environmentVariables.length > 1
      })
      .map((entry) => [entry[0], entry[1].map((envar) => [envar[0], envar[1]])])
    if (argsPassedViaMultiple.length > 0) {
      const params = argsPassedViaMultiple.map((args) => `"${args[0]}"`).join(`, `)
      throw new Error(
        `Parameter(s) ${params} received arguments multiple times via different environment variables: ${JSON.stringify(
          // @ts-expect-error todo
          Object.fromEntries(argsPassedViaMultiple.map((entry) => [entry[0], Object.fromEntries(entry[1])])),
          null,
          2
        )}`
      )
    }
  }

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
          settings.environmentArguments.prefix,
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
