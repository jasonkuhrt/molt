import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { Optionality, OptionalityOptional } from '../../Type/helpers.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../helpers.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'

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

  export const initial: BuilderKit.State.Initial<Base> = {
    description: BuilderKit.State.Values.unset,
    name: BuilderKit.State.Values.unset,
    typeBuilder: BuilderKit.State.Values.unset,
    prompt: BuilderKit.State.Values.unset,
    optionality: { _tag: `optional` },
  }
}
