import type { Type } from '../../../Type/index.js'
import type { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { update } from 'effect/Differ'

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
  export type Initial = BuilderKit.State.Initial<Base>
  export const initial: Initial = {
    transformationsTrim: true,
    transformationsToCase: BuilderKit.State.Values.unset,
    // transformations: {},
    // refinements: {},
    description: BuilderKit.State.Values.unset,
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

const create = BuilderKit.createBuilder<State.Initial, BuilderFn, []>()({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      toCase: update(`transformations.toCase`) as any, // eslint-disable-line
      // eslint-disable-next-line
      trim: update<[] | [boolean]>(`transformations.trim`, (...args) => {
        return args.length === 0 ? true : args[0]
      }) as any,
      min: update(`refinements.min`) as any, // eslint-disable-line
      max: update(`refinements.max`) as any, // eslint-disable-line
      length: update(`refinements.length`) as any, // eslint-disable-line
      endsWith: update(`refinements.endsWith`) as any, // eslint-disable-line
      startsWith: update(`refinements.startsWith`) as any, // eslint-disable-line
      includes: update(`refinements.includes`) as any, // eslint-disable-line
      regex: update(`refinements.regex`) as any, // eslint-disable-line
      pattern: update<Pattern>(`refinements.pattern`, (...args) => args) as any, // eslint-disable-line
    }
  },
})

export { create as string, Builder as TypeBuilderString }
