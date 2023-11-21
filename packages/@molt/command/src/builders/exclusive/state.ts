import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { BuilderCommandState } from '../command/state.js'

export const ExclusiveBuilderStateSymbol = Symbol(`ExclusiveBuilderState`)
export type ExclusiveBuilderStateSymbol = typeof ExclusiveBuilderStateSymbol

export type BuilderParameterExclusiveState<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> = ParameterExclusiveInput<$State> & { commandBuilderState: $State }

export const createState = (label: string): BuilderParameterExclusiveState => {
  return {
    label,
    _tag: `Exclusive`,
    optionality: { _tag: `required` },
    parameters: [],
    commandBuilderState: undefined as any, // eslint-disable-line
  }
}
