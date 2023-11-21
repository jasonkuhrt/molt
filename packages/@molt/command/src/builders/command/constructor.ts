import { parse } from '../../executor/parse.js'
import type { SomeExtension } from '../../extension.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import type { ParameterBasicInput } from '../../Parameter/basic.js'
import { Settings } from '../../Settings/index.js'
import type { Type } from '../../Type/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import { ExclusiveBuilderStateSymbol } from '../exclusive/state.js'
import type { BuilderCommandState } from './state.js'
import { createState } from './state.js'
import type { CommandBuilder, ParameterConfiguration, RawArgInputs } from './types.js'

export const create = (): CommandBuilder => {
  return create_(createState())
}

const create_ = (state: BuilderCommandState): CommandBuilder => {
  const builder: InternalRootBuilder = {
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
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration }
      const prompt = configuration.prompt ?? null
      const type = state.typeMapper(configuration.type)
      const parameter = {
        _tag: `Basic`,
        type,
        nameExpression,
        prompt: prompt as any, // eslint-disable-line
      } satisfies ParameterBasicInput
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
      const exclusiveBuilderState = builderContainer(ExclusiveBuilder.create(label, state))[ExclusiveBuilderStateSymbol] // eslint-disable-line
      const newState = {
        ...state,
        parameterInputs: {
          ...state.parameterInputs,
          [label]: exclusiveBuilderState, // eslint-disable-line
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
        Settings.change(state.settings!, newSettings, argInputsEnvironment)
      )
      state.settings.typeMapper = state.typeMapper
      return parse(state.settings, state.parameterInputs, argInputs)
    },
  }

  return builder as any
}

//
// Internal Types
//

interface Parameter {
  (nameExpression: string, type: Type.Type): InternalRootBuilder
  (nameExpression: string, configuration: ParameterConfiguration): InternalRootBuilder
}

interface InternalRootBuilder {
  use: (extension: SomeExtension) => InternalRootBuilder
  description: (description: string) => InternalRootBuilder
  settings: (newSettings: Settings.Input) => InternalRootBuilder
  parameter: Parameter
  parametersExclusive: (label: string, builderContainer: any) => InternalRootBuilder
  parse: (args: RawArgInputs) => object
}
