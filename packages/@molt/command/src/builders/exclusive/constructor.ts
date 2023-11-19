import type { Pam } from '../../lib/Pam/index.js'
import type { BuilderCommandState } from '../command/state.js'
import type { BuilderParameterExclusiveState } from './state.js'
import { createState } from './state.js'
import type { SomeBuilderExclusiveInitial } from './types.js'

export const create = (label: string, commandState: BuilderCommandState): SomeBuilderExclusiveInitial => {
  return create_(commandState, createState(label))
}

const create_ = (
  commandState: BuilderCommandState,
  state: BuilderParameterExclusiveState,
): SomeBuilderExclusiveInitial => {
  const builder: SomeBuilderExclusiveInitial = {
    parameter: (nameExpression: string, typeOrConfiguration) => {
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration } //  prettier-ignore
      const newState = {
        ...state,
        input: {
          ...state.input,
          parameters: [
            ...state.input.parameters,
            {
              nameExpression,
              type: commandState.typeMapper(configuration.type),
            },
          ],
        },
      }
      return create_(commandState, newState)
    },

    optional: () => {
      const newState = {
        ...state,
        input: {
          ...state.input,
          optionality: { _tag: `optional` as const },
        },
      }
      return create_(commandState, newState)
    },
    default: (tag: string, value: Pam.Value) => {
      const newState = {
        ...state,
        input: {
          ...state.input,
          optionality: { _tag: `default` as const, tag, value },
        },
      }
      return create_(commandState, newState)
    },
    _: state,
  }

  return builder
}
