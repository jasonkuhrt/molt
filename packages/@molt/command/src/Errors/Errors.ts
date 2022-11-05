import type { Args } from '../Args/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { z } from 'zod'

export class ErrorMissingFlagArgument extends Error {
  constructor(params: { flagName: string }) {
    const message = `Missing argument for flag "${params.flagName}".`
    super(message)
  }
}

export class ErrorMissingArgument extends Error {
  constructor(params: { spec: ParameterSpec.Normalized }) {
    const message = `Missing argument for flag "${params.spec.name.canonical}".`
    super(message)
  }
}

export class ErrorMissingArgumentForMutuallyExclusiveParameters extends Error {
  constructor(params: { group: ParameterSpec.Exclusive }) {
    const message = `Missing argument for one of the following paramters: ${Object.values(params.group.values)
      .map((_) => _.name.canonical)
      .join(`, `)}`
    super(message)
  }
}
export class ErrorArgsToMultipleMutuallyExclusiveParameters extends Error {
  constructor(params: { offenses: { spec: ParameterSpec.Normalized.Exclusive; arg: Args.Argument }[] }) {
    const message = `Arguments given to multiple mutually exclusive parameters: ${params.offenses
      .map((_) => _.spec.name.canonical)
      .join(`, `)}`
    super(message)
  }
}

export class ErrorInvalidArgument extends Error {
  constructor(params: {
    environmentVariableName?: string
    parameterName: string
    validationError: z.ZodError
  }) {
    const message = `Invalid argument${
      params.environmentVariableName
        ? ` (via environment variable "${params.environmentVariableName}") `
        : ` `
    }for parameter: "${params.parameterName}". The error was:\n${params.validationError
      .format()
      ._errors.join(`\n`)}`
    super(message)
  }
}
