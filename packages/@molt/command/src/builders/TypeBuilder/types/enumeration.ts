import type { Member } from '../../../Type/types/Scalars/Enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { Assume, HKT } from '../../../helpers.js'

export namespace State {
  export type Members = readonly [...Member[]]
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

// TODO when putting a non-unknown constraint on params parameter it leads to HKT calls doing an interesection ... why?
interface BuilderFn extends HKT.Fn<PrivateData.Data> {
  // @ts-expect-error todo
  return: Builder<this['params']>
}

interface ConstructorFn extends HKT.Fn {
  paramsConstraint: [members: State.Members]
  return: ConstructorFnReturn<Assume<this['params'], [State.Members]>>
}

// prettier-ignore
type ConstructorFnReturn<$Params extends [State.Members]> =
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

export { create as enumeration, Builder as TypeBuilderEnumeration }
