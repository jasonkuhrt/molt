import { getProcessEnvironmentLowerCase, lookupEnvironmentVariableArgument } from './environment.js'
import { Errors } from './Errors/index.js'
import { parsePrimitive } from './helpers.js'
import { ZodPrimitiveToPrimitive } from './lib/zodHelpers/index_.js'
import type { FlagInput, FlagInputs, RawLineInputs } from './lineInputs.js'
import { parseLineInputs } from './lineInputs.js'
import type { ParameterSpec } from './parametersSpec.js'
import { parseParametersSpec } from './parametersSpec.js'
import type { Normalized } from './Settings/settings.js'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import { z } from 'zod'

// TODO this does not account for custom prefixes
const toCanonicalParameterName = (parameterName: string) =>
  parameterName.replace(/^cli_(?:param|parameter)_/i, ``)

export const parseProcessArguments = (
  schema: z.ZodRawShape,
  rawLineInputs: RawLineInputs,
  settings: Normalized
): object => {
  const parameterSpecs = parseParametersSpec(schema)
  const lineInputs = parseLineInputs(rawLineInputs)
  // TODO only get when enabled and even then only when needed (args missing)
  const processEnvLowerCase = getProcessEnvironmentLowerCase()
  const args: Record<string, unknown> = {}

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
        const envarName = prefixedName.replace(prefix.toLowerCase() + `_`, ``)
        const envarNameCamel = camelCase(envarName)
        const isUnknownName =
          parameterSpecs.find(
            (spec) =>
              spec.name.long === envarNameCamel ||
              spec.name.short === envarNameCamel ||
              Boolean(spec.name.aliases.long.find((_) => _ === envarNameCamel)) ||
              Boolean(spec.name.aliases.short.find((_) => _ === envarNameCamel))
          ) === undefined
        acc[envarName] = acc[envarName] ?? []
        // eslint-disable-next-line
        acc[envarName]!.push({ prefix, value, isUnknownName })
        return acc
      }, {} as Record<string, { prefix: string; value: string | undefined; isUnknownName: boolean }[]>)

    const argsPassedUnknown = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return Boolean(environmentVariables.find((envar) => envar.isUnknownName))
      })
      .map((entry): [string, { prefix: string; value: string | undefined }[]] => [
        entry[0],
        entry[1].map((envar) => ({ prefix: envar.prefix, value: envar.value })),
      ])
    if (argsPassedUnknown.length > 0) {
      throw new Error(
        `Environment variables appearing to be CLI parameter arguments were found but do not correspond to any actual parameters. This probably indicates a typo or some other kind of error: ${JSON.stringify(
          Object.fromEntries(argsPassedUnknown.sort().map((entry) => [entry[0], entry[1].sort()])),
          null,
          2
        )}`
      )
    }
    const argsPassedMultipleTimesViaDifferentEnvironmentVariables = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return environmentVariables.length > 1
      })
      .map((entry): [string, { prefix: string; value: string | undefined }[]] => [
        entry[0],
        entry[1].map((envar) => ({ prefix: envar.prefix, value: envar.value })),
      ])
    if (argsPassedMultipleTimesViaDifferentEnvironmentVariables.length > 0) {
      const params = argsPassedMultipleTimesViaDifferentEnvironmentVariables
        .map((args) => `"${String(args[0])}"`)
        .join(`, `)
      throw new Error(
        `Parameter(s) ${params} received arguments multiple times via different environment variables: ${JSON.stringify(
          Object.fromEntries(
            argsPassedMultipleTimesViaDifferentEnvironmentVariables
              .sort()
              .map((entry) => [entry[0], entry[1].sort()])
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

  for (const spec of parameterSpecs) {
    const flagInput = findFlagInput(lineInputs, spec)
    // dump(spec)
    // dump(flagInput)

    if (!flagInput) {
      const environmentParameterSettings = {
        ...settings.parameters.environment.$default,
        ...settings.parameters.environment[spec.name.canonical],
      }
      // console.log({ isEnvironmentArgumentsEnabled })
      if (environmentParameterSettings.enabled) {
        const environmentVariableLookupResult = lookupEnvironmentVariableArgument(
          environmentParameterSettings.prefix,
          processEnvLowerCase,
          spec.name.canonical
        )
        // console.log({ environmentVariableLookupResult })
        if (environmentVariableLookupResult) {
          const argValidatedNot = parsePrimitive(
            environmentVariableLookupResult.value,
            ZodPrimitiveToPrimitive[spec.schemaPrimitive]
          )
          const argValidated = spec.schema.safeParse(argValidatedNot)
          if (!argValidated.success)
            throw new Errors.ErrorInvalidArgument({
              environmentVariableName: environmentVariableLookupResult.name.toUpperCase(),
              parameterName: toCanonicalParameterName(environmentVariableLookupResult.name),
              validationError: argValidated.error,
            })
          args[spec.name.canonical] = argValidated.data
          continue
        }
      }

      // @ts-expect-error todo
      if (typeof spec.schema._def.defaultValue === `function`) {
        // @ts-expect-error todo
        //eslint-disable-next-line
        args[spec.name.canonical] = spec.schema._def.defaultValue()
        continue
      }

      if (spec.schemaPrimitive !== `ZodBoolean` && !spec.schema.isOptional()) {
        throw new Errors.ErrorMissingArgument({
          spec: spec,
        })
      }
      continue
    }
    // dump(flagInput.arg, spec)

    Alge.match(flagInput.flagInput)
      .Boolean((arg) => {
        if (spec.schemaPrimitive !== `ZodBoolean`) {
          throw new Errors.ErrorMissingFlagArgument({ flagName: flagInput.viaName })
        }
        args[spec.name.canonical] = arg.negated ? false : true
      })
      .Arguments((arg) => {
        if (arg.arguments.length === 0) {
          throw new Errors.ErrorMissingFlagArgument({ flagName: flagInput.viaName })
        }
        try {
          // TODO getZodBaseTypeName
          const argument =
            // @ts-expect-error todo
            spec.schema._def.typeName === `ZodNumber` ? Number(arg.arguments[0]) : arg.arguments[0]
          args[spec.name.canonical] = spec.schema.parse(argument)
          //eslint-disable-next-line
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Errors.ErrorInvalidArgument({
              parameterName: flagInput.viaName,
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

const findFlagInput = (
  flagInputs: FlagInputs,
  spec: ParameterSpec
): null | {
  via: 'Short' | 'Long'
  viaName: string
  flagInput: FlagInput
} => {
  // TODO handle aliases
  return Alge.match(spec)
    .Long((spec) => {
      if (flagInputs[spec.name.long])
        return {
          via: spec._tag,
          viaName: spec.name.long,
          //eslint-disable-next-line
          flagInput: flagInputs[spec.name.long]!,
        }
      return null
    })
    .Short((spec) => {
      if (flagInputs[spec.name.short])
        return {
          via: spec._tag,
          viaName: spec.name.short,
          //eslint-disable-next-line
          flagInput: flagInputs[spec.name.short]!,
        }
      return null
    })
    .LongShort((spec) => {
      if (flagInputs[spec.name.long])
        return {
          via: `Long` as const,
          viaName: spec.name.long,
          //eslint-disable-next-line
          flagInput: flagInputs[spec.name.long]!,
        }
      if (flagInputs[spec.name.short])
        return {
          via: `Short` as const,
          viaName: spec.name.short,
          //eslint-disable-next-line
          flagInput: flagInputs[spec.name.short]!,
        }
      return null
    })
    .done()
}
