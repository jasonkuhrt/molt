import { Args } from './Args/index.js'
import type { RawArgInputs } from './Builder/root/types.js'
import { ErrorMissingArgument } from './Errors/Errors.js'
import { Errors } from './Errors/index.js'
import { Help } from './Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from './helpers.js'
import type { Settings } from './index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import { prompt } from './prompt.js'
import * as ReadLineSync from 'readline-sync'

export const parse = (
  settings: Settings.Output,
  parameterSpecInputs: Record<string, ParameterSpec.Input>,
  argInputs: RawArgInputs
) => {
  const testDebuggingNoExit = process.env[`testing_molt`] === `true`
  const argInputsTTY =
    argInputs?.tty ??
    (process.stdout.isTTY
      ? {
          write: console.log,
          read: (params) => ReadLineSync.question(params.prompt),
        }
      : null)
  const argInputsLine = argInputs?.line ?? process.argv.slice(2)
  const argInputsEnvironment = argInputs?.environment
    ? lowerCaseObjectKeys(argInputs.environment)
    : getLowerCaseEnvironment()

  // todo handle concept of specs themselves having errors
  const specsResult = {
    specs: ParameterSpec.process(parameterSpecInputs, settings),
  }

  // dump(specsResult)
  const argsResult = Args.parse(specsResult.specs, argInputsLine, argInputsEnvironment)
  let prompts: ParameterSpec.Output[] = []
  if (argInputsTTY && argsResult.errors.length > 0) {
    const [errorsToPrompt, errors] = partition(argsResult.errors, (error) => {
      if (
        error instanceof Errors.ErrorMissingArgumentForMutuallyExclusiveParameters ||
        error instanceof Errors.ErrorArgsToMultipleMutuallyExclusiveParameters ||
        error instanceof Errors.ErrorDuplicateFlag ||
        error instanceof Errors.ErrorUnknownFlag
      )
        return false
      if (
        error instanceof ErrorMissingArgument &&
        error.spec._tag === `Basic` &&
        error.spec.prompt !== null
      ) {
        return error.spec.prompt
      }
      const found = settings.defaults.prompt.conditional.find((_) =>
        _.when({
          parameter: error.spec._tag === `Exclusive` ? error.spec.group : error.spec,
          error,
        })
      )
      if (found) {
        return found.enabled
      }
      return settings.defaults.prompt.constant.enabled
    }) as any as [
      (Errors.ErrorInvalidArgument | Errors.ErrorMissingArgument)[],
      (
        | Errors.ErrorArgsToMultipleMutuallyExclusiveParameters
        | Errors.ErrorMissingArgumentForMutuallyExclusiveParameters
        | Errors.ErrorArgsToMultipleMutuallyExclusiveParameters
      )[]
    ]
    argsResult.errors = errors
    prompts = errorsToPrompt.map((_) => _.spec)
  }
  // dump(argsResult)

  // eslint-disable-next-line
  // @ts-expect-error
  const askedForHelp = `help` in argsResult.args && argsResult.args.help === true

  if (askedForHelp) {
    settings.onOutput(Help.render(specsResult.specs, settings) + `\n`)
    if (!testDebuggingNoExit) process.exit(0)
    return undefined as never // When testing, with process.exit mock, we will reach this case
  }

  if (argsResult.errors.length > 0) {
    if (settings.helpOnError) {
      const message =
        `Cannot run command, you made some mistakes:\n\n` +
        argsResult.errors.map((_) => _.message).join(`\nX `) +
        `\n\nHere are the docs for this command:\n`
      settings.onOutput(message + `\n`)
      settings.onOutput(Help.render(specsResult.specs, settings) + `\n`)
    }
    if (settings.onError === `exit` && !testDebuggingNoExit) {
      process.exit(1)
      return undefined as never // When testing, with process.exit mock, we will reach this case
    }
    if (argsResult.errors.length > 1) {
      throw new AggregateError(argsResult.errors)
    } else {
      throw argsResult.errors[0]!
    }
  }

  if (settings.helpOnNoArguments && Object.values(argsResult.args).length === 0) {
    settings.onOutput(Help.render(specsResult.specs, settings) + `\n`)
    if (!testDebuggingNoExit) process.exit(0)
    throw new Error(`missing args`) // When testing, with process.exit mock, we will reach this case
  }

  const argsFromPrompt = argInputsTTY ? prompt(settings, prompts, argInputsTTY) : {}

  const args = {
    ...argsResult.args,
    ...argsFromPrompt,
  }

  return args
}

const partition = <T extends [...unknown[]]>(
  xs: T,
  fn: (x: T[number]) => boolean
): [T[number][], T[number][]] => {
  const xs1: T[number][] = []
  const xs2: T[number][] = []
  for (const x of xs) {
    if (fn(x)) {
      xs1.push(x)
    } else {
      xs2.push(x)
    }
  }
  return [xs1, xs2]
}
