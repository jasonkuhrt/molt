import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { HKT } from '../../../helpers.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import { Type } from '../../../Type/index.js'

interface Builder {
  state: {
    description: PrivateData.Values.ValueString
  }
  chain: ChainFn
  resolve: Type.Number
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

const create = BuilderKit.createBuilder<Builder>()({
  initialState: {
    description: PrivateData.Values.unsetSymbol,
  },
  resolve: (state) => {
    return Type.number({
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

export { create as number, Chain as TypeBuilderNumber }
