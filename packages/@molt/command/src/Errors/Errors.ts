import type { Normalized } from '../ParameterSpec/ParametersSpec.js'
import type { z } from 'zod'

export class ErrorMissingFlagArgument extends Error {
  constructor(params: { flagName: string }) {
    const message = `Missing argument for flag "${params.flagName}".`
    super(message)
  }
}

export class ErrorMissingArgument extends Error {
  constructor(params: { spec: Normalized }) {
    const message = `Missing argument for flag "${params.spec.name.canonical}".`
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
