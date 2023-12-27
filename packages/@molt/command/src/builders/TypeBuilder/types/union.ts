import type { HKT } from '../../../helpers.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { TypeBuilderBoolean } from './boolean.js'
import type { TypeBuilderEnumeration } from './enumeration.js'
import type { TypeBuilderNumber } from './number.js'
import type { TypeBuilderString } from './string.js'

type Member =
  | TypeBuilderBoolean
  | TypeBuilderEnumeration
  | TypeBuilderNumber
  | TypeBuilderString

// type TupleTypeBuildersToTypes<$Tuple extends Member[]> = {
//   [I in keyof $Tuple]: $Tuple[I] extends Member
//     ? PrivateData.Get<$Tuple[I]>['type']
//     : never
// }

namespace State {
  export type Base<$Members extends Member[] = Member[]> = {
    // type: PrivateData.Values.Type<
    //   Type.Union<TupleTypeBuildersToTypes<$Members>>
    // >
    members: PrivateData.Values.Atomic<$Members>
    description: PrivateData.Values.ValueString
  }
  export type Initial<$Members extends Member[] = Member[]> =
    BuilderKit.State.RuntimeData<Base<$Members>>
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
    description: BuilderKit.UpdaterAtomic<$State, 'description', BuilderFn>
  }
>

interface BuilderFn extends HKT.Fn<State.Base<any>> {
  return: Builder<this['params']['members'], this['params']>
}

const create = BuilderKit.createBuilder<
  State.Base,
  BuilderFn,
  [members: Member[]]
>()((members) => {
  return {
    members,
  }
})({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as union, Builder as TypeBuilderUnion }
