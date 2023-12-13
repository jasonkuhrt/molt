import type { Type } from '../../../Type/index.js'
import type { Member } from '../../../Type/types/Scalars/Enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

namespace State {
  export interface Base<$Members extends Member[] = any> {
    type: Type.Enumeration<$Members>
    transformations: {}
    refinements: {}
    description: PrivateData.Values.ValueString
  }
  export interface Initial<$Members extends Member[] = any> {
    type: Type.Enumeration<$Members>
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
    description: PrivateData.Values.UnsetSymbol
  }
  export const initial: Base<any> = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = PrivateData.SetupHost<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<
      $State,
      'description',
      BuilderHKT<$State>
    >
  }
>

interface BuilderHKT<$State extends State.Base> extends HKT.Fn<$State> {
  return: Builder<this['params']>
}

const create = <
  $Member extends Member,
  $Members extends [$Member, ...$Member[]],
>(
  members: $Members,
): Builder<State.Initial<$Members>> => create_(State.initial)

const create_ = <$Members extends Member[]>(
  state: State.Base<$Members>,
): Builder<State.Base<$Members>> => {
  const updater = BuilderKit.createUpdater({ state, createBuilder: create_ })
  return PrivateData.set(state, {
    description: updater(`description`),
  } satisfies PrivateData.Unset<Builder<State.Base<$Members>>>)
}

export { create as enum, Builder as TypeBuilderEnumeration }
