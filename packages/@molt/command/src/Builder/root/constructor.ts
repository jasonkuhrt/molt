import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import { CommandParameter } from '../../CommandParameter/index.js'
import { parse } from '../../parse/parse.js'
import { Settings } from '../../Settings/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import type { ParameterConfiguration, RawArgInputs, RootBuilder } from './types.js'

export const create = (): RootBuilder => {
  const $: State = {
    newSettingsBuffer: [],
    settings: null,
    parameterSpecInputs: {},
  }

  const $$ = {
    addParameterBasicOrUnion: (nameExpression: string, configuration: ParameterConfiguration) => {
      const prompt = configuration.prompt ?? null
      const parameter = CommandParameter.isUnionType(configuration.schema)
        ? ({
            _tag: `Union`,
            type: configuration.schema,
            nameExpression: nameExpression,
          } satisfies CommandParameter.Input.Union)
        : ({
            _tag: `Basic`,
            type: configuration.schema,
            nameExpression: nameExpression,
            prompt,
          } satisfies CommandParameter.Input.Basic)
      $.parameterSpecInputs[nameExpression] = parameter
    },
  }

  const chain: InternalRootBuilder = {
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
      const configuration =
        `schema` in typeOrConfiguration ? typeOrConfiguration : { schema: typeOrConfiguration }
      $$.addParameterBasicOrUnion(nameExpression, configuration)

      return chain
    },
    parametersExclusive: (label, builderContainer) => {
      $.parameterSpecInputs[label] = builderContainer(ExclusiveBuilder.create() as any)._.input // eslint-disable-line
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
      return parse($.settings, $.parameterSpecInputs, argInputs)
    },
  }

  return chain as any
}

//
// Internal Types
//

interface State {
  settings: null | Settings.Output
  newSettingsBuffer: Settings.Input[]
  parameterSpecInputs: Record<string, CommandParameter.Input>
}

interface Parameter {
  (nameExpression: string, type: CommandParameter.SomeBasicType): InternalRootBuilder
  (nameExpression: string, configuration: ParameterConfiguration): InternalRootBuilder
}

// prettier-ignore
interface InternalRootBuilder {
  description: (description: string) => InternalRootBuilder
  settings: (newSettings: Settings.Input) => InternalRootBuilder
  parameter: Parameter
  parametersExclusive: (label: string, builderContainer: any) => InternalRootBuilder
  parse: (args: RawArgInputs) => object
}
