import type { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

namespace State {
  export type Base = {
    type: PrivateData.Values.Type<Type.Boolean>
    description: PrivateData.Values.ValueString
  }

  export const initial: BuilderKit.State.RuntimeData<Base> = {
    description: BuilderKit.State.Values.unset,
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

export const create = BuilderKit.createBuilder<State.Base, BuilderFn, []>()()({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as boolean, Builder as TypeBuilderBoolean }
