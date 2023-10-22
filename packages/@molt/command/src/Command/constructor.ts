import type { CommandParameter } from '../CommandParameter/index.js'
import { parse } from '../executor/parse.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../helpers.js'
import type { Parameter } from '../Parameter/Parameter.js'
import { type Parameter as P } from '../Parameter/Parameter.js'
import { Settings } from '../Settings/index.js'
import * as ExclusiveBuilder from './exclusive/constructor.js'
import type { ParameterConfiguration, RawArgInputs, RootBuilder } from './root/types.js'

export const create = (): RootBuilder => {
  const $: State = {
    parameterBasics: [],
    newSettingsBuffer: [],
    settings: null,
    parameterSpecInputs: {},
  }

  // const $$ = {
  //   addParameterBasic: (nameExpression: string, configuration: ParameterConfiguration) => {
  //     const prompt = configuration.prompt ?? null
  //     const parameter = {
  //       _tag: `Basic`,
  //       type: configuration.schema,
  //       nameExpression: nameExpression,
  //       prompt,
  //     } satisfies CommandParameter.Input.Basic
  //     $.parameterSpecInputs[nameExpression] = parameter
  //   },
  // }

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
    parameter: (
      ...args:
        | [
            nameExpression: string,
            typeOrConfiguration: CommandParameter.SomeBasicType | ParameterConfiguration,
          ]
        | [Parameter.Builder]
    ) => {
      if (args.length === 1) {
        const [builder] = args
        $.parameterBasics.push(builder)
        // const s = ParameterInternal.getBuilderState(builder)
        // if (!s.name) throw new Error(`Parameter name is required`)
        // $$.addParameterBasic(s.name, { schema: z.string() })
      } else {
        const [nameExpression, typeOrConfiguration] = args
        const configuration =
          `schema` in typeOrConfiguration ? typeOrConfiguration : { schema: typeOrConfiguration }
        $$.addParameterBasic(nameExpression, configuration)
      }

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
  parameterBasics: Parameter.Builder[]
  settings: null | Settings.Output
  newSettingsBuffer: Settings.Input[]
  parameterSpecInputs: Record<string, CommandParameter.Input>
}

interface Parameter {
  (builder: P.Builder<any>): InternalRootBuilder
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
