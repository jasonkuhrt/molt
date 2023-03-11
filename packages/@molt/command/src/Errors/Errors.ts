import type { Args } from '../Args/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { z } from 'zod'

export class ErrorUnknownFlag extends Error {
  constructor(params: { flagName: string }) {
    const message = `Unknown flag "${params.flagName}"`
    super(message)
  }
}
export class ErrorDuplicateFlag extends Error {
  constructor(params: { flagName: string }) {
    const message = `Duplicate flag "${params.flagName}"`
    super(message)
  }
}

export class ErrorMissingArgument extends Error {
  public spec: ParameterSpec.Output
  constructor(params: { spec: ParameterSpec.Output }) {
    const message = `Missing argument for flag "${params.spec.name.canonical}".`
    super(message)
    this.spec = params.spec
  }
}

export class ErrorMissingArgumentForMutuallyExclusiveParameters extends Error {
  public spec: ParameterSpec.Output.ExclusiveGroup
  constructor(params: { group: ParameterSpec.Output.ExclusiveGroup }) {
    const message = `Missing argument for one of the following parameters: ${Object.values(
      params.group.parameters
    )
      .map((_) => _.name.canonical)
      .join(`, `)}`
    super(message)
    this.spec = params.group
  }
}

export class ErrorArgsToMultipleMutuallyExclusiveParameters extends Error {
  public spec: ParameterSpec.Output.ExclusiveGroup
  constructor(params: { offenses: { spec: ParameterSpec.Output.Exclusive; arg: Args.Argument }[] }) {
    const message = `Arguments given to multiple mutually exclusive parameters: ${params.offenses
      .map((_) => _.spec.name.canonical)
      .join(`, `)}`
    super(message)
    this.spec = params.offenses[0]!.spec.group
  }
}

export class ErrorInvalidArgument extends Error {
  public spec: ParameterSpec.Output
  constructor(params: {
    spec: ParameterSpec.Output
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
    this.spec = params.spec
  }
}
