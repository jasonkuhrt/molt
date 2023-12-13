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

export const create = BuilderKit.createBuilder<State.Base>({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

// export const create = (): Builder<State.Base> => create_(State.initial) as any

// const create_ = (state: BuilderKit.State.Initial<State.Base>): Builder => {
//   const $state = state as any as State.Base
//   const updater = BuilderKit.createUpdater({
//     state: $state,
//     createBuilder: create_,
//   })

//   const builder = PrivateData.set(state, {
//     description: updater(`description`),
//   } satisfies PrivateData.Unset<Builder>)

//   return builder
// }

export { create as boolean, Builder as TypeBuilderBoolean }
