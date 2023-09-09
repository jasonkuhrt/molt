import type { OpeningArgs } from '../../OpeningArgs/index.js'
import type { ParameterSpec } from '../../ParameterSpec/index.js'
import type { TTY } from '../../parse/prompt.js'
import type { Settings } from '../../Settings/index.js'
import type {
  BuilderAfterSettings,
  BuilderExclusiveInitial,
  SomeBuilderExclusive,
} from '../exclusive/types.js'
// eslint-disable-next-line
import { State } from '../State.js'

export type Schema = ParameterSpec.SomeBasicType | ParameterSpec.SomeUnionType

export interface ParameterConfiguration {
  schema: Schema
  prompt?: ParameterSpec.Input.Prompt<this['schema']>
}

// prettier-ignore
interface Parameter<State extends State.Base = State.BaseEmpty> {
  <NameExpression extends string, Configuration extends ParameterConfiguration          >(name:State.ValidateNameExpression<State,NameExpression>, configuration: Configuration): RootBuilder<State.AddParameter<State,NameExpression,Configuration>>
  <NameExpression extends string, Schema        extends ParameterConfiguration['schema']>(name:State.ValidateNameExpression<State,NameExpression>, schema:Schema               ): RootBuilder<State.AddParameter<State,NameExpression,{schema:Schema}>>
}

export interface SomeParameterConfig<S extends Schema> {
  schema: S
  prompt?: ParameterSpec.Input.Prompt<S>
}

export type SomeParametersConfigSchema = Record<string, ParameterConfiguration['schema']>

// prettier-ignore
export type SomeParametersConfig<S extends Schema> = {
  [parameterNameExpression:string]: SomeParameterConfig<S>
}

// prettier-ignore
interface Parameters<State extends State.Base = State.BaseEmpty> {
  <C       extends Record<keyof C, ParameterSpec.SomeBasicParameterType>>       (config: {[k in keyof C]: SomeParameterConfig<C[k]>}):        RootBuilder<State.AddParametersConfig<State,{[k in keyof C]:SomeParameterConfig<C[k]>}>>
  <CSchema extends SomeParametersConfigSchema>                                  (schema:CSchema):                                             RootBuilder<State.AddParametersConfig<State,{[k in keyof CSchema]:{schema:CSchema[k]}}>>
}

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  description:         (description:string) => RootBuilder<State>
  parameter:           Parameter<State>
  parameters:          Parameters<State>
  parametersExclusive: <Label extends string, BuilderExclusive extends SomeBuilderExclusive>(label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderExclusive) => RootBuilder<BuilderExclusive['_']['typeState']>
  settings:            (newSettings:Settings.Input<State.ToSchema<State>>) => BuilderAfterSettings<State>
  parse:               (inputs?:RawArgInputs) => State.ToArgs<State>
}

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: TTY
}

export type SomeArgsNormalized = Record<string, unknown>
