import type { HKT } from '../../helpers.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type {
  Optionality,
  OptionalityDefault,
  OptionalityOptional,
} from '../../Type/helpers.js'
import type { Simplify } from 'type-fest'

export namespace State {
  export interface MethodDefaultReturnValueFn extends HKT.Fn {
    return: OptionalityDefault<this['params'][0]>
  }
  //---
  export type PromptInput = {
    enabled?: boolean
    when: object
  }

  export interface MethodPromptReturnValueFn extends HKT.Fn<PromptInput> {
    return: MethodPromptReturnValue<this['params']>
  }
  export type MethodPromptReturnValue<$Input extends PromptInput> = {
    enabled: $Input['enabled'] extends boolean ? $Input['enabled'] : true
    when: $Input['when']
  }
  export type Prompt = {
    enabled: boolean
    when: object
  }
}

interface Builder {
  state: {
    name: string
    resolve: null
    data: {
      name: BuilderKit.State.Values.ValueString
      description: BuilderKit.State.Values.ValueString
      typeBuilder: BuilderKit.State.Values.Atom<TypeBuilder>
      prompt: BuilderKit.State.Values.Atom<
        State.Prompt,
        BuilderKit.State.Values.Unset,
        | { args: [State.Prompt] }
        | { args: [State.PromptInput]; return: State.MethodPromptReturnValueFn }
        | { args: []; return: { enabled: true; when: object } }
      >
      optionality: BuilderKit.State.Values.Atom<
        Optionality,
        OptionalityOptional
      >
    }
  }
  chain: ChainFn
  constructor: null
}

interface ChainFn extends HKT.Fn {
  // @ts-expect-error ignoreme
  return: Chain<this['params']>
}

type Chain<$State extends Builder['state'] = Builder['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      name: BuilderKit.UpdaterAtom<$State, 'name', ChainFn>
      description: BuilderKit.UpdaterAtom<$State, 'description', ChainFn>
      type: BuilderKit.UpdaterAtom<$State, 'typeBuilder', ChainFn>
      prompt: BuilderKit.UpdaterAtom<$State, 'prompt', ChainFn>
      optional: BuilderKit.UpdaterAtom<
        $State,
        'optionality',
        ChainFn,
        { args: []; return: OptionalityOptional }
      >
    } & (BuilderKit.State.Property.Value.IsUnset<
      $State,
      'typeBuilder'
    > extends true
      ? {}
      : {
          default: BuilderKit.UpdaterAtom<
            $State,
            'optionality',
            ChainFn,
            {
              args: [
                value:
                  | TypeBuilder.$InferType<
                      BuilderKit.State.GetInput<$State>['typeBuilder'] // prettier-ignore
                    >
                  | (() => TypeBuilder.$InferType<
                      BuilderKit.State.GetInput<$State>['typeBuilder'] // prettier-ignore
                    >),
              ]
              return: State.MethodDefaultReturnValueFn
            }
          >
        })
  >

type BuilderWithStateTypeBuilder = BuilderKit.WithMinState<
  ChainFn,
  Builder['state'],
  {
    typeBuilder: TypeBuilder
  }
>

export const create = BuilderKit.createBuilder<Builder>()({
  initialData: {
    description: BuilderKit.State.Values.unset,
    name: BuilderKit.State.Values.unset,
    typeBuilder: BuilderKit.State.Values.unset,
    prompt: BuilderKit.State.Values.unset,
    optionality: { _tag: `optional` },
  },
  implementation: ({ updater }) => {
    return {
      name: updater(`name`) as any, // eslint-disable-line
      description: updater(`description`) as any, // eslint-disable-line
      type: updater('typeBuilder') as any, // eslint-disable-line
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
      default: updater(`optionality`, (value) => ({
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
  ? TypeBuilder.$InferType<$State['data']['typeBuilder']['value']> | undefined
  : TypeBuilder.$InferType<$State['data']['typeBuilder']['value']>

export {
  Chain as ParameterBuilder,
  ChainFn as ParameterBuilderFn,
  InferType as ParameterBuilderInfer,
  BuilderWithStateTypeBuilder as ParameterBuilderWithStateTypeBuilder,
  State as ParameterBuilderState,
}
