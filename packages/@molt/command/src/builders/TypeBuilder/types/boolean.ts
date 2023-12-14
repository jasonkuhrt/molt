import type { Type } from '../../../Type/index.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

namespace State {
  export type Base = {
    type: PrivateData.Values.Type<Type.Boolean>
    description: PrivateData.Values.ValueString
  }

  export const initial: BuilderKit.State.Initial<Base> = {
    description: BuilderKit.State.Values.unset,
  }
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
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

export const create = BuilderKit.createBuilder<State.Base, Builder>({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as boolean, Builder as TypeBuilderBoolean }
