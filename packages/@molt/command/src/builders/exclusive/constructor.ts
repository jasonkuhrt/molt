import type { Pam } from '../../lib/Pam/index.js'
import type { BuilderCommandState } from '../command/state.js'
import type { BuilderParameterExclusiveState } from './state.js'
import { createState, ExclusiveBuilderStateSymbol } from './state.js'
import type { SomeBuilderExclusiveInitial } from './types.js'

export const create = (label: string, commandState: BuilderCommandState): SomeBuilderExclusiveInitial => {
  return create_(commandState, createState(label))
}

const create_ = (
  commandState: BuilderCommandState,
  state: BuilderParameterExclusiveState,
): SomeBuilderExclusiveInitial => {
  const builder: SomeBuilderExclusiveInitial = {
    [ExclusiveBuilderStateSymbol]: state,
    parameter: (nameExpression: string, typeOrConfiguration) => {
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration } //  prettier-ignore
      const newState = {
        ...state,
        parameters: [
          ...state.parameters,
          {
            nameExpression,
            type: commandState.typeMapper(configuration.type),
          },
        ],
      }
      return create_(commandState, newState)
    },
    optional: () => {
      const newState = {
        ...state,
        optionality: { _tag: `optional` as const },
      }
      return create_(commandState, newState)
    },
    default: (tag: string, value: Pam.Value) => {
      const newState = {
        ...state,
        optionality: { _tag: `default` as const, tag, value },
      }
      return create_(commandState, newState)
    },
    // _: state,
  }

  return builder
}
