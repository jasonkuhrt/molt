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
  if (argInputsTTY) {
    // TODO make this be simply all specs for maximum flexibility but also simplicity
    const errorsAndOptionalMissing = [
      ...argsResult.errors,
      ...specsResult.specs.filter(
        (_): _ is ParameterSpec.Output.Basic | ParameterSpec.Output.Union =>
          _._tag !== `Exclusive` &&
          argsResult.args[_.name.canonical] === undefined &&
          _.optionality._tag === `optional`
      ),
    ]
    const [promptableSpecsAndErrors, unpromptableSpecsAndErrors] = partition(
      errorsAndOptionalMissing,
      (errorOrSpec) => {
        if (
          errorOrSpec instanceof Errors.ErrorMissingArgumentForMutuallyExclusiveParameters ||
          errorOrSpec instanceof Errors.ErrorArgsToMultipleMutuallyExclusiveParameters ||
          errorOrSpec instanceof Errors.ErrorDuplicateFlag ||
          errorOrSpec instanceof Errors.ErrorUnknownFlag ||
          errorOrSpec instanceof Errors.ErrorDuplicateArgument ||
          errorOrSpec instanceof Errors.ErrorFailedToGetParameterDefault
        ) {
          return false
        }
        if (
          errorOrSpec instanceof ErrorMissingArgument &&
          errorOrSpec.spec._tag === `Basic` &&
          errorOrSpec.spec.prompt !== null
        ) {
          return errorOrSpec.spec.prompt
        }

        const conditionalPrompt = settings.defaults.prompt.conditional.find((_) => {
          const spec = errorOrSpec instanceof Error ? errorOrSpec.spec : errorOrSpec
          return _.when({
            argument: argsResult.args[spec.name.canonical],
            parameter:
              errorOrSpec instanceof Error
                ? errorOrSpec.spec._tag === `Exclusive`
                  ? errorOrSpec.spec.group
                  : errorOrSpec.spec
                : errorOrSpec,
            error: errorOrSpec instanceof Error ? errorOrSpec : null,
          })
        })
        if (conditionalPrompt) {
          return conditionalPrompt.enabled
        }
        return settings.defaults.prompt.constant.enabled
      }
    ) as any as [
      (
        | Errors.ErrorInvalidArgument
        | Errors.ErrorMissingArgument
        | ParameterSpec.Output.Basic
        | ParameterSpec.Output.Union
      )[],
      (
        | Errors.ErrorArgsToMultipleMutuallyExclusiveParameters
        | Errors.ErrorMissingArgumentForMutuallyExclusiveParameters
        | ParameterSpec.Output.Basic
        | ParameterSpec.Output.Union
      )[]
    ]
    argsResult.errors = unpromptableSpecsAndErrors.filter(
      (
        _
      ): _ is
        | Errors.ErrorArgsToMultipleMutuallyExclusiveParameters
        | Errors.ErrorMissingArgumentForMutuallyExclusiveParameters => _ instanceof Error
    )
    prompts = promptableSpecsAndErrors.map((_) => (_ instanceof Error ? _.spec : _))
  }
  // dump(prompts)
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
