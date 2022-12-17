import { Args } from '../../Args/index.js'
import { Help } from '../../Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import { ParameterSpec } from '../../ParameterSpec/index.js'
import { Settings } from '../../Settings/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import type { RawArgInputs, RootBuilder } from './types.js'

const create = () => {
  const $: State = {
    settings: {
      ...Settings.getDefaults(getLowerCaseEnvironment()),
    },
    parameterSpecInputs: {},
  }

  const $$ = {
    addParameterBasicOrUnion: (
      nameExpression: string,
      type: ParameterSpec.SomeBasicType | ParameterSpec.SomeUnionType
    ) => {
      const parameter = ParameterSpec.isUnionType(type)
        ? ({
            _tag: `Union`,
            type,
            nameExpression: nameExpression,
          } satisfies ParameterSpec.Input.Union)
        : ({
            _tag: `Basic`,
            type,
            nameExpression: nameExpression,
          } satisfies ParameterSpec.Input.Basic)
      $.parameterSpecInputs[nameExpression] = parameter
    },
  }

  const chain: InternalRootBuilder = {
    settings: (newSettings) => {
      Settings.change($.settings, newSettings)
      return chain
    },
    parameters: (parametersObject) => {
      Object.entries(parametersObject).forEach(([nameExpression, type]) => {
        $$.addParameterBasicOrUnion(nameExpression, type)
      })
      return chain
    },
    parameter: (nameExpression, type) => {
      $$.addParameterBasicOrUnion(nameExpression, type)

      return chain
    },
    parametersExclusive: (label, builderContainer) => {
      $.parameterSpecInputs[label] = builderContainer(ExclusiveBuilder.create() as any)._.input // eslint-disable-line
      return chain
    },
    parse: (argInputs) => {
      const testDebuggingNoExit = process.env[`testing_molt`] === `true`
      const argInputsLine = argInputs?.line ?? process.argv.slice(2)
      const argInputsEnvironment = argInputs?.environment
        ? lowerCaseObjectKeys(argInputs.environment)
        : getLowerCaseEnvironment()
      // todo handle concept of specs themselves having errors
      const specsResult = {
        specs: ParameterSpec.process($.parameterSpecInputs, $.settings),
      }
      const argsResult = Args.parse(specsResult.specs, argInputsLine, argInputsEnvironment)

      // eslint-disable-next-line
      // @ts-expect-error
      const askedForHelp = `help` in argsResult.args && argsResult.args.help === true

      if (askedForHelp) {
        process.stdout.write(Help.render(specsResult.specs, $.settings) + `\n`)
        if (!testDebuggingNoExit) process.exit(0)
        return undefined as never // When testing, with process.exit mock, we will reach this case
      }

      if (argsResult.errors.length > 0) {
        if ($.settings.helpOnError) {
          const message =
            `Cannot run command, you made some mistakes:\n\n` +
            argsResult.errors.map((_) => _.message).join(`\nX `) +
            `\n\nHere are the docs for this command:\n`
          process.stdout.write(message + `\n`)
          process.stdout.write(Help.render(specsResult.specs, $.settings) + `\n`)
        }
        if ($.settings.onError === `exit` && !testDebuggingNoExit) {
          process.exit(1)
          return undefined as never // When testing, with process.exit mock, we will reach this case
        }
        if (argsResult.errors.length > 1) throw new AggregateError(argsResult.errors)
        else throw argsResult.errors[0]!
      }

      if ($.settings.helpOnNoArguments && Object.values(argsResult.args).length === 0) {
        process.stdout.write(Help.render(specsResult.specs, $.settings) + `\n`)
        if (!testDebuggingNoExit) process.exit(0)
        throw new Error(`missing args`) // When testing, with process.exit mock, we will reach this case
      }

      return argsResult.args
    },
  }

  return chain
}

// prettier-ignore
// @ts-expect-error internal to external
export const createViaParametersExclusive: RootBuilder['parametersExclusive'] = (label, builderContainer) => create().parametersExclusive(label, builderContainer)

// prettier-ignore
// @ts-expect-error internal to external
export const createViaParameter: RootBuilder['parameter'] = (name, type) => create().parameter(name, type)

// prettier-ignore
// @ts-expect-error internal to external
export const createViaParameters: RootBuilder['parameters'] = (parametersObject) => create().parameters(parametersObject)

//
// Internal Types
//

type State = {
  settings: Settings.Output
  parameterSpecInputs: Record<string, ParameterSpec.Input>
}

type InternalRootBuilder = {
  settings: (newSettings: Settings.Input) => InternalRootBuilder
  parameters: (parametersObject: Record<string, ParameterSpec.SomeBasicType>) => InternalRootBuilder
  parameter: (nameExpression: string, type: ParameterSpec.SomeBasicType) => InternalRootBuilder
  parametersExclusive: (label: string, builderContainer: any) => InternalRootBuilder
  parse: (args: RawArgInputs) => object
}
