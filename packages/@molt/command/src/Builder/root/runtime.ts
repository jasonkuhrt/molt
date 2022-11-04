import { Args } from '../../Args/index.js'
import { Help } from '../../Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import { ParameterSpec } from '../../ParameterSpec/index.js'
import { Settings } from '../../Settings/index.js'
import * as ExclusiveBuilder from '../exclusive/constructor.js'
import type { RootBuilder } from './types.js'

type RuntimeState = {
  settings: Settings.Normalized
  parameterSpecInputs: ParameterSpec.SomeInputs
}

const create = () => {
  const _: RuntimeState = {
    settings: {
      ...Settings.getDefaults(getLowerCaseEnvironment()),
    },
    parameterSpecInputs: {},
  }

  const chain: RootBuilder = {
    settings: (newSettings) => {
      Settings.change(_.settings, newSettings)
      return chain as any
    },
    parameters: (parametersObject) => {
      Object.entries(parametersObject).forEach(([nameExpression, type]) => {
        chain.parameter(nameExpression as any, type)
      })
      return chain as any
    },
    parameter: (name, type) => {
      _.parameterSpecInputs[name] = ParameterSpec.Input.Basic.create({ type })
      // eslint-disable-next-line
      return chain as any
    },
    parametersExclusive: (label, builderContainer) => {
      _.parameterSpecInputs[label] = builderContainer(ExclusiveBuilder.create() as any)._.input
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
        specs: ParameterSpec.parse(_.parameterSpecInputs, _.settings),
      }
      // eslint-disable-next-line
      const argsResult = Args.parse(specsResult.specs, argInputsLine, argInputsEnvironment)
      // console.log({ argsResult })

      // eslint-disable-next-line
      // @ts-expect-error
      const askedForHelp = `help` in argsResult.args && argsResult.args.help === true

      if (askedForHelp) {
        process.stdout.write(Help.render(specsResult.specs, _.settings) + `\n`)
        if (!testDebuggingNoExit) process.exit(0)
        return undefined as never // When testing, with process.exit mock, we will reach this case
      }

      if (argsResult.errors.length > 0) {
        if (_.settings.helpOnError) {
          const message =
            `Cannot run command, you made some mistakes:\n\n` +
            argsResult.errors.map((_) => _.message).join(`\nX `) +
            `\n\nHere are the docs for this command:\n`
          process.stdout.write(message + `\n`)
          process.stdout.write(Help.render(specsResult.specs, _.settings) + `\n`)
        }
        if (_.settings.onError === `exit` && !testDebuggingNoExit) {
          process.exit(1)
          return undefined as never // When testing, with process.exit mock, we will reach this case
        }
        if (argsResult.errors.length > 1) throw new AggregateError(argsResult.errors)
        //eslint-disable-next-line
        else throw argsResult.errors[0]!
      }

      if (_.settings.helpOnNoArguments && Object.values(argsResult.args).length === 0) {
        process.stdout.write(Help.render(specsResult.specs, _.settings) + `\n`)
        if (!testDebuggingNoExit) process.exit(0)
        throw new Error(`missing args`) // When testing, with process.exit mock, we will reach this case
      }

      return argsResult.args
    },
  }

  return chain
}

// prettier-ignore
export const createViaParametersExclusive: RootBuilder['parametersExclusive'] = (label, builderContainer) => create().parametersExclusive(label, builderContainer)

// prettier-ignore
export const createViaParameter: RootBuilder['parameter'] = (name, type) => create().parameter(name,type)

// prettier-ignore
export const createViaParameters: RootBuilder['parameters'] = (parametersObject) => create().parameters(parametersObject)
