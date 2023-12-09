import type { HKT } from '../../../helpers.js'
import type { Type } from '../../../Type/index.js'
import { createUpdater } from '../../../helpers.js'
import type { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { TypeBuilderBoolean } from './boolean.js'
import type { TypeBuilderEnumeration } from './enum.js'
import type { TypeBuilderNumber } from './number.js'
import type { TypeBuilderString } from './string.js'

type Member =
  | TypeBuilderBoolean
  | TypeBuilderEnumeration
  | TypeBuilderNumber
  | TypeBuilderString

type TupleTypeBuildersToTypes<$Tuple extends Member[]> = {
  [I in keyof $Tuple]: $Tuple[I] extends Member
    ? PrivateData.Get<$Tuple[I]>['type']
    : never
}

namespace State {
  export interface Base<$Members extends Member[] = Member[]> {
    type: Type.Union<TupleTypeBuildersToTypes<$Members>>
    members: $Members
    transformations: {}
    refinements: {}
    description: PrivateData.Values.DefineSimpleString
  }
  export interface Initial<$Members extends Member[] = Member[]> {
    type: Type.Union<TupleTypeBuildersToTypes<$Members>>
    members: $Members
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
    description: PrivateData.Values.UnsetSymbol
  }
  export const initial: Base = {
    type: null as any, // eslint-disable-line
    members: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<
  $Members extends Member[] = Member[],
  $State extends State.Base<$Members> = State.Base<$Members>,
> = PrivateData.SetupHost<
  $State,
  {
    description: BuilderKit.Updater<$State, 'description', BuilderHKT<$State>>
  }
>

interface BuilderHKT<$State extends State.Base<any>> extends HKT.Fn<$State> {
  return: Builder<this['params']['members'], this['params']>
}

const create = <$Members extends Member[]>(
  members: $Members,
): Builder<$Members, State.Initial<$Members>> => create_(State.initial) as any

const create_ = (state: State.Base): Builder => {
  const updater = createUpdater({ state, createBuilder: create_ })
  return PrivateData.set(state, {
    description: updater(`description`),
  } satisfies PrivateData.Unset<Builder>)
}

export { create as union, Builder as TypeBuilderUnion }
