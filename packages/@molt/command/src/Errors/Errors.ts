import type { OpeningArgs } from '../OpeningArgs/index.js'
import type { ParameterExclusive, ParameterExclusiveGroup } from '../Parameter/exclusive.js'
import type { Parameter } from '../Parameter/types.js'

export namespace Global {
  export class ErrorUnknownParameterViaEnvironment extends Error {
    public override name: 'ErrorUnknownParameterViaEnvironment' = `ErrorUnknownParameterViaEnvironment`
    public prefix: null | string
    constructor(params: { flagName: string; prefix: null | string }) {
      const message = `Unknown parameter "${params.flagName}"`
      super(message)
      this.prefix = params.prefix
    }
  }

  export class ErrorUnknownFlag extends Error {
    public override name: 'ErrorUnknownFlag' = `ErrorUnknownFlag`
    constructor(params: { flagName: string }) {
      const message = `Unknown flag "${params.flagName}"`
      super(message)
    }
  }
}

export class ErrorDuplicateLineArg extends Error {
  public override name: 'ErrorDuplicateFlag' = `ErrorDuplicateFlag`
  public parameter: Parameter
  constructor(params: { parameter: Parameter; flagName: string }) {
    const message = `The parameter "${params.flagName}" was passed an argument multiple times via flags.`
    super(message)
    this.parameter = params.parameter
  }
}

export class ErrorDuplicateEnvArg extends Error {
  public override name: 'ErrorDuplicateEnvArg' = `ErrorDuplicateEnvArg`
  public parameter: Parameter
  public instances: { value: string; name: string; prefix: string | null }[]
  constructor(params: {
    parameter: Parameter
    instances: { value: string; name: string; prefix: string | null }[]
  }) {
    const message = `The parameter "${params.parameter.name.canonical}" was passed an argument multiple times via different parameter aliases in the environment.`
    super(message)
    this.parameter = params.parameter
    this.instances = params.instances
  }
}

export class ErrorFailedToGetDefaultArgument extends Error {
  public override name: 'ErrorFailedToGetDefaultArgument' = `ErrorFailedToGetDefaultArgument`
  public spec: Parameter
  constructor(params: { spec: Parameter; cause: Error }) {
    const message = `Failed to get default value for ${params.spec.name.canonical}`
    super(message, { cause: params.cause })
    this.spec = params.spec
  }
}

export class ErrorMissingArgument extends Error {
  public override name: 'ErrorMissingArgument' = `ErrorMissingArgument`
  public spec: Parameter
  constructor(params: { parameter: Parameter }) {
    const message = `Missing argument for flag "${params.parameter.name.canonical}".`
    super(message)
    this.spec = params.parameter
  }
}

export class ErrorMissingArgumentForMutuallyExclusiveParameters extends Error {
  public override name: 'ErrorMissingArgumentForMutuallyExclusiveParameters' = `ErrorMissingArgumentForMutuallyExclusiveParameters`
  public group: ParameterExclusiveGroup
  constructor(params: { group: ParameterExclusiveGroup }) {
    const message = `Missing argument for one of the following parameters: ${Object.values(
      params.group.parameters,
    )
      .map((_) => _.name.canonical)
      .join(`, `)}`
    super(message)
    this.group = params.group
  }
}

export class ErrorArgumentsToMutuallyExclusiveParameters extends Error {
  public override name: 'ErrorArgumentsToMutuallyExclusiveParameters' = `ErrorArgumentsToMutuallyExclusiveParameters`
  public group: ParameterExclusiveGroup
  constructor(params: { offenses: { spec: ParameterExclusive; arg: OpeningArgs.Argument }[] }) {
    const message = `Arguments given to multiple mutually exclusive parameters: ${params.offenses
      .map((_) => _.spec.name.canonical)
      .join(`, `)}`
    super(message)
    this.group = params.offenses[0]!.spec.group
  }
}

export class ErrorInvalidArgument extends Error {
  public override name: 'ErrorInvalidArgument' = `ErrorInvalidArgument`
  public spec: Parameter
  public value: unknown
  constructor(params: {
    spec: Parameter
    environmentVariableName?: string
    validationErrors: string[]
    value: unknown
  }) {
    const message = `Invalid argument${
      params.environmentVariableName
        ? ` (via environment variable "${params.environmentVariableName}") `
        : ` `
    }for parameter: "${params.spec.name.canonical}". The error was:\n${params.validationErrors.join(`\n`)}`
    super(message)
    this.spec = params.spec
    this.value = params.value
  }
}
