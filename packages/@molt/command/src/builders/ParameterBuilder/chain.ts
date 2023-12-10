import type { HKT } from '../../helpers.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import { State } from './state.js'
import { BuilderKit, BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type {
  OptionalityDefault,
  OptionalityOptional,
} from '../../Type/helpers.js'

interface BuilderFn extends HKT.Fn {
  // @ts-expect-error ignoreme
  return: Builder<this['params']>
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.Create<
  $State,
  {
    name: BuilderKit.UpdaterAtomic<$State, 'name', BuilderFn>
    description: BuilderKit.UpdaterAtomic<$State, 'description', BuilderFn>
    type: BuilderKit.UpdaterAtomic<$State, 'typeBuilder', BuilderFn>
    prompt: BuilderKit.UpdaterAtomic<$State, 'prompt', BuilderFn>
    optional: BuilderKit.UpdaterAtomic<
      $State,
      'optionality',
      BuilderFn,
      { args: []; return: OptionalityOptional }
    >
  } & (BuilderKit.State.IsUnset<$State, 'typeBuilder'> extends true
    ? {}
    : {
        default: BuilderKit.UpdaterAtomic<
          $State,
          'optionality',
          BuilderFn,
          {
            args: [
              | TypeBuilder.$InferType<
                  BuilderKit.State.GetProperty<$State, 'typeBuilder'>['value']
                >
              | (() => TypeBuilder.$InferType<
                  BuilderKit.State.GetProperty<$State, 'typeBuilder'>['value']
                >),
            ]
            return: OptionalityDefault
          }
        >
      })
>

type BuilderWithStateTypeBuilder = BuilderKit.WithMinState<
  BuilderFn,
  State.Base,
  {
    typeBuilder: TypeBuilder
  }
>

export const create = () => {
  return create_(State.initial)
}

const create_ = <$State extends BuilderKit.State.Initial<State.Base>>(
  state: $State,
): Builder => {
  const $state = state as any as State.Base
  const update = BuilderKit.createUpdater({
    createBuilder: create_,
    state: $state,
  })
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
  } satisfies PrivateData.Unset<Builder>)
}

type InferType<
  $Builder extends BuilderWithStateTypeBuilder,
  _State extends BuilderKit.GetState<$Builder> = BuilderKit.GetState<$Builder>,
> = _State['optionality']['value']['_tag'] extends 'optional'
  ? TypeBuilder.$InferType<_State['typeBuilder']['value']> | undefined
  : TypeBuilder.$InferType<_State['typeBuilder']['value']>

export {
  Builder as ParameterBuilder,
  BuilderFn as ParameterBuilderFn,
  InferType as ParameterBuilderInfer,
  BuilderWithStateTypeBuilder as ParameterBuilderWithStateTypeBuilder,
  State as ParameterBuilderState,
}
