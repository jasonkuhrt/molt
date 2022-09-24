import { Errors } from './Errors/index.js'
import type { FlagName } from '@molt/types'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import type { Any } from 'ts-toolbelt'
import { z } from 'zod'

const toCanonicalParameterName = (parameterName: string) => parameterName.replace(/^cli_/i, ``)

const getProcessEnvironmentLowerCase = () =>
  Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k.toLowerCase(), v?.trim()]))

const ZodTypeToPrimitive = {
  ZodBoolean: `boolean`,
  ZodString: `string`,
  ZodNumber: `number`,
} as const

const lookupEnvironmentVariableArgument = (
  environment: Record<string, string | undefined>,
  parameterName: string
): null | { argument: string; environmentVariableName: string } => {
  const environmentVariableName = `cli_${parameterName}`
  const argument = environment[environmentVariableName]
  if (argument === undefined) return null
  return {
    argument,
    environmentVariableName,
  }
}

const parseEnvironmentVariableBoolean = (value: string) =>
  value === `true` ? true : value === `false` ? false : null

const OrThrow = <T>(messageConstructor: string | (() => string), value: T): Exclude<T, null> => {
  if (value === null) {
    throw new Error(typeof messageConstructor === `string` ? messageConstructor : messageConstructor())
  }
  return value as Exclude<T, null>
}

const casesHandled = (value: never) => {
  throw new Error(`Unhandled case: ${String(value)}`)
}

type SchemaBase = 'ZodBoolean' | 'ZodNumber' | 'ZodString'

export type FlagSpec =
  | {
      _tag: 'Long'
      canonical: string
      schema: z.ZodType
      schemaBase: SchemaBase
      long: string
      short: undefined
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }
  | {
      _tag: 'Short'
      schema: z.ZodType
      schemaBase: SchemaBase
      canonical: string
      long: undefined
      short: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }
  | {
      _tag: 'LongShort'
      schema: z.ZodType
      schemaBase: SchemaBase
      canonical: string
      long: string
      short: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }

const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

const parseFlagSpecs = (schema: z.ZodRawShape): FlagSpec[] =>
  Object.entries(schema).map(([expression, schema]) => {
    const names = expression
      .trim()
      .split(` `)
      .map((exp) => exp.trim())
      .map(stripeDashPrefix)

    // eslint-disable-next-line
    const spec: FlagSpec = {
      long: undefined,
      short: undefined,
      schema,
      aliases: {
        long: [],
        short: [],
      },
      // eslint-disable-next-line
    } as any

    for (const name of names) {
      if (name.length === 1)
        if (spec.short) spec.aliases.short.push(name)
        else spec.short = name
      else if (name.length > 1)
        if (spec.long) spec.aliases.long.push(camelCase(name))
        else spec.long = camelCase(name)
      else throw new Error(`Invalid flag name: ${name}`)
    }

    if (spec.short && spec.long) {
      spec._tag = `LongShort`
      spec.canonical = camelCase(spec.long)
    } else if (spec.short) {
      spec._tag = `Short`
      spec.canonical = spec.short
    } else if (spec.long) {
      spec._tag = `Long`
      spec.canonical = camelCase(spec.long)
    } else throw new Error(`Invalid flag name: ${names.join(` `)}`)

    spec.schemaBase = getSchemaBase(spec.schema)

    return spec
  })

const getSchemaBase = (schema: z.ZodSchema): SchemaBase => {
  // @ts-expect-error ignore-me
  if (schema._def.typeName === `ZodDefault`) {
    // @ts-expect-error ignore-me
    // eslint-disable-next-line
    return getSchemaBase(schema._def.innerType)
  }

  // @ts-expect-error ignore-me
  if (schema._def.typeName === `ZodOptional`) {
    // @ts-expect-error ignore-me
    // eslint-disable-next-line
    return getSchemaBase(schema._def.innerType)
  }

  // @ts-expect-error ignore-me
  // eslint-disable-next-line
  return schema._def.typeName
}

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
  readArgumentsFromEnvironment: boolean
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
    readArgumentsFromEnvironment: false,
  }
  const settings = { ...settingsDefaults }

  const api = {
    settings: (newSettings) => {
      settings.description = newSettings.description ?? settings.description
      settings.readArgumentsFromEnvironment =
        newSettings.readArgumentsFromEnvironment ?? settings.readArgumentsFromEnvironment
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

type ArgumentsInput = string[]

type ArgumentsInputStructuredArgFlag = {
  _tag: 'Arguments'
  arguments: string[]
}

type ArgumentsInputStructuredBooleanFlag = {
  _tag: 'Boolean'
  negated: boolean
}

type ArgumentsInputStructured = Record<
  string,
  ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag
>

const structureProcessArguments = (argumentsInput: ArgumentsInput): ArgumentsInputStructured => {
  const structured: ArgumentsInputStructured = {}
  let index = 0
  let currentFlag: null | ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag = null

  for (const argument of argumentsInput) {
    const trimmed = argument.trim()

    if (isFlagInput(trimmed)) {
      const noDashPrefix = stripeDashPrefix(trimmed)
      if (
        !argumentsInput[index + 1] ||
        //eslint-disable-next-line
        (argumentsInput[index + 1] && isFlagInput(argumentsInput[index + 1]!))
      ) {
        currentFlag = {
          _tag: `Boolean`,
          // TODO handle camel case negation like --noWay
          negated: noDashPrefix.startsWith(`no-`),
        }
        const noNegatePrefix = noDashPrefix.replace(`no-`, ``)
        const camelized = camelCase(noNegatePrefix)
        structured[camelized] = currentFlag
      } else {
        currentFlag = {
          _tag: `Arguments`,
          arguments: [],
        }
        structured[camelCase(noDashPrefix)] = currentFlag
      }
    } else if (currentFlag && currentFlag._tag === `Arguments`) {
      currentFlag.arguments.push(trimmed)
    }

    index++
  }

  // console.log({ structured })
  return structured
}

const findStructuredArgument = (
  structuredArguments: ArgumentsInputStructured,
  flagSpec: FlagSpec
): null | {
  via: 'short' | 'long'
  givenName: string
  arg: ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag
} => {
  // TODO handle aliases
  switch (flagSpec._tag) {
    case `Long`:
      if (structuredArguments[flagSpec.long])
        return {
          via: `long`,
          givenName: flagSpec.long,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.long]!,
        }
      return null
    case `Short`:
      if (structuredArguments[flagSpec.short])
        return {
          via: `short`,
          givenName: flagSpec.short,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.short]!,
        }
      return null
    case `LongShort`:
      if (structuredArguments[flagSpec.long])
        return {
          via: `long`,
          givenName: flagSpec.long,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.long]!,
        }
      if (structuredArguments[flagSpec.short])
        return {
          via: `short`,
          givenName: flagSpec.short,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.short]!,
        }
      return null
    default:
      casesHandled(flagSpec)
  }
  return null
}

const parseProcessArguments = (
  schema: z.ZodRawShape,
  processArguments: ArgumentsInput,
  settings: SettingsNormalized
): object => {
  const args: Record<string, unknown> = {}
  const flagSpecs = parseFlagSpecs(schema)
  const structuredArguments = structureProcessArguments(processArguments)
  // console.log(structuredArguments)
  // TODO only get when enabled and even then only when needed (args missing)
  const processEnvLowerCase = getProcessEnvironmentLowerCase()
  const isEnvironmentArgumentsEnabled = processEnvLowerCase[`cli_environment_args`]
    ? //eslint-disable-next-line
      parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_environment_args`]!)
    : processEnvLowerCase[`cli_environment_arguments`]
    ? //eslint-disable-next-line
      parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_environment_arguments`]!)
    : processEnvLowerCase[`cli_env_args`]
    ? //eslint-disable-next-line
      parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_args`]!)
    : processEnvLowerCase[`cli_env_arguments`]
    ? //eslint-disable-next-line
      parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_arguments`]!)
    : settings.readArgumentsFromEnvironment

  const parsePrimitive = (
    value: string,
    parseTo: 'number' | 'string' | 'boolean'
  ): null | number | string | boolean =>
    Alge.match(parseTo)
      .boolean(() => parseEnvironmentVariableBoolean(value))
      .number(() => Number(value))
      .else(() => value)

  for (const flagSpec of flagSpecs) {
    // console.log(flagSpec)

    const flagInput = findStructuredArgument(structuredArguments, flagSpec)
    // console.log({ input })

    if (!flagInput) {
      // console.log(flagSpec)
      // console.log(processEnvLowerCase)
      if (isEnvironmentArgumentsEnabled) {
        const environmentVariableLookupResult = lookupEnvironmentVariableArgument(
          processEnvLowerCase,
          flagSpec.canonical
        )
        if (environmentVariableLookupResult) {
          const argValidatedNot = parsePrimitive(
            environmentVariableLookupResult.argument,
            ZodTypeToPrimitive[flagSpec.schemaBase]
          )
          const argValidated = flagSpec.schema.safeParse(argValidatedNot)
          if (!argValidated.success)
            throw new Errors.ErrorInvalidArgument({
              environmentVariableName: environmentVariableLookupResult.environmentVariableName.toUpperCase(),
              parameterName: toCanonicalParameterName(
                environmentVariableLookupResult.environmentVariableName
              ),
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

const isFlagInput = (input: string) => {
  return input.trim().startsWith(`--`) || input.trim().startsWith(`-`)
}
