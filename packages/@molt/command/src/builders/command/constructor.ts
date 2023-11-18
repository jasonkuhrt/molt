import type { CommandParameter } from '../../CommandParameter/index.js'
import { parse } from '../../executor/parse.js'
import type { SomeExtension } from '../../extension.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import type { ParameterInput } from '../../ParameterInput/index.js'
import { Settings } from '../../Settings/index.js'
import type { Type } from '../../Type/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import type { CommandBuilder, ParameterConfiguration, RawArgInputs } from './types.js'

export const create = (): CommandBuilder => {
  const state: State = {
    typeMapper: (type) => type as any,
    newSettingsBuffer: [],
    settings: null,
    parameterInputs: {},
  }
  return create_(state)
}

const create_ = (state: State): CommandBuilder => {
  const chain: InternalRootBuilder = {
    use: (extension) => {
      const newState = {
        ...state,
        typeMapper: extension.typeMapper,
      }
      return create_(newState) as any
    },
    description: (description) => {
      const newState = {
        ...state,
        newSettingsBuffer: [
          ...state.newSettingsBuffer,
          {
            description,
          },
        ],
      }
      return create_(newState) as any
    },
    settings: (newSettings) => {
      const newState = {
        ...state,
        newSettingsBuffer: [...state.newSettingsBuffer, newSettings],
      }
      return create_(newState) as any
    },
    parameter: (nameExpression, typeOrConfiguration) => {
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration } // prettier-ignore
      const prompt = configuration.prompt ?? null
      const type = state.typeMapper(configuration.type)
      const parameter = {
        _tag: `Basic`,
        type,
        nameExpression: nameExpression,
        prompt,
      } satisfies ParameterInput.Basic<any>
      const newState = {
        ...state,
        parameterInputs: {
          ...state.parameterInputs,
          [nameExpression]: parameter,
        },
      }
      return create_(newState) as any
    },
    parametersExclusive: (label, builderContainer) => {
      const newState = {
        ...state,
        parameterInputs: {
          ...state.parameterInputs,
          [label]: builderContainer(ExclusiveBuilder.create() as any)._.input, // eslint-disable-line
        },
      }
      return create_(newState) as any
    },
    parse: (argInputs) => {
      const argInputsEnvironment = argInputs?.environment
        ? lowerCaseObjectKeys(argInputs.environment)
        : getLowerCaseEnvironment()
      state.settings = {
        ...Settings.getDefaults(argInputsEnvironment),
      }
      state.newSettingsBuffer.forEach((newSettings) =>
        Settings.change(state.settings!, newSettings, argInputsEnvironment),
      )
      state.settings.typeMapper = state.typeMapper
      return parse(state.settings, state.parameterInputs, argInputs)
    },
  }

  return chain as any
}

//
// Internal Types
//

interface State {
  typeMapper: (value: unknown) => Type.Type
  settings: null | Settings.Output
  newSettingsBuffer: Settings.Input[]
  parameterInputs: Record<string, CommandParameter.Input<any>>
}

interface Parameter {
  (nameExpression: string, type: Type.Type): InternalRootBuilder
  (nameExpression: string, configuration: ParameterConfiguration): InternalRootBuilder
}

// prettier-ignore
interface InternalRootBuilder {
  use: (extension:SomeExtension) => InternalRootBuilder
  description: (description: string) => InternalRootBuilder
  settings: (newSettings: Settings.Input) => InternalRootBuilder
  parameter: Parameter
  parametersExclusive: (label: string, builderContainer: any) => InternalRootBuilder
  parse: (args: RawArgInputs) => object
}
