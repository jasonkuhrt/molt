import type { CommandParameter } from '../CommandParameter/index.js'
import type { Errors } from '../Errors/index.js'
import type { Environment } from './Environment/index.js'
import type { LocalParseErrors } from './Line/Line.js'

export interface EnvironmentArgumentReport<
  Parameter extends CommandParameter.Output = CommandParameter.Output,
> extends Argument {
  parameter: Parameter
  errors: Environment.LocalParseErrors[]
}

export interface ArgumentReport<Parameter extends CommandParameter.Output = CommandParameter.Output>
  extends Argument {
  parameter: Parameter
  errors: LocalParseErrors[]
}

export interface Argument {
  value: Value
  source: ArgumentSource
}

export type Value =
  | { _tag: 'boolean'; value: boolean; negated: boolean }
  | { _tag: 'number'; value: number }
  | { _tag: 'string'; value: string }
  | { _tag: 'undefined'; value: undefined }

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

export type ParseErrorGlobal =
  | Errors.Global.ErrorUnknownFlag
  | Errors.Global.ErrorUnknownParameterViaEnvironment

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
  | LocalParseErrors

export type ParseResultBasicSupplied = {
  _tag: 'supplied'
  parameter: CommandParameter.Output.Basic
  value: CommandParameter.ArgumentValue
}

export type ParseResultBasicError = {
  _tag: 'error'
  parameter: CommandParameter.Output.Basic
  errors: ParseErrorBasic[]
}
export type ParseResultBasicOmitted = {
  _tag: 'omitted'
  parameter: CommandParameter.Output.Basic
}

export type ParseResultBasic = ParseResultBasicSupplied | ParseResultBasicError | ParseResultBasicOmitted

export type ParseResultExclusiveGroupSupplied = {
  _tag: 'supplied'
  spec: CommandParameter.Output.ExclusiveGroup
  parameter: CommandParameter.Output.Exclusive
  value: CommandParameter.ArgumentValueMutuallyExclusive
}

export type ParseResultExclusiveGroupError = {
  _tag: 'error'
  parameter: CommandParameter.Output.ExclusiveGroup
  errors: ParseErrorExclusiveGroup[]
}

export type ParseResultExclusiveGroup =
  | ParseResultExclusiveGroupSupplied
  | {
      _tag: 'omitted'
      parameter: CommandParameter.Output.ExclusiveGroup
    }
  | ParseResultExclusiveGroupError

export type ParseResult = {
  globalErrors: ParseErrorGlobal[]
  basicParameters: Record<string, ParseResultBasic>
  mutuallyExclusiveParameters: Record<string, ParseResultExclusiveGroup>
}
