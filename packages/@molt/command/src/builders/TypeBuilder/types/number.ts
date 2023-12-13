import type { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { HKT } from '../../../helpers.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'

namespace State {
  export interface Base {
    type: Type.Number
    transformations: {}
    refinements: {}
    description: PrivateData.Values.ValueString
  }
  export interface Initial {
    type: Type.Number
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
    description: PrivateData.Values.UnsetSymbol
  }
  export const initial: Base = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = PrivateData.SetupHost<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<
      $State,
      'description',
      BuilderHKT<$State>
    >
  }
>

interface BuilderHKT<$State extends State.Base> extends HKT.Fn<$State> {
  return: Builder<this['params']>
}

const create = BuilderKit.createBuilder<State.Initial, Builder>({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as number, Builder as TypeBuilderNumber }
