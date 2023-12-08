import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { Optionality, OptionalityOptional } from '../../Type/helpers.js'
import type { ParameterBuilder } from './chain.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'

export namespace State {
  export type PromptInput = {
    enabled?: boolean
    when: object
  }
  export type Prompt = {
    enabled: boolean
    when: object
  }
  export interface Base {
    name: null | string
    description: null | string
    typeBuilder: null | TypeBuilder
    optionality: Optionality
    prompt: null | Prompt
  }
  export interface Initial {
    name: null
    description: null
    typeBuilder: null
    prompt: null
    optionality: OptionalityOptional
  }
  export const initial: Initial = {
    description: null,
    name: null,
    typeBuilder: null,
    prompt: null,
    optionality: { _tag: `optional` },
  }
}

export type ParameterBuilderWithMinimumState<
  $StateNew extends Partial<State.Base>,
> = ParameterBuilderUpdateState<ParameterBuilder, $StateNew>

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
