import type { CommandParameter } from '../../CommandParameter/index.js'
import type { SomeExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import type { Prompter } from '../../lib/Prompter/Prompter.js'
import type { OpeningArgs } from '../../OpeningArgs/index.js'
import type { Settings } from '../../Settings/index.js'
import type {
  BuilderAfterSettings,
  BuilderExclusiveInitial,
  SomeBuilderExclusive,
} from '../exclusive/types.js'
// eslint-disable-next-line
import { State } from '../State.js'

export interface ParameterConfiguration<$State extends State.Base> {
  schema: $State['Schema']
  prompt?: CommandParameter.Input.Prompt<HKT.Call<$State['SchemaMapper'], this['schema']>>
}

export type IsHasKey<Obj extends object, Key> = Key extends keyof Obj ? true : false

// prettier-ignore
export type IsPromptEnabledInParameterSettings<P extends ParameterConfiguration<any>> =
  IsHasKey<P,'prompt'>                                      extends false     ? false :
                                                                                IsPromptEnabled<P['prompt']>
// prettier-ignore
export type IsPromptEnabledInCommandSettings<P extends Settings.Input<any>> =
  IsHasKey<P,'prompt'>                                      extends false     ? false :
                                                                                IsPromptEnabled<P['prompt']>

// prettier-ignore
export type IsPromptEnabled<P extends CommandParameter.Input.Prompt<any>|undefined> =
  P                                               extends undefined ? false :
  P                                               extends false     ? false :
  P                                               extends true      ? true  :
  P                                               extends null      ? false :
  Exclude<P, undefined|boolean|null>['enabled']   extends false     ? false :
                                                                      true

// prettier-ignore
export interface RootBuilder<$State extends State.Base = State.BaseEmpty> {
  use<$Extension extends SomeExtension>(extension: $Extension): 
    RootBuilder<{
      IsPromptEnabled: $State['IsPromptEnabled'],
      Parameters: $State['Parameters'],
      ParametersExclusive: $State['ParametersExclusive'],
      Schema: $Extension['types']['type']
      SchemaMapper: $Extension['types']['typeMapper']
      // Schema: State['Schema'] | $Extension['type']
    }>
  description                                                                                     (this:void, description:string):
    RootBuilder<$State>
  parameter<NameExpression extends string, const Configuration extends ParameterConfiguration<$State>>    (this:void, name:State.ValidateNameExpression<$State,NameExpression>, configuration:Configuration):
    RootBuilder<{
      IsPromptEnabled    : $State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInParameterSettings<Configuration>
      ParametersExclusive: $State['ParametersExclusive']
      Parameters         : $State['Parameters'] & { [_ in NameExpression]: State.CreateParameter<$State,NameExpression,Configuration> }
      Schema             : $State['Schema']
      SchemaMapper       : $State['SchemaMapper']
    }>
  parameter<NameExpression extends string, $Schema extends $State['Schema']>                                (this:void, name:State.ValidateNameExpression<$State,NameExpression>, schema:$Schema):
    RootBuilder<{
      IsPromptEnabled    : $State['IsPromptEnabled']
      ParametersExclusive: $State['ParametersExclusive']
      Parameters         : $State['Parameters'] & { [_ in NameExpression]: State.CreateParameter<$State,NameExpression,{schema:$Schema}> }
      Schema             : $State['Schema']
      SchemaMapper       : $State['SchemaMapper']
    }>
  parametersExclusive<Label extends string, BuilderExclusive extends SomeBuilderExclusive<$State>>  (this:void, label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<$State,Label>) => BuilderExclusive):
    RootBuilder<BuilderExclusive['_']['typeState']>
  settings                                                                                  <S extends Settings.Input<$State>>(this:void, newSettings:S):
    BuilderAfterSettings<{
      IsPromptEnabled    : $State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInCommandSettings<S>
      ParametersExclusive: $State['ParametersExclusive']
      Parameters         : $State['Parameters']
      Schema             : $State['Schema']
      SchemaMapper       : $State['SchemaMapper']
    }>
  parse                                                                                     (this:void, inputs?:RawArgInputs):
    State.ToArgs<$State>
}

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: Prompter
}

export type SomeArgsNormalized = Record<string, unknown>
