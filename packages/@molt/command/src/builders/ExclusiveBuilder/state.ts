import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { BuilderCommandState } from '../CommandBuilder/state.js'

export type BuilderParameterExclusiveState<
  $State extends BuilderCommandState.Base = BuilderCommandState.Initial,
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
