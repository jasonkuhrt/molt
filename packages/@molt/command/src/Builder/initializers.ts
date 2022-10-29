import type { ParameterSpec } from '../ParameterSpec/index.js'
import { Settings } from '../Settings/index.js'
import { createState, execute } from './core.js'
import type { Builder, BuilderParameters } from './types.js'

// eslint-disable-next-line
export const initializeViaParametersExclusive: Builder<{
  Parameters: {}
  ParametersExclusive: {}
}>['parametersExclusive'] = (label, builder) => {
  const state = createState()

  // eslint-disable-next-line
  const chain: Builder<{
    Parameters: {}
    parametersExclusive: {}
  }> = {
    settings: (newSettings) => {
      Settings.change(state.settings, newSettings)
      return chain
    },
    parse: (argInputs) => {
      return execute({
        argInputs,
        specInput: state.parameterSpecInputs,
        settings: state.settings,
      })
    },
    parameter: (name, type) => {
      state.parameterSpecInputs[name] = type
      // eslint-disable-next-line
      return chain as any
    },
    parametersExclusive: (label, builder) => {
      state.parameterSpecInputs = {
        ...state.parameterSpecInputs,
        ...builder(),
      }
    },
  }

  return chain.parametersExclusive(label, builder)
}

// eslint-disable-next-line
export const initializeViaParameter: Builder<{
  Parameters: {}
  ParametersExclusive: {}
}>['parameter'] = (name, type) => {
  const state = createState()

  // eslint-disable-next-line
  const chain: Builder<{ Parameters: {} }> = {
    settings: (newSettings) => {
      Settings.change(state.settings, newSettings)
      return chain
    },
    parse: (argInputs) => {
      return execute({
        argInputs,
        specInput: state.parameterSpecInputs,
        settings: state.settings,
      })
    },
    parameter: (name, type) => {
      state.parameterSpecInputs[name] = type
      // eslint-disable-next-line
      return chain as any
    },
    parametersExclusive: (label, builder) => {
      state.parameterSpecInputs = {
        ...state.parameterSpecInputs,
        ...builder(),
      }
    },
  }

  return chain.parameter(name, type)
}

// prettier-ignore
export const initializeViaParameters = <Schema extends ParameterSpec.SomeSpecInput>(schema: Schema): BuilderParameters<Schema> => {
  const state = createState()
  state.parameterSpecInputs = schema

  const chain = {
    settings: (newSettings) => {
      Settings.change(state.settings, newSettings)
      return chain
    },
    parse: (argInputs) => {
      return execute({
        argInputs,
        specInput: state.parameterSpecInputs,
        settings: state.settings,
      })
    },
    schema,
  } as BuilderParameters<Schema>

  return chain
}
