import { Help } from '../Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../helpers.js'
import { Input } from '../Input/index.js'
import { ParameterSpec } from '../ParameterSpec/index.js'
import { Settings } from '../Settings/index.js'
import type { RawInputs, SomeArgsNormalized, State } from './types.js'

export const createState = (): State => {
  const state: State = {
    settings: {
      ...Settings.getDefaults(getLowerCaseEnvironment()),
    },
    parameterSpecInputs: {},
  }
  return state
}

export const execute = ({
  argInputs,
  settings,
  specInput,
}: {
  argInputs?: RawInputs | undefined
  specInput: ParameterSpec.SomeSpecInput
  settings: Settings.Normalized
}): SomeArgsNormalized => {
  const lineInputs = argInputs?.line ?? process.argv.slice(2)
  const environmentInputs = argInputs?.environment
    ? lowerCaseObjectKeys(argInputs.environment)
    : getLowerCaseEnvironment()
  const specs = ParameterSpec.parse(specInput, settings)
  // eslint-disable-next-line
  const result = Input.parse(specs, lineInputs, environmentInputs)
  // console.log({ result })
  const requiredParamsMissing = specs
    .filter((_) => !_.optional)
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
    process.stdout.write(Help.render(specs, settings) + `\n`)
    if (settings.onError === `exit`) process.exit(1)
    else throw new AggregateError(result.errors)
    return undefined as never // When testing we will reach this case
  }

  if ((settings.help && askedForHelp) || (settings.helpOnNoArguments && requiredParamsMissing.length > 0)) {
    process.stdout.write(Help.render(specs, settings) + `\n`)
    process.exit(0)
    return undefined as never // When testing we will reach this case
  }

  return result.args
}
