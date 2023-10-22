import type { CommandParameter } from '../../CommandParameter/index.js'
import type { Prompter } from '../../lib/Prompter/Prompter.js'
import type { OpeningArgs } from '../../OpeningArgs/index.js'
import type { Parameter } from '../../Parameter/Parameter.js'
import type { ParameterInternal } from '../../Parameter/ParameterInternal.js'
import type { Settings } from '../../Settings/index.js'
import type { BuilderExclusiveInitial, SomeBuilderExclusive } from '../exclusive/types.js'
// eslint-disable-next-line
import { State } from '../State.js'
import type { Simplify } from 'effect/Types'
import type { $, Objects } from 'hotscript'

export type Schema = CommandParameter.SomeBasicType | CommandParameter.SomeUnionType

export interface ParameterConfiguration {
  schema: Schema
  prompt?: CommandParameter.Input.Prompt<this['schema']>
}

export type IsHasKey<Obj extends object, Key> = Key extends keyof Obj ? true : false

// prettier-ignore
export type IsPromptEnabledInParameterSettings<P extends ParameterConfiguration> =
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

export interface SomeParameterConfig<S extends Schema> {
  schema: S
  prompt?: CommandParameter.Input.Prompt<S>
}

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  s: State
  description                                                                               (this:void, description:string):
    RootBuilder<State>
  parameter    <$Builder extends Parameter.Builder<ParameterInternal.BuilderStateMinimum>>(this:void, builder:$Builder):
    RootBuilder<$<Objects.Update<`Parameters[${ParameterInternal.GetBuilderState<$Builder>['name']['canonical']}]`, $Builder>, State>>
    // RootBuilder<{
    //   IsPromptEnabled    : State['IsPromptEnabled']
    //   ParametersExclusive: State['ParametersExclusive']
    //   Parameters         : State['Parameters'] & { [_ in $BuilderState['name']['canonical']]: $BuilderState }
    // }>

    // Simplify<$<Objects.Update<`Parameters.bravo`, Simplify<$BuilderState>>, State>>
  // parameter<NameExpression extends string, const Configuration extends ParameterConfiguration>    (this:void, name:State.ValidateNameExpression<NameExpression>, configuration:Configuration):
  //   RootBuilder<$<Objects.Update<`Parameters.${$BuilderState['name']['canonical']}`, $BuilderState>, State>>
  //   RootBuilder<{
  //     IsPromptEnabled    : State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInParameterSettings<Configuration>
  //     ParametersExclusive: State['ParametersExclusive']
  //     Parameters         : State['Parameters'] & { [_ in NameExpression]: State.CreateParameter<State,NameExpression,Configuration> }
  //   }>
  // parameter<NameExpression extends string, S extends Schema>                                (this:void, name:State.ValidateNameExpression<NameExpression>, schema:S):
  //   RootBuilder<{
  //     IsPromptEnabled    : State['IsPromptEnabled']
  //     ParametersExclusive: State['ParametersExclusive']
  //     Parameters         : State['Parameters'] & { [_ in NameExpression]: State.CreateParameter<State,NameExpression,{schema:S}> }
  //   }>
  parametersExclusive<Label extends string, BuilderExclusive extends SomeBuilderExclusive>  (this:void, label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderExclusive):
    RootBuilder<BuilderExclusive['_']['typeState']>
  // settings                                                                                  <S extends Settings.Input<State.ToSchema<State>>>(this:void, newSettings:S):
  //   RootBuilder<$<Objects.Update<`IsPromptEnabled`, State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInCommandSettings<S>>, State>>
    // BuilderAfterSettings<{
    //   IsPromptEnabled    : State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInCommandSettings<S>
    //   ParametersExclusive: State['ParametersExclusive']
    //   Parameters         : State['Parameters']
    // }>
  parse                                                                                     (this:void, inputs?:RawArgInputs):
    ToArgs<State>
    // State
}

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: Prompter
}

type ToArgs<$State extends State.Base> = Simplify<ParametersToArgs<$State['Parameters']>>

type ParametersToArgs<$Parameters extends Record<string, Parameter.Builder>> = Simplify<{
  [Name in keyof $Parameters]: ParameterInternal.Infer<$Parameters[Name]>
}>

export type SomeArgsNormalized = Record<string, unknown>
