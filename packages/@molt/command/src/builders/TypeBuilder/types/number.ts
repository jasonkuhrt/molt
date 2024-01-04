import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { HKT } from '../../../helpers.js'
import { Type } from '../../../Type/index.js'

interface Builder {
  state: {
    name: string
    resolve: Type.Number
    data: {
      description: BuilderKit.State.Values.ValueString
    }
  }
  chain: ChainFn
  constructor: null
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

const create = BuilderKit.createBuilder<Builder>()({
  name: `number`,
  initialData: {
    description: BuilderKit.State.Values.unsetSymbol,
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
