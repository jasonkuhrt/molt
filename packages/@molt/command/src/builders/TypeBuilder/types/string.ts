import { createUpdater } from '../../../helpers.js'
import type { Type } from '../../../Type/index.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'
import type { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

type Pattern =
  | [pattern: 'email']
  | [pattern: 'url']
  | [pattern: 'uuid']
  | [pattern: 'cuid']
  | [pattern: 'cuid2']
  | [pattern: 'ulid']
  | [pattern: 'emoji']
  | [pattern: 'ip', options: { version: 4 | 6 | null }]
  | [
      pattern: 'dateTime',
      options: { offset: boolean; precision: null | number },
    ]

namespace State {
  // type x<b extends Base> = BuilderKit.ListPaths<'', b>
  // declare const x: x<Base>
  // x === `transformations.trim`

  export interface Base {
    type: Type.String
    description: PrivateData.Values.DefineSimpleString
    transformations: PrivateData.Values.Namespace<{
      trim: PrivateData.Values.Define<
        boolean,
        true,
        // TODO fixme
        { args: [boolean] } | { args: []; return: true }
        // { args: []; return: true }
      >
      toCase: PrivateData.Values.DefineSimple<'upper' | 'lower'>
    }>
    refinements: PrivateData.Values.Namespace<{
      min: PrivateData.Values.DefineSimpleNumber
      max: PrivateData.Values.DefineSimpleNumber
      length: PrivateData.Values.DefineSimpleNumber
      startsWith: PrivateData.Values.DefineSimpleString
      endsWith: PrivateData.Values.DefineSimpleString
      includes: PrivateData.Values.DefineSimpleString
      regex: PrivateData.Values.DefineSimple<RegExp>
      pattern: PrivateData.Values.DefineSimple<Pattern>
    }>
  }
  export type Initial = PrivateData.GetInitial<Base>
  export const initial: Initial = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = PrivateData.SetupHost<
  $State,
  {
    description: BuilderKit.Updater<$State, 'description', BuilderFn>
    toCase: BuilderKit.Updater<$State, 'transformations.toCase', BuilderFn>
    trim: BuilderKit.Updater<$State, 'transformations.trim', BuilderFn>
    min: BuilderKit.Updater<$State, 'refinements.min', BuilderFn>
    max: BuilderKit.Updater<$State, 'refinements.max', BuilderFn>
    length: BuilderKit.Updater<$State, 'refinements.length', BuilderFn>
    startsWith: BuilderKit.Updater<$State, 'refinements.startsWith', BuilderFn>
    endsWith: BuilderKit.Updater<$State, 'refinements.endsWith', BuilderFn>
    includes: BuilderKit.Updater<$State, 'refinements.includes', BuilderFn>
    regex: BuilderKit.Updater<$State, 'refinements.regex', BuilderFn>
    pattern: BuilderKit.Updater<$State, 'refinements.pattern', BuilderFn>
  }
>

interface BuilderFn extends HKT.Fn {
  return: Builder<this['params']>
}

export const create = (): Builder<State.Base> => create_(State.initial) as any

const create_ = (state: State.Base): Builder => {
  const update = createUpdater({ createBuilder: create_, state })

  return PrivateData.set(state, {
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
  } satisfies PrivateData.Unset<Builder>)
}

export { create as string, Builder as TypeBuilderString }
