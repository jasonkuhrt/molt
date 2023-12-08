import type { Type } from '../../../Type/index.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'

namespace State {
  export interface Base {
    type: Type.Number
    transformations: {}
    refinements: {}
  }
  export interface Initial {
    type: Type.Number
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
  }
  export const initial: Base = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
  }
}

export type TypeNumberBuilder<$State extends State.Base = State.Base> =
  PrivateData.Set<$State, {}>

export const create = (): TypeNumberBuilder<State.Initial> =>
  create_(State.initial) as any

const create_ = (state: State.Base): TypeNumberBuilder => {
  return PrivateData.set(
    state,
    {} satisfies PrivateData.Remove<TypeNumberBuilder>,
  )
}

export { create as number }
