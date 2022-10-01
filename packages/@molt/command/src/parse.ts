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
  // TODO only get when enabled and even then only when needed (args missing)
  const environment = getLowerCaseEnvironment()
  const args: Record<string, unknown> = {}

  // environmentValidate({
  //   environment,
  //   parameterSpecs,
  //   settings,
  // })

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
