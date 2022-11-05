import type { Args } from '../../Args/index.js'
import type { ParameterSpec } from '../../ParameterSpec/index.js'
import type { Settings } from '../../Settings/index.js'
import type {
  BuilderAfterSettings,
  BuilderExclusiveInitial,
  SomeBuilderExclusive,
} from '../exclusive/types.js'
// eslint-disable-next-line
import { State } from '../State.js'
import type { z } from 'zod'

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  parameter:           <NameExpression extends string, Schema extends ParameterSpec.SomeBasicZodType>(name:State.ValidateNameExpression<State,NameExpression>, schema:Schema) => RootBuilder<State.AddParameter<State,NameExpression,Schema>>
  parameters:          <ParametersObject extends z.ZodRawShape>(schema:ParametersObject) => RootBuilder<State.AddParametersObject<State,ParametersObject>>
  parametersExclusive: <Label extends string, BuilderExclusive extends SomeBuilderExclusive>(label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderExclusive) => RootBuilder<BuilderExclusive['_']['typeState']>
  settings:            (newSettings:Settings.Input<State.ToSchema<State>>) => BuilderAfterSettings<State>
  parse:               (inputs?:RawArgInputs) => State.ToArgs<State>
}

export type RawArgInputs = {
  line?: Args.Line.RawInputs
  environment?: Args.Environment.RawInputs
}

export type SomeArgsNormalized = Record<string, unknown>
