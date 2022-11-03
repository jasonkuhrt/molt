import type { Input } from '../../Input/index.js'
import type { ParameterSpec } from '../../ParameterSpec/index.js'
import type { Settings } from '../../Settings/index.js'
import type {
  BuilderAfterSettings,
  BuilderExclusiveInitial,
  SomeBuilderExclusive,
} from '../exclusive/types.js'
import type { z } from 'zod'
import { State } from '../State.js'

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  parameter:           <NameExpression extends string, Schema extends ParameterSpec.SomeBasicZodType>(name:State.ValidateNameExpression<State,NameExpression>, schema:Schema) => RootBuilder<State.AddParameter<State,NameExpression,Schema>>
  parameters:          <ParametersObject extends z.ZodRawShape>(schema:ParametersObject) => RootBuilder<State.AddParametersObject<State,ParametersObject>>
  parametersExclusive: <Label extends string, BuilderReturned extends SomeBuilderExclusive>(label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderReturned) => RootBuilder<BuilderReturned['_']['typeState']>
  settings:            (newSettings:Settings.Input<State.ToSchema<State>>) => BuilderAfterSettings<State>
  parse:               (inputs?:RawArgInputs) => State.ToArgs<State>
}

export type RawArgInputs = {
  line?: Input.Line.RawInputs
  environment?: Input.Environment.RawInputs
}

export type SomeArgsNormalized = Record<string, unknown>
