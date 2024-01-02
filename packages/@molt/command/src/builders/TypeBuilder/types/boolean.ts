import { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

interface Builder {
  state: {
    description: PrivateData.Values.ValueString
  }
  chain: ChainFn
  resolve: Type.Boolean
  constructor: null
}

type Chain<$State extends Builder['state'] = Builder['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      description: BuilderKit.UpdaterAtomic<$State, 'description', ChainFn>
    }
  >

interface ChainFn extends HKT.Fn {
  return: Chain<this['params']>
}

export const create = BuilderKit.createBuilder<Builder>()({
  initialState: {
    description: BuilderKit.State.Values.unset,
  },
  resolve: (state) => {
    return Type.boolean({
      optionality: { _tag: `required` },
      description: BuilderKit.valueOrUndefined(state.description),
    })
  },
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as boolean, Chain as TypeBuilderBoolean }
