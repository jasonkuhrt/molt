import type { Type } from '../../../Type/index.js'
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

namespace State {
  export type Base = {
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
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<$State, 'description', BuilderFn>
    toCase: BuilderKit.UpdaterAtomic<$State, 'transformationsToCase', BuilderFn>
    trim: BuilderKit.UpdaterAtomic<$State, 'transformationsTrim', BuilderFn>
    min: BuilderKit.UpdaterAtomic<$State, 'refinements.min', BuilderFn>
    max: BuilderKit.UpdaterAtomic<$State, 'refinements.max', BuilderFn>
    length: BuilderKit.UpdaterAtomic<$State, 'refinements.length', BuilderFn>
    startsWith: BuilderKit.UpdaterAtomic<
      $State,
      'refinements.startsWith',
      BuilderFn
    >
    endsWith: BuilderKit.UpdaterAtomic<
      $State,
      'refinements.endsWith',
      BuilderFn
    >
    includes: BuilderKit.UpdaterAtomic<
      $State,
      'refinements.includes',
      BuilderFn
    >
    regex: BuilderKit.UpdaterAtomic<$State, 'refinements.regex', BuilderFn>
    pattern: BuilderKit.UpdaterAtomic<$State, 'refinements.pattern', BuilderFn>
  }
>

interface BuilderFn extends HKT.Fn<State.Base> {
  return: Builder<this['params']>
}

const create = BuilderKit.createBuilder<State.Base, BuilderFn, []>()({
  initialState: {
    transformationsTrim: true,
    transformationsToCase: BuilderKit.State.Values.unset,
    description: BuilderKit.State.Values.unset,
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

export { create as string, Builder as TypeBuilderString }
