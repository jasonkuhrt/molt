import { Type } from '../../../Type/index.js'
import type { HKT } from '../../../helpers.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { TypeBuilderBoolean } from './boolean.js'
import type { TypeBuilderNumber } from './number.js'
import type { TypeBuilderString } from './string.js'

interface Builder {
  state: {
    name: string
    resolve: ResolveFn
    data: {
      members: BuilderKit.State.Values.Atom<State.Members>
      description: BuilderKit.State.Values.ValueString
    }
  }
  chain: ChainFn
  constructor: ConstructorFn
}

// prettier-ignore
interface ResolveFn extends HKT.Fn {
  return: Type.Union<MapMembers<BuilderKit.State.Values.ExcludeUnset<BuilderKit.State.ToRuntime<this['params']>['data']['members']>>>
}

type MapMembers<Members> = {
  [I in keyof Members]: HKT.CallOrReturn<
    BuilderKit.State.Get<Members[I]>['resolve'],
    BuilderKit.State.Get<Members[I]>['data']
  >
}

export namespace State {
  export type Member =
    | TypeBuilderBoolean
    | TypeBuilderString
    | TypeBuilderNumber
  // | TypeBuilderEnumeration
  export type Members = readonly [State.Member, ...State.Member[]]
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

// interface ConstructorFn extends HKT.Fn<[members: State.Members]> {
interface ConstructorFn extends HKT.Fn {
  paramsConstraint: [members: State.Members]
  return: ConstructorFnReturn<this['params']>
}

// prettier-ignore
type ConstructorFnReturn<$Params extends [members: State.Members]> =
  {
    members: $Params[0]
  }

const create = BuilderKit.createBuilder<Builder>()({
  name: `union`,
  initialData: {
    members: BuilderKit.State.Values.unsetSymbol,
    description: BuilderKit.State.Values.unsetSymbol,
  },
  resolve: (state) => {
    if (BuilderKit.valueIsUnset(state.members)) {
      throw new Error(`Union type must have at least one member`)
    }
    const members = state.members.map((_) => BuilderKit.State.get(_).resolve()) as any as readonly [Type.Boolean|Type.String, ...(Type.Boolean|Type.String)[]] // prettier-ignore
    const x = Type.union({
      members_: members,
      optionality: { _tag: `required` },
      description: BuilderKit.valueOrUndefined(state.description),
    })

    return x
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
