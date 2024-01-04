import type { Member } from '../../../Type/types/Scalars/Enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { HKT } from '../../../helpers.js'

interface Builder {
  state: {
    name: string
    resolve: null
    data: {
      members: BuilderKit.State.Values.Atom<State.Members>
      description: BuilderKit.State.Values.ValueString
    }
  }
  chain: ChainFn
  constructor: ConstructorFn
}

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
  return: ConstructorFnReturn<this['params']>
}

// prettier-ignore
type ConstructorFnReturn<$Params extends [State.Members]> =
  {
    members: $Params[0]
  }

const create = BuilderKit.createBuilder<Builder>()({
  name: `enumeration`,
  initialData: {
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

export { create as enumeration, Chain as TypeBuilderEnumeration }
