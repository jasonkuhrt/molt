import { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

interface Builder {
  state: {
    name: string
    resolve: Type.Boolean
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

interface ChainFn extends BuilderKit.Fn<Builder['state'], Chain> {
  return: Chain<this['params']>
}

export const create = BuilderKit.createBuilder<Builder>()({
  name: `boolean`,
  initialData: {
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
