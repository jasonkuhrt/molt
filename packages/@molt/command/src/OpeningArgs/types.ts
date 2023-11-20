import type { Errors } from '../Errors/index.js'
import type { ArgumentValue, ArgumentValueMutuallyExclusive } from '../executor/types.js'
import type { ParameterBasic } from '../Parameter/basic.js'
import type { ParameterExclusive, ParameterExclusiveGroup } from '../Parameter/exclusive.js'
import type { Parameter } from '../Parameter/types.js'
import type { Environment } from './Environment/index.js'
import type { LocalParseErrors } from './Line/Line.js'

export interface EnvironmentArgumentReport<$Parameter extends Parameter = Parameter> extends Argument {
  parameter: $Parameter
  errors: Environment.LocalParseErrors[]
}

export interface ArgumentReport<$Parameter extends Parameter = Parameter> extends Argument {
  parameter: $Parameter
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
  parameter: ParameterBasic
  value: ArgumentValue
}

export type ParseResultBasicError = {
  _tag: 'error'
  parameter: ParameterBasic
  errors: ParseErrorBasic[]
}
export type ParseResultBasicOmitted = {
  _tag: 'omitted'
  parameter: ParameterBasic
}

export type ParseResultBasic = ParseResultBasicSupplied | ParseResultBasicError | ParseResultBasicOmitted

export type ParseResultExclusiveGroupSupplied = {
  _tag: 'supplied'
  spec: ParameterExclusiveGroup
  parameter: ParameterExclusive
  value: ArgumentValueMutuallyExclusive
}

export type ParseResultExclusiveGroupError = {
  _tag: 'error'
  parameter: ParameterExclusiveGroup
  errors: ParseErrorExclusiveGroup[]
}

export type ParseResultExclusiveGroup =
  | ParseResultExclusiveGroupSupplied
  | {
    _tag: 'omitted'
    parameter: ParameterExclusiveGroup
  }
  | ParseResultExclusiveGroupError

export type ParseResult = {
  globalErrors: ParseErrorGlobal[]
  basicParameters: Record<string, ParseResultBasic>
  mutuallyExclusiveParameters: Record<string, ParseResultExclusiveGroup>
}
