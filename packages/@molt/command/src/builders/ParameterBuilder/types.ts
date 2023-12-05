import type { $, Objects } from 'hotscript'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type { Optionality, OptionalityOptional } from '../../Type/helpers.js'
import type { Type } from '../../Type/index.js'

export type ParameterBuilderWithMinimumState<
  $StateNew extends Partial<State.Base>,
> = ParameterBuilderUpdateState<ParameterBuilder<State.Base>, $StateNew>

export type ParameterBuilderUpdateState<
  $Builder extends ParameterBuilder<State.Base>,
  $StateNew extends Partial<State.Base>,
  // @ts-expect-error fixme
> = ParameterBuilder<PrivateData.UpdateObject<$Builder, $StateNew>>

export type ParameterBuilderUpdateStateProperty<
  $Builder extends ParameterBuilder<State.Base>,
  $P extends keyof PrivateData.Get<$Builder>,
  $V extends PrivateData.Get<$Builder>[$P],
  // @ts-expect-error fixme
> = ParameterBuilder<PrivateData.UpdateProperty<$Builder, $P, $V>>

export type ParameterBuilderInfer<
  $ParameterBuilder extends ParameterBuilderWithStateTypeBuilder,
> = PrivateData.Get<$ParameterBuilder>['optionality']['_tag'] extends 'optional'
  ?
      | Type.Infer<
          PrivateData.Get<
            PrivateData.Get<$ParameterBuilder>['typeBuilder']
          >['type']
        >
      | undefined
  : Type.Infer<
      PrivateData.Get<PrivateData.Get<$ParameterBuilder>['typeBuilder']>['type']
    >

export type ParameterBuilder<$State extends State.Base = State.Base> =
  PrivateData.Set<
    $State,
    {
      name<const $Name extends string>(
        this: void,
        name: $Name,
      ): ParameterBuilder<
        $<
          // Objects.Update<'excludeMethods', Tuples.Append<'name'>>,
          Objects.Update<'name', $Name>,
          $State
        >
      >

      description(
        this: void,
        description: string,
      ): ParameterBuilder<$<Objects.Update<'description', string>, $State>>

      type<$TypeBuilder extends TypeBuilder>(
        this: void,
        type: $TypeBuilder,
      ): ParameterBuilderUpdateStateProperty<
        ParameterBuilder,
        'typeBuilder',
        $TypeBuilder
      >

      optional(
        this: void,
      ): ParameterBuilder<
        $<Objects.Update<'optionality', { _tag: 'optional' }>, $State>
      >

      prompt<$Config extends State.PromptInput>(
        config: $Config,
      ): ParameterBuilder<
        $<
          Objects.Update<
            'prompt',
            {
              enabled: $Config['enabled'] extends boolean
                ? $Config['enabled']
                : true
              when: $Config['when']
            }
          >,
          $State
        >
      >
      prompt(): ParameterBuilder<
        $<Objects.Update<'prompt', { enabled: true; when: object }>, $State>
      >
      prompt<$Enabled extends boolean>(
        enabled: $Enabled,
      ): ParameterBuilder<
        $<Objects.Update<'prompt', { enabled: $Enabled; when: object }>, $State>
      >
    } & (null extends $State['typeBuilder']
      ? {}
      : {
          default(
            this: void,
            value: Type.Infer<
              PrivateData.Get<Exclude<$State['typeBuilder'], null>>['type']
            >,
          ): ParameterBuilder<
            $<Objects.Update<'optionality', { _tag: 'default' }>, $State>
          >
        })
  >

export type ParameterBuilderWithStateTypeBuilder =
  PrivateData.HostUpdateProperty<ParameterBuilder, 'typeBuilder', TypeBuilder>

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
