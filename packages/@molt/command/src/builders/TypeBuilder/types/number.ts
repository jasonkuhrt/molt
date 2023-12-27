import type { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { HKT } from '../../../helpers.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'

namespace State {
  export type Base = {
    type: PrivateData.Values.Type<Type.Number>
    description: PrivateData.Values.ValueString
  }
  export const initial: BuilderKit.State.RuntimeData<Base> = {
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<$State, 'description', BuilderFn>
  }
>

interface BuilderFn extends HKT.Fn<State.Base> {
  return: Builder<this['params']>
}

const create = BuilderKit.createBuilder<State.Base, BuilderFn, []>()()({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as number, Builder as TypeBuilderNumber }
