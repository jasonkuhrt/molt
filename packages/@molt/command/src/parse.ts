import { Args } from './Args/index.js'
import type { RawArgInputs } from './Builder/root/types.js'
import { ErrorMissingArgument } from './Errors/Errors.js'
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
          read: ReadLineSync.question,
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
    const missingArgErrors: ErrorMissingArgument[] = argsResult.errors.filter(
      (_): _ is ErrorMissingArgument =>
        _ instanceof ErrorMissingArgument && _.spec._tag === `Basic` && _.spec.prompt
    )
    const otherErrors = argsResult.errors.filter(
      (_) => !(_ instanceof ErrorMissingArgument && _.spec._tag === `Basic` && _.spec.prompt)
    )
    argsResult.errors = otherErrors
    prompts = missingArgErrors.map((_) => _.spec)
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

  const argsFromPrompt = argInputsTTY ? prompt(prompts, argInputsTTY) : {}

  const args = {
    ...argsResult.args,
    ...argsFromPrompt,
  }

  return args
}
