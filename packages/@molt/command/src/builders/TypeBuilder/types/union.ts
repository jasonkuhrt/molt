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
    members: PrivateData.Values.Atomic<$Members>
    description: PrivateData.Values.ValueString
  }
  export const initial: BuilderKit.State.RuntimeData<Base> = {
    members: PrivateData.Values.unsetSymbol,
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<$State, 'description', BuilderFn>
  }
>

interface BuilderFn extends HKT.Fn<State.Base<any>> {
  return: Builder<this['params']>
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
