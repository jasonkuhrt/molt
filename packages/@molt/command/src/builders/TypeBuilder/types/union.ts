import type { HKT } from '../../../helpers.js'
import type { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
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
  export type Base<$Members extends Member[] = Member[]> = {
    type: PrivateData.Values.Type<
      Type.Union<TupleTypeBuildersToTypes<$Members>>
    >
    members: PrivateData.Values.Atomic<$Members>
    description: PrivateData.Values.ValueString
  }
  export type Initial<$Members extends Member[] = Member[]> =
    BuilderKit.State.Initial<Base<$Members>>
  export const initial: Initial = {
    members: null as any, // eslint-disable-line
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<
  $Members extends Member[] = Member[],
  $State extends State.Base<$Members> = State.Base<$Members>,
> = BuilderKit.State.Setup<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<
      $State,
      'description',
      BuilderHKT<$State>
    >
  }
>

interface BuilderHKT<$State extends State.Base<any>> extends HKT.Fn<$State> {
  return: Builder<this['params']['members'], this['params']>
}

const create = <$Members extends Member[]>(
  members: $Members,
): Builder<$Members, State.Initial<$Members>> => create_(State.initial) as any

const create_ = (state: State.Base): Builder => {
  const updater = BuilderKit.createUpdater({ state, createBuilder: create_ })
  return PrivateData.set(state, {
    description: updater(`description`),
  } satisfies PrivateData.Unset<Builder>)
}

export { create as union, Builder as TypeBuilderUnion }
