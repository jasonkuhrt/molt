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
export class ErrorDuplicateLineArg extends Error {
  public spec: ParameterSpec.Output
  public override name: 'ErrorDuplicateFlag'
  constructor(params: { spec: ParameterSpec.Output; flagName: string }) {
    const message = `The parameter "${params.flagName}" was passed an argument multiple times via flags.`
    super(message)
    this.name = `ErrorDuplicateFlag`
    this.spec = params.spec
  }
}

export class ErrorDuplicateEnvArg extends Error {
  public spec: ParameterSpec.Output
  public override name: 'ErrorDuplicateEnvArg'
  constructor(params: { spec: ParameterSpec.Output }) {
    const message = `The parameter "${params.spec.name.canonical}" was passed an argument multiple times via different parameter aliases in the environment.`
    super(message)
    this.name = `ErrorDuplicateEnvArg`
    this.spec = params.spec
  }
}

export class ErrorFailedToGetParameterDefault extends Error {
  public spec: ParameterSpec.Output
  public override name: 'ErrorFailedToGetParameterDefault'
  constructor(params: { spec: ParameterSpec.Output; cause: Error }) {
    const message = `Failed to get default value for ${params.spec.name.canonical}`
    super(message, { cause: params.cause })
    this.name = `ErrorFailedToGetParameterDefault`
    this.spec = params.spec
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
  public group: ParameterSpec.Output.ExclusiveGroup
  public override name: 'ErrorMissingArgumentForMutuallyExclusiveParameters'
  constructor(params: { group: ParameterSpec.Output.ExclusiveGroup }) {
    const message = `Missing argument for one of the following parameters: ${Object.values(
      params.group.parameters
    )
      .map((_) => _.name.canonical)
      .join(`, `)}`
    super(message)
    this.group = params.group
    this.name = `ErrorMissingArgumentForMutuallyExclusiveParameters`
  }
}

export class ErrorArgsToMultipleMutuallyExclusiveParameters extends Error {
  public group: ParameterSpec.Output.ExclusiveGroup
  public override name: 'ErrorArgsToMultipleMutuallyExclusiveParameters'
  constructor(params: { offenses: { spec: ParameterSpec.Output.Exclusive; arg: Args.Argument }[] }) {
    const message = `Arguments given to multiple mutually exclusive parameters: ${params.offenses
      .map((_) => _.spec.name.canonical)
      .join(`, `)}`
    super(message)
    this.group = params.offenses[0]!.spec.group
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
