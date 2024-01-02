import { Type } from '../../../Type/index.js'
import type { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

type Pattern =
  | { type: 'email' }
  | { type: 'ip'; options: { version: 4 | 6 | null } }
// TODO
// | [pattern: 'email']
// | [pattern: 'url']
// | [pattern: 'uuid']
// | [pattern: 'cuid']
// | [pattern: 'cuid2']
// | [pattern: 'ulid']
// | [pattern: 'emoji']
// | [
//     pattern: 'dateTime',
//     options: { offset: boolean; precision: null | number },
//   ]

type Chain<$State extends Builder['state'] = Builder['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      description: BuilderKit.UpdaterAtomic<$State, 'description', ChainFn>
      toCase: BuilderKit.UpdaterAtomic<$State, 'transformationsToCase', ChainFn>
      trim: BuilderKit.UpdaterAtomic<$State, 'transformationsTrim', ChainFn>
      min: BuilderKit.UpdaterAtomic<$State, 'refinements.min', ChainFn>
      max: BuilderKit.UpdaterAtomic<$State, 'refinements.max', ChainFn>
      length: BuilderKit.UpdaterAtomic<$State, 'refinements.length', ChainFn>
      startsWith: BuilderKit.UpdaterAtomic<
        $State,
        'refinements.startsWith',
        ChainFn
      >
      endsWith: BuilderKit.UpdaterAtomic<
        $State,
        'refinements.endsWith',
        ChainFn
      >
      includes: BuilderKit.UpdaterAtomic<
        $State,
        'refinements.includes',
        ChainFn
      >
      regex: BuilderKit.UpdaterAtomic<$State, 'refinements.regex', ChainFn>
      pattern: BuilderKit.UpdaterAtomic<$State, 'refinements.pattern', ChainFn>
    }
  >

interface ChainFn extends HKT.Fn {
  return: Chain<this['params']>
}

interface Builder {
  state: {
    type: PrivateData.Values.Type<Type.String>
    description: PrivateData.Values.ValueString
    // transformations: PrivateData.Values.Namespace<{
    transformationsTrim: PrivateData.Values.Atomic<
      boolean,
      true,
      { args: [boolean] } | { args: []; return: true }
    >
    transformationsToCase: PrivateData.Values.Atomic<'upper' | 'lower'>
    // }>
    // refinements: PrivateData.Values.Namespace<{
    //   min: PrivateData.Values.ValueNumber
    //   max: PrivateData.Values.ValueNumber
    //   length: PrivateData.Values.ValueNumber
    //   startsWith: PrivateData.Values.ValueString
    //   endsWith: PrivateData.Values.ValueString
    //   includes: PrivateData.Values.ValueString
    //   regex: PrivateData.Values.Atomic<RegExp>
    //   pattern: PrivateData.Values.Atomic<
    //     Pattern,
    //     PrivateData.Values.UnsetSymbol,
    //     { args: ['email'] } | { args: ['ip', { version: 4 | 6 | null }] }
    //   >
    // }>
  }
  chain: ChainFn
  resolve: Type.String
  constructor: null
}

const create = BuilderKit.createBuilder<Builder>()({
  initialState: {
    transformationsTrim: true,
    transformationsToCase: BuilderKit.State.Values.unset,
    description: BuilderKit.State.Values.unset,
  },
  resolve: (state) => {
    return Type.string({
      optionality: { _tag: `required` },
      description: BuilderKit.valueOrUndefined(state.description),
      refinements: {
        // min: BuilderKit.valueOrUndefined(state.refinements.min),
        // max: BuilderKit.valueOrUndefined(state.refinements.max),
        // length: BuilderKit.valueOrUndefined(state.refinements.length),
        // startsWith: BuilderKit.valueOrUndefined(state.refinements.startsWith),
        // endsWith: BuilderKit.valueOrUndefined(state.refinements.endsWith),
        // includes: BuilderKit.valueOrUndefined(state.refinements.includes),
        // regex: BuilderKit.valueOrUndefined(state.refinements.regex),
        // pattern: BuilderKit.valueOrUndefined(state.refinements.pattern),
      },
      transformations: {
        trim: state.transformationsTrim,
        // toCase: state.transformationsToCase,
      },
    })
  },
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
      toCase: updater(`transformationsToCase`),
      trim: updater<[] | [boolean]>(`transformationsTrim`, (...args) => {
        return args.length === 0 ? true : args[0]
      }),
      min: updater(`refinements.min`),
      max: updater(`refinements.max`),
      length: updater(`refinements.length`),
      endsWith: updater(`refinements.endsWith`),
      startsWith: updater(`refinements.startsWith`),
      includes: updater(`refinements.includes`),
      regex: updater(`refinements.regex`),
      pattern: updater<Pattern>(`refinements.pattern`, (...args) => args),
    }
  },
})

export { create as string, Chain as TypeBuilderString }
