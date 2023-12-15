import type { HKT } from '../../helpers.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import { State } from './state.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type {
  OptionalityDefault,
  OptionalityOptional,
} from '../../Type/helpers.js'
import type { Simplify } from 'type-fest'

interface BuilderFn extends HKT.Fn {
  // @ts-expect-error ignoreme
  return: Builder<this['params']>
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
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
  } & (BuilderKit.State.Property.Value.IsUnset<
    $State,
    'typeBuilder'
  > extends true
    ? {}
    : {
        default: BuilderKit.UpdaterAtomic<
          $State,
          'optionality',
          BuilderFn,
          {
            args: [
              | TypeBuilder.$InferType<
                  BuilderKit.State.Property.Value.GetSet<$State, 'typeBuilder'>
                >
              | (() => TypeBuilder.$InferType<
                  BuilderKit.State.Property.Value.GetSet<$State, 'typeBuilder'>
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

export const create = BuilderKit.createBuilder<State.Base, BuilderFn, []>()({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      name: updater(`name`) as any, // eslint-disable-line
      description: updater(`description`) as any, // eslint-disable-line
      type: updater('type') as any, // eslint-disable-line
      optional: updater(`optionality`, () => ({ _tag: `optional` })) as any, // eslint-disable-line
      // eslint-disable-next-line
      prompt: updater<[] | [boolean] | [State.PromptInput]>(
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
    }
  },
})

type InferType<$Builder extends BuilderWithStateTypeBuilder> = Simplify<
  InferType_<BuilderKit.State.Get<$Builder>>
>
type InferType_<
  $State extends BuilderKit.State.Get<BuilderWithStateTypeBuilder>,
> = BuilderKit.State.Values.ExcludeUnset<
  BuilderKit.State.Property.Value.GetOrDefault<$State, 'optionality'>
>['_tag'] extends 'optional'
  ? TypeBuilder.$InferType<$State['typeBuilder']['value']> | undefined
  : TypeBuilder.$InferType<$State['typeBuilder']['value']>

export {
  Builder as ParameterBuilder,
  BuilderFn as ParameterBuilderFn,
  InferType as ParameterBuilderInfer,
  BuilderWithStateTypeBuilder as ParameterBuilderWithStateTypeBuilder,
  State as ParameterBuilderState,
}
