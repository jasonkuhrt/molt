import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { Optionality } from '../../Type/helpers.js'
import type { PrivateData } from '../../lib/PrivateData/delete me.js'
import type { Chain } from '../CommandBuilder/chain.js'
import type { BuilderCommandState } from '../CommandBuilder/stateOld.js'

export type BuilderParameterExclusiveState<
  $State extends BuilderCommandState.Base = BuilderCommandState.Initial,
> = ParameterExclusiveInput<$State> & { commandBuilderState: $State }

export namespace State {
  export interface Base {
    commandBuilder: Chain
    label: PrivateData.Values.ValueString
    optionality: PrivateData.Values.Atomic<Optionality>
    parameters: []
  }
}

export const createState = (label: string): BuilderParameterExclusiveState => {
  return {
    label,
    _tag: `Exclusive`,
    optionality: { _tag: `required` },
    parameters: [],
    commandBuilderState: undefined as any, // eslint-disable-line
  }
}
