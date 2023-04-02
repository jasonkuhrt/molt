import type {
  ParseResultBasic,
  ParseResultBasicSupplied,
  ParseResultExclusiveGroupSupplied,
} from './Args/Args.js'
import { Args } from './Args/index.js'
import type { RawArgInputs } from './Builder/root/types.js'
import { Help } from './Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from './helpers.js'
import type { Settings } from './index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import { process } from './ParameterSpec/ParametersSpec.js'
import { match } from './Pattern/Pattern.js'
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

  /**
   * todo make this data structure more sophisticated.
   * Right now it splits into errors and args. Prompt makes things more complicated.
   * We want to know for each parameter what happened in order to properly prompt.
   * So the data structure should be a map of parameter names to results that indicate:
   * 1. error
   * 2. supplied
   * 3. omitted
   * This nicely maps to the events we have defined that prompts can match on.
   * This data structure should be the "pre-prompt parse results".
   *
   * Then we match prompts. this leads to a data structure of specs-to-prompt.
   * If there are still errors after matching, then we cannot continue.
   * if all errors become prompts, we can continue.
   * then prompts are run. the results lead to a new set of arguments. Because prompts keep prompting until they get a valid valid
   * we know that the result of running prompts cannot have any errors.
   * The post-prompt parse results could be created but we do not need them
   * Instead we can just finalize our arguments. They are the pre-prompt supplied merged (and overridden by) with the post-prompt supplied.
   */
  const argsResult = Args.parse(specsResult.specs, argInputsLine, argInputsEnvironment)
  const prompts: ParameterSpec.Output[] = []
  if (argInputsTTY) {
    const basicSpecs = specsResult.specs.filter((_): _ is ParameterSpec.Output.Basic => _._tag === `Basic`)
    for (const spec of basicSpecs) {
      if (spec.prompt !== false) {
        let pattern: ParameterSpec.Output.EventPattern
        if (spec.prompt === true) {
          // todo get default pattern from settings
          pattern = `todo` as any
        } else if (spec.prompt === null) {
          // todo get default from settings
          pattern = `todo` as any
        } else {
          pattern = spec.prompt
        }

        const result = argsResult.basicParameters[spec.name.canonical]
        if (!result) throw new Error(`something went wrong, could not get arg parse result`)

        if (pattern.when.supplied && result._tag === `supplied`) {
          if (match({ value: result.value }, pattern.when.supplied)) {
            prompts.push(spec)
            continue
          }
        }
        if (pattern.when.omitted && result._tag === `omitted`) {
          if (match({ optionality: spec.optionality._tag }, pattern.when.omitted)) {
            prompts.push(spec)
            continue
          }
        }
        if (pattern.when.rejected && result._tag === `error`) {
          // @ts-expect-error too dynamic here, unit test this area.
          if (result.errors.some((_) => match(_, pattern.when.rejected))) {
            prompts.push(spec)
            continue
          }
          // todo find replacement for this logic
          // when checking to see if errors have happened, need to subtract out the errors that are going to be prompted for
          // if (errorIndex !== -1) {
          //   // The error should not be thrown anymore because we are going to prompt for it.
          //   argsResult.errors.splice(errorIndex, 1)
          //   prompts.push(spec)
          //   continue
          // }
        }
      }
    }
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
    ...Object.fromEntries(
      Object.values(argsResult.basicParameters)
        .filter((_): _ is ParseResultBasicSupplied => _._tag === `supplied`)
        .map((v) => [v.spec.name.canonical, v.value])
    ),
    ...Object.fromEntries(
      Object.values(argsResult.mutuallyExclusiveParameters)
        .filter((_): _ is ParseResultExclusiveGroupSupplied => _._tag === `supplied`)
        .map((v) => [v.spec.label, v.value])
    ),
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
