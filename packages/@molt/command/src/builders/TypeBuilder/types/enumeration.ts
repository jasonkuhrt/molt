import type { Type } from '../../../Type/index.js'
import type { Member } from '../../../Type/types/Scalars/Enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

namespace State {
  export type Base<$Members extends Member[] = Member[]> = {
    type: PrivateData.Values.Type<Type.Enumeration<$Members>>
    members: PrivateData.Values.Atomic<$Members>
    description: PrivateData.Values.ValueString
  }
  export type Initial<$Members extends Member[] = Member[]> =
    BuilderKit.State.RuntimeData<Base<$Members>>
  export const initial: Initial<any> = {
    members: PrivateData.Values.unsetSymbol,
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<
      $State,
      'description',
      // BuilderFn<$State>
      BuilderFn
    >
  }
>

// interface BuilderFn<$State extends State.Base> extends HKT.Fn<$State> {
//   return: Builder<this['params']>
// }
interface BuilderFn extends HKT.Fn<State.Base> {
  return: Builder<this['params']>
}

const create = BuilderKit.createBuilder<
  State.Base,
  BuilderFn,
  [members: string[]]
>()({
  initialState: State.initial,
  constructor: (members) => {
    return {
      members,
    }
  },
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

// const create = <
//   $Member extends Member,
//   $Members extends [$Member, ...$Member[]],
// >(
//   members: $Members,
// ): Builder<State.Initial<$Members>> => create_(State.initial)

// const create_ = <$Members extends Member[]>(
//   state: State.Base<$Members>,
// ): Builder<State.Base<$Members>> => {
//   const updater = BuilderKit.createUpdater({ state, createBuilder: create_ })
//   return PrivateData.set(state, {
//     description: updater(`description`),
//   } satisfies PrivateData.Unset<Builder<State.Base<$Members>>>)
// }

export { create as enumeration, Builder as TypeBuilderEnumeration }
