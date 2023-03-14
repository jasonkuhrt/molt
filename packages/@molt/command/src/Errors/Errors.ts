import type { Args } from '../Args/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'

export class ErrorUnknownFlag extends Error {
  public override name: 'ErrorUnknownFlag'
  constructor(params: { flagName: string }) {
    const message = `Unknown flag "${params.flagName}"`
    super(message)
    this.name = `ErrorUnknownFlag`
  }
}
export class ErrorDuplicateFlag extends Error {
  public override name: 'ErrorDuplicateFlag'
  constructor(params: { flagName: string }) {
    const message = `Duplicate flag "${params.flagName}"`
    super(message)
    this.name = `ErrorDuplicateFlag`
  }
}

export class ErrorDuplicateArgument extends Error {
  public override name: 'ErrorDuplicateArgument'
  constructor(params: { spec: ParameterSpec.Output }) {
    const message = `Duplicate argument for parameter "${params.spec.name.canonical}"`
    super(message)
    this.name = `ErrorDuplicateArgument`
  }
}

export class ErrorFailedToGetParameterDefault extends Error {
  public override name: 'ErrorFailedToGetParameterDefault'
  constructor(params: { spec: ParameterSpec.Output; cause: Error }) {
    const message = `Failed to get default value for ${params.spec.name.canonical}`
    super(message, { cause: params.cause })
    this.name = `ErrorFailedToGetParameterDefault`
  }
}

export class ErrorMissingArgument extends Error {
  public spec: ParameterSpec.Output
  public override name: 'ErrorMissingArgument'
  constructor(params: { spec: ParameterSpec.Output }) {
    const message = `Missing argument for flag "${params.spec.name.canonical}".`
    super(message)
    this.spec = params.spec
    this.name = `ErrorMissingArgument`
  }
}

export class ErrorMissingArgumentForMutuallyExclusiveParameters extends Error {
  public spec: ParameterSpec.Output.ExclusiveGroup
  public override name: 'ErrorMissingArgumentForMutuallyExclusiveParameters'
  constructor(params: { group: ParameterSpec.Output.ExclusiveGroup }) {
    const message = `Missing argument for one of the following parameters: ${Object.values(
      params.group.parameters
    )
      .map((_) => _.name.canonical)
      .join(`, `)}`
    super(message)
    this.spec = params.group
    this.name = `ErrorMissingArgumentForMutuallyExclusiveParameters`
  }
}

export class ErrorArgsToMultipleMutuallyExclusiveParameters extends Error {
  public spec: ParameterSpec.Output.ExclusiveGroup
  public override name: 'ErrorArgsToMultipleMutuallyExclusiveParameters'
  constructor(params: { offenses: { spec: ParameterSpec.Output.Exclusive; arg: Args.Argument }[] }) {
    const message = `Arguments given to multiple mutually exclusive parameters: ${params.offenses
      .map((_) => _.spec.name.canonical)
      .join(`, `)}`
    super(message)
    this.spec = params.offenses[0]!.spec.group
    this.name = `ErrorArgsToMultipleMutuallyExclusiveParameters`
  }
}

export class ErrorInvalidArgument extends Error {
  public spec: ParameterSpec.Output
  public override name: 'ErrorInvalidArgument'
  constructor(params: {
    spec: ParameterSpec.Output
    environmentVariableName?: string
    validationErrors: string[]
  }) {
    const message = `Invalid argument${
      params.environmentVariableName
        ? ` (via environment variable "${params.environmentVariableName}") `
        : ` `
    }for parameter: "${params.spec.name.canonical}". The error was:\n${params.validationErrors.join(`\n`)}`
    super(message)
    this.spec = params.spec
    this.name = `ErrorInvalidArgument`
  }
}
