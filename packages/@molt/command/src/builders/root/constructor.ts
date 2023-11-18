import type { CommandParameter } from '../../CommandParameter/index.js'
import { parse } from '../../executor/parse.js'
import type { SomeExtension } from '../../extension.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import type { ParameterInput } from '../../ParameterInput/index.js'
import { Settings } from '../../Settings/index.js'
import type { Type } from '../../Type/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import type { ParameterConfiguration, RawArgInputs, RootBuilder } from './types.js'

export const create = (): RootBuilder => {
  const $: State = {
    typeMapper: (type) => type as any,
    newSettingsBuffer: [],
    settings: null,
    parameterInputs: {},
  }

  const $$ = {
    addParameterBasic: (nameExpression: string, configuration: ParameterConfiguration) => {
      const prompt = configuration.prompt ?? null
      const type = $.typeMapper(configuration.type)
      const parameter = {
        _tag: `Basic`,
        type,
        nameExpression: nameExpression,
        prompt,
      } satisfies ParameterInput.Basic<any>
      $.parameterInputs[nameExpression] = parameter
    },
  }

  const chain: InternalRootBuilder = {
    use: (extension) => {
      $.typeMapper = extension.typeMapper as any // eslint-disable-line
      return chain
    },
    description: (description) => {
      $.newSettingsBuffer.push({
        description,
      })
      return chain
    },
    settings: (newSettings) => {
      $.newSettingsBuffer.push(newSettings)
      return chain
    },
    parameter: (nameExpression, typeOrConfiguration) => {
      const configuration = `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration } // prettier-ignore
      $$.addParameterBasic(nameExpression, configuration)

      return chain
    },
    parametersExclusive: (label, builderContainer) => {
      $.parameterInputs[label] = builderContainer(ExclusiveBuilder.create() as any)._.input // eslint-disable-line
      return chain
    },
    parse: (argInputs) => {
      const argInputsEnvironment = argInputs?.environment
        ? lowerCaseObjectKeys(argInputs.environment)
        : getLowerCaseEnvironment()
      $.settings = {
        ...Settings.getDefaults(argInputsEnvironment),
      }
      $.newSettingsBuffer.forEach((newSettings) =>
        Settings.change($.settings!, newSettings, argInputsEnvironment),
      )
      $.settings.typeMapper = $.typeMapper
      return parse($.settings, $.parameterInputs, argInputs)
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
