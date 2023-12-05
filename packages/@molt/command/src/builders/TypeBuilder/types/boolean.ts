import type { Type } from '../../../Type/index.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'

namespace State {
  export interface Base {
    type: Type.Boolean
    transformations: {}
    refinements: {}
  }
  export interface Initial {
    type: Type.Boolean
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
  }
  export const initial: Base = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
  }
}

export type TypeBooleanBuilder<$State extends State.Base = State.Base> =
  PrivateData.Set<$State, {}>

export const create = (): TypeBooleanBuilder<State.Initial> =>
  create_(State.initial) as any

const create_ = (state: State.Base): TypeBooleanBuilder => {
  return PrivateData.set(
    state,
    {} satisfies PrivateData.Remove<TypeBooleanBuilder>,
  )
}

export { create as boolean }
