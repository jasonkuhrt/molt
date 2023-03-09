import type { Args } from '../../Args/index.js'
import type { ParameterSpec } from '../../ParameterSpec/index.js'
import type { TTY } from '../../prompt.js'
import type { Settings } from '../../Settings/index.js'
import type {
  BuilderAfterSettings,
  BuilderExclusiveInitial,
  SomeBuilderExclusive,
} from '../exclusive/types.js'
// eslint-disable-next-line
import { State } from '../State.js'

export interface ParameterConfiguration {
  schema: ParameterSpec.SomeBasicType | ParameterSpec.SomeUnionType
  prompt?: boolean
}

// prettier-ignore
interface Parameter<State extends State.Base = State.BaseEmpty> {
  <NameExpression extends string, Configuration extends ParameterConfiguration          >(name:State.ValidateNameExpression<State,NameExpression>, configuration: Configuration): RootBuilder<State.AddParameter<State,NameExpression,Configuration>>
  <NameExpression extends string, Schema        extends ParameterConfiguration['schema']>(name:State.ValidateNameExpression<State,NameExpression>, schema:Schema               ): RootBuilder<State.AddParameter<State,NameExpression,{schema:Schema}>>
}

// prettier-ignore
interface Parameters<State extends State.Base = State.BaseEmpty> {
  <ParametersSchemaObject extends Record<string,ParameterConfiguration['schema']>>(schema:ParametersSchemaObject):                    RootBuilder<State.AddParametersObject<State,{[k in keyof ParametersSchemaObject]:{schema:ParametersSchemaObject[k]}}>>
  <ParametersObject       extends Record<string,{schema:ParameterConfiguration['schema'];prompt?:boolean}>>(schema:ParametersObject): RootBuilder<State.AddParametersObject<State,ParametersObject>>
}

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  description:         (description:string) => RootBuilder<State>
  parameter:           Parameter<State>
  // parameters:          <ParametersObject extends Record<string,ParameterConfiguration['schema']|{prompt?:boolean;schema:ParameterConfiguration['schema']}>>(schema:ParametersObject) => RootBuilder<State.AddParametersObject<State,ParametersObject>>
  parameters:          Parameters<State>
  parametersExclusive: <Label extends string, BuilderExclusive extends SomeBuilderExclusive>(label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderExclusive) => RootBuilder<BuilderExclusive['_']['typeState']>
  settings:            (newSettings:Settings.Input<State.ToSchema<State>>) => BuilderAfterSettings<State>
  parse:               (inputs?:RawArgInputs) => State.ToArgs<State>
}

export type RawArgInputs = {
  line?: Args.Line.RawInputs
  environment?: Args.Environment.RawInputs
  tty?: TTY
}

export type SomeArgsNormalized = Record<string, unknown>
