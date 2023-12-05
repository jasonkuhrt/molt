import type { Type } from '../../../Type/index.js'
import type { Member } from '../../../Type/types/Scalars/Enumeration.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'

namespace State {
  export interface Base<$Members extends Member[] = any> {
    type: Type.Enumeration<$Members>
    transformations: {}
    refinements: {}
  }
  export interface Initial<$Members extends Member[] = any> {
    type: Type.Enumeration<$Members>
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
  }
  export const initial: Base<any> = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
  }
}

export type TypeEnumerationBuilder<$State extends State.Base = State.Base> =
  PrivateData.Set<$State, {}>

export const create = <
  $Member extends Member,
  $Members extends [$Member, ...$Member[]],
>(
  members: $Members,
): TypeEnumerationBuilder<State.Initial<$Members>> => create_(State.initial)

const create_ = <$Members extends Member[]>(
  state: State.Base<$Members>,
): TypeEnumerationBuilder<State.Base<$Members>> => {
  return PrivateData.set(
    state,
    {} satisfies PrivateData.Remove<
      TypeEnumerationBuilder<State.Base<$Members>>
    >,
  )
}

export { create as enum }
