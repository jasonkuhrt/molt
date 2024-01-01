import type { Assume, HKT } from '../../../helpers.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { TypeBuilderBoolean } from './boolean.js'
import type { TypeBuilderEnumeration } from './enumeration.js'
import type { TypeBuilderNumber } from './number.js'
import type { TypeBuilderString } from './string.js'

// type TupleTypeBuildersToTypes<$Tuple extends Member[]> = {
//   [I in keyof $Tuple]: $Tuple[I] extends Member
//     ? PrivateData.Get<$Tuple[I]>['type']
//     : never
// }

export namespace State {
  export type Members = readonly [State.Member, State.Member, ...State.Member[]]
  export type Member =
    | TypeBuilderBoolean
    | TypeBuilderEnumeration
    | TypeBuilderNumber
    | TypeBuilderString
  export type Base<$Members extends Members = Members> = {
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

interface BuilderFn extends HKT.Fn {
  return: Builder<Assume<this['params'], State.Base>>
}

// interface ConstructorFn extends HKT.Fn<[members: State.Members]> {
interface ConstructorFn extends HKT.Fn {
  paramsConstraint: [members: State.Members]
  return: ConstructorFnReturn<Assume<this['params'], [members: State.Members]>>
}

// prettier-ignore
type ConstructorFnReturn<$Params extends [members: State.Members]> =
  {
    members: $Params[0]
  }

const create = BuilderKit.createBuilder<State.Base, BuilderFn, ConstructorFn>()(
  {
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
  },
)

export { create as union, Builder as TypeBuilderUnion }
