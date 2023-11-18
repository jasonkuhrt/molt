import type { Pam } from '../../lib/Pam/index.js'
import type { ParameterInput } from '../../ParameterInput/index.js'
import type { State as CommandState } from '../command/constructor.js'
import type { SomeBuilderExclusiveInitial, State } from './types.js'

export const create = (commandState: CommandState): SomeBuilderExclusiveInitial => {
  const state: State = {
    input: {
      _tag: `Exclusive`,
      optionality: { _tag: `required` },
      parameters: [],
    } satisfies ParameterInput.Exclusive,
    typeState: undefined as any, // eslint-disable-line
  }
  return create_(commandState, state)
}

const create_ = (commandState: CommandState, state: State): SomeBuilderExclusiveInitial => {
  const chain: SomeBuilderExclusiveInitial = {
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

  return chain
}
