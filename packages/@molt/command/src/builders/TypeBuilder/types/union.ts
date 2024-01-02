import { Type } from '../../../Type/index.js'
import type { Assume, HKT } from '../../../helpers.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { TypeBuilderBoolean } from './boolean.js'
import type { TypeBuilderEnumeration } from './enumeration.js'
import type { TypeBuilderString } from './string.js'

// type TupleTypeBuildersToTypes<$Tuple extends Member[]> = {
//   [I in keyof $Tuple]: $Tuple[I] extends Member
//     ? PrivateData.Get<$Tuple[I]>['type']
//     : never
// }
interface Builder {
  state: {
    members: PrivateData.Values.Atomic<State.Members>
    description: PrivateData.Values.ValueString
  }
  chain: ChainFn
  resolve: ResolveFn
  constructor: ConstructorFn
}

interface ResolveFn extends HKT.Fn {
  return: Type.Union<this['params']['members']>
}

export namespace State {
  export type Members = readonly [State.Member, State.Member, ...State.Member[]]
  export type Member =
    | TypeBuilderBoolean
    | TypeBuilderString
    | TypeBuilderEnumeration
}

type Chain<$State extends Builder['state'] = Builder['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      description: BuilderKit.UpdaterAtomic<$State, 'description', ChainFn>
    }
  >

interface ChainFn extends HKT.Fn {
  return: Chain<Assume<this['params'], Builder['state']>>
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

const create = BuilderKit.createBuilder<Builder>()({
  initialState: {
    members: PrivateData.Values.unsetSymbol,
    description: PrivateData.Values.unsetSymbol,
  },
  resolve: (state) => {
    if (BuilderKit.valueIsUnset(state.members)) {
      throw new Error(`Union type must have at least one member`)
    }
    return Type.union({
      members_: state.members.map((_) => BuilderKit.State.get(_).resolve()),
      optionality: { _tag: `required` },
      description: BuilderKit.valueOrUndefined(state.description),
    })
  },
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

export { create as union, Chain as TypeBuilderUnion }
