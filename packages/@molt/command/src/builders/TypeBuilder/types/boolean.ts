import type { Type } from '../../../Type/index.js'
import { createUpdater } from '../../../helpers.js'
import type { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

namespace State {
  export interface Base {
    type: Type.Boolean
    transformations: {}
    refinements: {}
    description: PrivateData.Values.DefineSimpleString
  }
  export interface Initial {
    type: Type.Boolean
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
    description: BuilderKit.Updater<$State, 'description', BuilderHKT<$State>>
  }
>

interface BuilderHKT<$State extends State.Base> extends HKT.Fn<$State> {
  return: Builder<this['params']>
}

export const create = (): Builder<State.Initial> =>
  create_(State.initial) as any

const create_ = (state: State.Base): Builder => {
  const updater = createUpdater({ state, createBuilder: create_ })

  const builder = PrivateData.set(state, {
    description: updater(`description`),
  } satisfies PrivateData.Unset<Builder>)

  return builder
}

export { create as boolean, Builder as TypeBuilderBoolean }
