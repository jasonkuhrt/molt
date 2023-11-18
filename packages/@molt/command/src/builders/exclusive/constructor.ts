import type { Pam } from '../../lib/Pam/index.js'
import type { ParameterInput } from '../../ParameterInput/index.js'
import type { InternalState, SomeBuilderExclusiveInitial } from './types.js'

export const create = (): SomeBuilderExclusiveInitial => {
  const state: InternalState = {
    input: {
      _tag: `Exclusive`,
      optionality: { _tag: `required` },
      parameters: [],
    } satisfies ParameterInput.Exclusive,
    typeState: undefined as any, // eslint-disable-line
  }
  return create_(state)
}

const create_ = (state: InternalState): SomeBuilderExclusiveInitial => {
  const chain: SomeBuilderExclusiveInitial = {
    parameter: (nameExpression: string, typeOrConfiguration) => {
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration } //  prettier-ignore
      const newState = {
        ...state,
        input: {
          ...state.input,
          parameters: [...state.input.parameters, { nameExpression, type: configuration.type }],
        },
      }
      return create_(newState)
    },

    optional: () => {
      const newState = {
        ...state,
        input: {
          ...state.input,
          optionality: { _tag: `optional` as const },
        },
      }
      return create_(newState)
    },
    default: (tag: string, value: Pam.Value) => {
      const newState = {
        ...state,
        input: {
          ...state.input,
          optionality: { _tag: `default` as const, tag, value },
        },
      }
      return create_(newState)
    },
    _: state,
  }

  return chain
}
