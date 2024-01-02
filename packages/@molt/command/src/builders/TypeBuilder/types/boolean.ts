import { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { Assume, HKT } from '../../../helpers.js'

interface Builder2 {
  state: {
    description: PrivateData.Values.ValueString
  }
  chain: ChainFn
  resolve: Type.Boolean
  constructor: null
}

type Chain<$State extends Builder2['state'] = Builder2['state']> =
  BuilderKit.State.Setup<
    $State,
    {
      description: BuilderKit.UpdaterAtomic<$State, 'description', ChainFn>
    }
  >

interface ChainFn extends HKT.Fn {
  return: Chain<Assume<this['params'], Builder2['state']>>
}

export const create = BuilderKit.createBuilder<Builder2>()({
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
