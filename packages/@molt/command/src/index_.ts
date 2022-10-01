import { getProcessEnvironmentLowerCase, lookupEnvironmentVariableArgument } from './environment.js'
import { Errors } from './Errors/index.js'
import type { FlagSpec } from './flagSpec.js'
import { parseFlagSpecs } from './flagSpec.js'
import { dump, parsePrimitive } from './helpers.js'
import { Settings } from './Settings/index.js'
import type { Input, Normalized } from './Settings/settings.js'
import type {
  ArgumentsInput,
  ArgumentsInputStructured,
  ArgumentsInputStructuredArgFlag,
  ArgumentsInputStructuredBooleanFlag,
} from './structureProcessArguments.js'
import { structureProcessArguments } from './structureProcessArguments.js'
import type { FlagSpecExpressionParseResultToPropertyName } from './types.js'
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
    ...Settings.getDefaults(getProcessEnvironmentLowerCase()),
  }

  const api = {
    settings: (newSettings) => {
      Settings.change(settings, newSettings)
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
  settings: Normalized
): object => {
  // console.log({ processArguments })
  const args: Record<string, unknown> = {}
  const specs = parseFlagSpecs(schema)
  const structuredArguments = structureProcessArguments(processArguments)
  // console.log(structuredArguments)
  // TODO only get when enabled and even then only when needed (args missing)
  const processEnvLowerCase = getProcessEnvironmentLowerCase()

  //
  // Validation
  //

  if (settings.parameters.environment.$default.prefix.length > 0) {
    const argsPassedVia = Object.entries(getProcessEnvironmentLowerCase())
      .filter(([prefixedName]) => {
        return Boolean(
          settings.parameters.environment.$default.prefix.find((prefix) =>
            prefixedName.startsWith(prefix.toLowerCase())
          )
        )
      })
      .reduce((acc, [prefixedName, value]) => {
        // eslint-disable-next-line
        const prefix = settings.parameters.environment.$default.prefix.find((prefix) =>
          prefixedName.startsWith(prefix.toLowerCase())
        )!
        const name = prefixedName.replace(prefix.toLowerCase() + `_`, ``)
        const unknownName =
          specs.find(
            (spec) =>
              spec.long === name ||
              spec.short === name ||
              Boolean(spec.aliases.long.find((_) => _ === name)) ||
              Boolean(spec.aliases.short.find((_) => _ === name))
          ) === undefined
        acc[name] = acc[name] ?? []
        // eslint-disable-next-line
        acc[name]!.push([prefix, value, unknownName])
        return acc
      }, {} as Record<string, [string, string | undefined, boolean][]>)

    const argsPassedUnknown = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return Boolean(environmentVariables.find((envar) => envar[2]))
      })
      .map((entry): [string, [string, string | undefined][]] => [
        entry[0],
        entry[1].map((envar) => [envar[0], envar[1]]),
      ])
    if (argsPassedUnknown.length > 0) {
      throw new Error(
        `Environment variables appearing to be CLI parameter arguments were found but do not correspond to any actual parameters. This probably indicates a typo or some other kind of error: ${JSON.stringify(
          Object.fromEntries(
            argsPassedUnknown.sort().map((entry) => [entry[0], Object.fromEntries(entry[1].sort())])
          ),
          null,
          2
        )}`
      )
    }
    const argsPassedViaMultiple = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return environmentVariables.length > 1
      })
      .map((entry): [string, [string, string | undefined][]] => [
        entry[0],
        entry[1].map((envar) => [envar[0], envar[1]]),
      ])
    if (argsPassedViaMultiple.length > 0) {
      const params = argsPassedViaMultiple.map((args) => `"${String(args[0])}"`).join(`, `)
      throw new Error(
        `Parameter(s) ${params} received arguments multiple times via different environment variables: ${JSON.stringify(
          Object.fromEntries(
            argsPassedViaMultiple.sort().map((entry) => [entry[0], Object.fromEntries(entry[1].sort())])
          ),
          null,
          2
        )}`
      )
    }
  }

  //
  // Parsing
  //

  for (const spec of specs) {
    const flagInput = findStructuredArgument(structuredArguments, spec)
    // console.log({ flagInput })

    if (!flagInput) {
      const environmentParameterSettings = {
        ...settings.parameters.environment.$default,
        ...settings.parameters.environment[spec.canonical],
      }
      // console.log({ isEnvironmentArgumentsEnabled })
      if (environmentParameterSettings.enabled) {
        const environmentVariableLookupResult = lookupEnvironmentVariableArgument(
          environmentParameterSettings.prefix,
          processEnvLowerCase,
          spec.canonical
        )
        // console.log({ environmentVariableLookupResult })
        if (environmentVariableLookupResult) {
          const argValidatedNot = parsePrimitive(
            environmentVariableLookupResult.value,
            ZodTypeToPrimitive[spec.schemaBase]
          )
          const argValidated = spec.schema.safeParse(argValidatedNot)
          if (!argValidated.success)
            throw new Errors.ErrorInvalidArgument({
              environmentVariableName: environmentVariableLookupResult.name.toUpperCase(),
              parameterName: toCanonicalParameterName(environmentVariableLookupResult.name),
              validationError: argValidated.error,
            })
          args[spec.canonical] = argValidated.data
          continue
        }
      }

      // @ts-expect-error todo
      if (typeof spec.schema._def.defaultValue === `function`) {
        // @ts-expect-error todo
        //eslint-disable-next-line
        args[spec.canonical] = spec.schema._def.defaultValue()
        continue
      }

      // TODO add test coverage for no-input optional case here
      if (spec.schemaBase !== `ZodBoolean` && !spec.schema.isOptional()) {
        throw new Errors.ErrorMissingArgument({
          flagSpec: spec,
        })
      }
      continue
    }
    // dump(flagInput.arg, spec)

    Alge.match(flagInput.arg)
      .Boolean((arg) => {
        if (spec.schemaBase !== `ZodBoolean`) {
          throw new Errors.ErrorMissingFlagArgument({ flagName: flagInput.givenName })
        }
        args[spec.canonical] = arg.negated ? false : true
      })
      .Arguments((arg) => {
        if (arg.arguments.length === 0) {
          throw new Errors.ErrorMissingFlagArgument({ flagName: flagInput.givenName })
        }
        try {
          // TODO getZodBaseTypeName
          const argument =
            // @ts-expect-error todo
            spec.schema._def.typeName === `ZodNumber` ? Number(arg.arguments[0]) : arg.arguments[0]
          args[spec.canonical] = spec.schema.parse(argument)
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
