import { Alge } from 'alge'
import console from 'console'
import { Help } from '../../Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../../helpers.js'
import { Input } from '../../Input/index.js'
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
      return chain
    },
    parameter: (name, type) => {
      _.parameterSpecInputs[name] = ParameterSpec.Input.Basic.create({ type })
      // eslint-disable-next-line
      return chain as any
    },
    parametersExclusive: (label, builderContainer) => {
      _.parameterSpecInputs[label] = builderContainer(ExclusiveBuilder.create())._.input
      return chain
    },
    parse: (argInputs) => {
      const lineInputs = argInputs?.line ?? process.argv.slice(2)
      const environmentInputs = argInputs?.environment
        ? lowerCaseObjectKeys(argInputs.environment)
        : getLowerCaseEnvironment()
      const specs = ParameterSpec.parse(_.parameterSpecInputs, _.settings)
      // eslint-disable-next-line
      const result = Input.parse(specs, lineInputs, environmentInputs)
      // console.log({ result })
      const requiredParamsMissing = specs
        .filter((_) =>
          Alge.match(_)
            .Basic((_) => !_.optional)
            .Exclusive((_) => !_.group.optional)
        )
        .filter((_) => result.args[_.name.canonical] === undefined)

      // eslint-disable-next-line
      // @ts-expect-error
      const askedForHelp = `help` in result.args && result.args.help === true

      if (result.errors.length > 0 && !askedForHelp) {
        const errors =
          `Cannot run command, you made some mistakes:\n\n` +
          result.errors.map((_) => _.message).join(`\nX `) +
          `\n\nHere are the docs for this command:\n`
        process.stdout.write(errors + `\n`)
        process.stdout.write(Help.render(specs, _.settings) + `\n`)
        if (_.settings.onError === `exit`) process.exit(1)
        else throw new AggregateError(result.errors)
        return undefined as never // When testing we will reach this case
      }

      if (
        (_.settings.help && askedForHelp) ||
        (_.settings.helpOnNoArguments && requiredParamsMissing.length > 0)
      ) {
        process.stdout.write(Help.render(specs, _.settings) + `\n`)
        process.exit(0)
        return undefined as never // When testing we will reach this case
      }

      return result.args
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
