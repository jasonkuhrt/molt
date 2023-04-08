import type { Errors } from '../Errors/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { LocalErrors } from './Line/Line.js'

export interface ArgumentReport<Spec extends ParameterSpec.Output = ParameterSpec.Output> extends Argument {
  spec: Spec
  errors: LocalErrors[]
}

export interface Argument {
  value: Value
  source: ArgumentSource
}

export type Value =
  | { _tag: 'boolean'; value: boolean; negated: boolean }
  | { _tag: 'number'; value: number }
  | { _tag: 'string'; value: string }

type ArgumentSource = LineSource | EnvironmentSource

interface LineSource {
  _tag: 'line'
  name: string
}

interface EnvironmentSource {
  _tag: 'environment'
  name: string
  namespace: null | string
}

export type ParseErrorGlobal = Errors.ErrorUnknownFlag

export type ParseErrorBasic =
  | Errors.ErrorMissingArgument
  | Errors.ErrorInvalidArgument
  | Errors.ErrorFailedToGetDefaultArgument
  | Errors.ErrorDuplicateEnvArg
  | Errors.ErrorDuplicateLineArg

export type ParseErrorExclusiveGroup =
  | Errors.ErrorArgumentsToMutuallyExclusiveParameters
  | Errors.ErrorMissingArgumentForMutuallyExclusiveParameters
  | ParseErrorBasic

export type ParseError =
  | ParseErrorBasic
  | ParseErrorExclusiveGroup
  | Errors.ErrorDuplicateEnvArg
  | LocalErrors

export type ParseResultBasicSupplied = {
  _tag: 'supplied'
  spec: Exclude<ParameterSpec.Output, ParameterSpec.Output.Exclusive>
  value: ParameterSpec.ArgumentValue
}

export type ParseResultBasic =
  | ParseResultBasicSupplied
  | {
      _tag: 'omitted'
      spec: Exclude<ParameterSpec.Output, ParameterSpec.Output.Exclusive>
    }
  | {
      _tag: 'error'
      spec: Exclude<ParameterSpec.Output, ParameterSpec.Output.Exclusive>
      errors: ParseErrorBasic[]
    }

export type ParseResultExclusiveGroupSupplied = {
  _tag: 'supplied'
  spec: ParameterSpec.Output.ExclusiveGroup
  parameter: ParameterSpec.Output.Exclusive
  value: ParameterSpec.ArgumentValueMutuallyExclusive
}

export type ParseResultExclusiveGroup =
  | ParseResultExclusiveGroupSupplied
  | {
      _tag: 'omitted'
      spec: ParameterSpec.Output.ExclusiveGroup
    }
  | {
      _tag: 'error'
      spec: ParameterSpec.Output.ExclusiveGroup
      errors: ParseErrorExclusiveGroup[]
    }

export type ParseResult = {
  globalErrors: ParseErrorGlobal[]
  basicParameters: Record<string, ParseResultBasic>
  mutuallyExclusiveParameters: Record<string, ParseResultExclusiveGroup>
}