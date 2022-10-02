import { Errors } from './Errors/index.js'
import { parsePrimitive } from './helpers.js'
import { ZodPrimitiveToPrimitive } from './lib/zodHelpers/index_.js'
import type { ParameterSpec } from './parametersSpec.js'
import { parseParametersSpec } from './parametersSpec.js'
import { getLowerCaseEnvironment, parseEnvironment } from './parseEnvironment.js'
import type { FlagInput, FlagInputs, RawLineInputs } from './parseLineInputs.js'
import { parseLineInputs } from './parseLineInputs.js'
import type { Normalized } from './Settings/settings.js'
import { Alge } from 'alge'
import { z } from 'zod'

export const parseProcessArguments = (
  schema: z.ZodRawShape,
  rawLineInputs: RawLineInputs,
  settings: Normalized
): object => {
  const parameterSpecs = parseParametersSpec(schema)
  const lineInputs = parseLineInputs(rawLineInputs)
  // dump(lineInputs)
  // TODO only get when enabled and even then only when needed (args missing)
  const environment = getLowerCaseEnvironment()
  const args: Record<string, unknown> = {}

  const env = parseEnvironment({
    environment,
    parameterSpecs,
    settings,
  })
  // dump(env)

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
        const environmentInput = env[spec.name.canonical]
        // const environmentVariableLookupResult = lookupEnvironmentVariableArgument(
        //   environmentParameterSettings.prefix,
        //   environment,
        //   spec.name.canonical
        // )
        // console.log({ environmentVariableLookupResult })
        if (environmentInput) {
          const argValidatedNot = parsePrimitive(
            environmentInput.arg,
            ZodPrimitiveToPrimitive[spec.schemaPrimitive]
          )
          const argValidated = spec.schema.safeParse(argValidatedNot)
          if (!argValidated.success) {
            const environmentVariableName =
              `${environmentInput.given.namePrefix}_${environmentInput.given.name}`.toUpperCase()
            throw new Errors.ErrorInvalidArgument({
              environmentVariableName,
              parameterName: environmentInput.spec.name.canonical,
              validationError: argValidated.error,
            })
          }
          if (environmentInput.negated) {
            args[spec.name.canonical] = !argValidated.data
          } else {
            args[spec.name.canonical] = argValidated.data
          }
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

      // dump(spec)
      if (spec.schemaPrimitive !== `ZodBoolean` && !spec.schema.isOptional()) {
        throw new Errors.ErrorMissingArgument({
          spec: spec,
        })
      }
      continue
    }
    // dump(flagInput, spec)

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

  // dump({ args })
  return args
}

const findFlagInput = (
  flagInputs: FlagInputs,
  spec: ParameterSpec
): null | {
  viaName: string
  flagInput: FlagInput
} => {
  if (spec.name.long) {
    const value = flagInputs[spec.name.long]
    if (value !== undefined) {
      return {
        viaName: spec.name.long,
        flagInput: value,
      }
    }
  }
  if (spec.name.short) {
    const value = flagInputs[spec.name.short]
    if (value !== undefined) {
      return {
        viaName: spec.name.short,
        flagInput: value,
      }
    }
  }
  if (spec.name.aliases.long.length > 0) {
    const result = spec.name.aliases.long
      .map((_) => [_, flagInputs[_]])
      .filter((entry): entry is [string, FlagInput] => entry[1] !== undefined)[0]
    if (result !== undefined) {
      const [name, value] = result
      return {
        viaName: name,
        flagInput: value,
      }
    }
  }
  if (spec.name.aliases.short.length > 0) {
    const result = spec.name.aliases.short
      .map((_) => [_, flagInputs[_]])
      .filter((entry): entry is [string, FlagInput] => entry[1] !== undefined)[0]
    if (result !== undefined) {
      const [name, value] = result
      return {
        viaName: name,
        flagInput: value,
      }
    }
  }

  return null
}
