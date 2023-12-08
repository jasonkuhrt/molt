import { createUpdater } from '../../helpers.js'
import type { $, Objects } from 'hotscript'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type { Type } from '../../Type/index.js'
import { State } from './state.js'
import type { ParameterBuilderUpdateStateProperty } from './state.js'

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
            thun: () => Type.Infer<
              PrivateData.Get<Exclude<$State['typeBuilder'], null>>['type']
            >,
          ): ParameterBuilder<
            $<Objects.Update<'optionality', { _tag: 'default' }>, $State>
          >
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

export const create = () => {
  return create_(State.initial)
}

const create_ = <$State extends State.Base>(
  state: $State,
): ParameterBuilder => {
  const update = createUpdater({ builder: create_, state })
  return PrivateData.set(state, {
    name: update(`name`) as any, // eslint-disable-line
    description: update(`description`) as any, // eslint-disable-line
    type: update('type') as any, // eslint-disable-line
    optional: update(`optionality`, () => ({ _tag: `optional` })) as any, // eslint-disable-line
    // eslint-disable-next-line
    prompt: update<[] | [boolean] | [State.PromptInput]>(
      `prompt`,
      (...args) => {
        return args.length === 0
          ? { enabled: true, when: {} }
          : typeof args[0] === `boolean`
          ? { enabled: args[0], when: {} }
          : { enabled: args[0].enabled ?? true, when: args[0].when }
      },
    ) as any,
    // @ts-expect-error ignore
    // eslint-disable-next-line
    default: update(`optionality`, (value) => ({
      _tag: `default`,
      getValue: typeof value === `function` ? value : () => value,
    })) as any,
  } satisfies PrivateData.Remove<ParameterBuilder>)
}
