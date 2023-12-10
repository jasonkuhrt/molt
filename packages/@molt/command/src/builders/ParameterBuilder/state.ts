import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { Optionality, OptionalityOptional } from '../../Type/helpers.js'
import type { ParameterBuilder } from './chain.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../helpers.js'

export namespace State {
  export type PromptInput = {
    enabled?: boolean
    when: object
  }
  type PromptInputReturn<$Input extends PromptInput> = {
    enabled: $Input['enabled'] extends boolean ? $Input['enabled'] : true
    when: $Input['when']
  }
  interface PromptInputReturnFn extends HKT.Fn<PromptInput> {
    return: PromptInputReturn<this['params']>
  }
  export type Prompt = {
    enabled: boolean
    when: object
  }
  export type Base = {
    name: PrivateData.Values.ValueString
    description: PrivateData.Values.ValueString
    typeBuilder: PrivateData.Values.Atomic<TypeBuilder>
    prompt: PrivateData.Values.Atomic<
      Prompt,
      PrivateData.Values.UnsetSymbol,
      | { args: [Prompt] }
      | { args: [PromptInput]; return: PromptInputReturnFn }
      | { args: []; return: { enabled: true; when: object } }
    >
    optionality: PrivateData.Values.Atomic<Optionality, OptionalityOptional>
  }
  // export type Initial = PrivateData.GetInitial<Base>
  // export const initial: Initial = {
  //   description: PrivateData.Values.valueUnset,
  //   name: PrivateData.Values.valueUnset,
  //   typeBuilder: PrivateData.Values.valueUnset,
  //   prompt: PrivateData.Values.valueUnset,
  //   optionality: { _tag: `optional` },
  // }
}

// export type ParameterBuilderWithMinimumState<
//   $StateNew extends Partial<State.Base>,
// > = ParameterBuilderUpdateState<ParameterBuilder, $StateNew>

export type ParameterBuilderUpdateState<
  $Builder extends ParameterBuilder<State.Base>,
  $StateNew extends Partial<State.Base>,
  // @ts-expect-error fixme
> = ParameterBuilder<PrivateData.Update<$Builder, $StateNew>>

export type ParameterBuilderUpdateStateProperty<
  $Builder extends ParameterBuilder<State.Base>,
  $P extends keyof PrivateData.Get<$Builder>,
  $V extends PrivateData.Get<$Builder>[$P],
  // @ts-expect-error fixme
> = ParameterBuilder<PrivateData.UpdateProperty<$Builder, $P, $V>>
