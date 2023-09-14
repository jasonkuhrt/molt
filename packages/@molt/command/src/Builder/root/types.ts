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

export interface SomeParameterConfig<S extends Schema> {
  schema: S
  prompt?: ParameterSpec.Input.Prompt<S>
}

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  description                                                                               (description:string):
    RootBuilder<State>
  parameter<NameExpression extends string, Configuration extends ParameterConfiguration>    (name:State.ValidateNameExpression<State,NameExpression>, configuration:Configuration):
    RootBuilder<{
      ParametersExclusive: State['ParametersExclusive']
      Parameters         : State['Parameters'] & { [_ in NameExpression]: State.CreateParameter<State,NameExpression,Configuration> }
    }>
  parameter<NameExpression extends string, S extends Schema>                                (name:State.ValidateNameExpression<State,NameExpression>, schema:S):
    RootBuilder<{
      ParametersExclusive: State['ParametersExclusive']
      Parameters         : State['Parameters'] & { [_ in NameExpression]: State.CreateParameter<State,NameExpression,{schema:S}> }
    }>
  parametersExclusive<Label extends string, BuilderExclusive extends SomeBuilderExclusive>  (label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderExclusive):
    RootBuilder<BuilderExclusive['_']['typeState']>
  settings                                                                                  (newSettings:Settings.Input<State.ToSchema<State>>):
    BuilderAfterSettings<State>
  parse                                                                                     (inputs?:RawArgInputs):
    State.ToArgs<State>
}

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: TTY
}

export type SomeArgsNormalized = Record<string, unknown>
