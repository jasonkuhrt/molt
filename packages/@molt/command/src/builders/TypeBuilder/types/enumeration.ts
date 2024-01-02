import type { Member } from '../../../Type/types/Scalars/Enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { Assume, HKT } from '../../../helpers.js'

export namespace State {
  export type Members = readonly [...Member[]]
}

type Chain<$State extends Builder['state'] = Builder['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      description: BuilderKit.UpdaterAtom<$State, 'description', ChainFn>
    }
  >

interface ChainFn extends HKT.Fn {
  return: Chain<this['params']>
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

interface Builder {
  state: {
    resolve: null
    data: {
      members: BuilderKit.State.Values.Atom<$Members>
      description: BuilderKit.State.Values.ValueString
    }
  }
  chain: ChainFn
  constructor: ConstructorFn
}
const create = BuilderKit.createBuilder<Builder>()({
  initialState: {
    members: BuilderKit.State.Values.unsetSymbol,
    description: BuilderKit.State.Values.unsetSymbol,
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

export { create as enumeration, Builder as TypeBuilderEnumeration }
