import type { SomeExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import type { Prompter } from '../../lib/Prompter/Prompter.js'
import type { OpeningArgs } from '../../OpeningArgs/index.js'
import type { Prompt } from '../../Parameter/types.js'
import type { Settings } from '../../Settings/index.js'
import type { BuilderExclusiveInitial, SomeBuilderExclusive } from '../exclusive/types.js'
// todo
// eslint-disable-next-line
import type { Objects, Pipe } from 'hotscript'
import { BuilderCommandState } from './state.js'

export interface ParameterConfiguration<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> {
  type: $State['Type']
  prompt?: Prompt<HKT.Call<$State['TypeMapper'], this['type']>>
}

export type IsHasKey<Obj extends object, Key> = Key extends keyof Obj ? true : false

// prettier-ignore
export type IsPromptEnabledInParameterSettings<P extends ParameterConfiguration<any>> = IsHasKey<P, 'prompt'> extends
  false ? false
  : IsPromptEnabled<P['prompt']>
// prettier-ignore
export type IsPromptEnabledInCommandSettings<P extends Settings.Input<any>> = IsHasKey<P, 'prompt'> extends false
  ? false
  : IsPromptEnabled<P['prompt']>

// prettier-ignore
export type IsPromptEnabled<P extends Prompt<any> | undefined> = P extends undefined ? false
  : P extends false ? false
  : P extends true ? true
  : P extends null ? false
  : Exclude<P, undefined | boolean | null>['enabled'] extends false ? false
  : true

// prettier-ignore
export interface CommandBuilder<$State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty> {
  use<$Extension extends SomeExtension>(extension: $Extension): CommandBuilder<{
    IsPromptEnabled: $State['IsPromptEnabled']
    Parameters: $State['Parameters']
    ParametersExclusive: $State['ParametersExclusive']
    Type: $Extension['types']['type']
    TypeMapper: $Extension['types']['typeMapper']
  }>
  description(this: void, description: string): CommandBuilder<$State>
  parameter<NameExpression extends string, const Configuration extends ParameterConfiguration<$State>>(
    this: void,
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    configuration: Configuration,
  ): CommandBuilder<BuilderCommandState.AddParameter<$State, NameExpression, Configuration>>
  parameter<NameExpression extends string, $Type extends $State['Type']>(
    this: void,
    name: BuilderCommandState.ValidateNameExpression<$State, NameExpression>,
    type: $Type,
  ): CommandBuilder<BuilderCommandState.AddParameter<$State, NameExpression, { type: $Type }>>
  parametersExclusive<Label extends string, BuilderExclusive extends SomeBuilderExclusive<$State>>(
    this: void,
    label: Label,
    ExclusiveBuilderContainer: (builder: BuilderExclusiveInitial<$State, Label>) => BuilderExclusive,
  ): CommandBuilder<BuilderExclusive['_']['typeState']>
  settings<S extends Settings.Input<$State>>(
    this: void,
    newSettings: S,
  ): CommandBuilder<
    Pipe<$State, [
      Objects.Update<
        'IsPromptEnabled',
        Objects.Assign<$State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInCommandSettings<S>>
      >,
    ]>
  >
  parse(this: void, inputs?: RawArgInputs): BuilderCommandState.ToArgs<$State>
}

export type RawArgInputs = {
  line?: OpeningArgs.Line.RawInputs
  environment?: OpeningArgs.Environment.RawInputs
  tty?: Prompter
}

export type SomeArgsNormalized = Record<string, unknown>
