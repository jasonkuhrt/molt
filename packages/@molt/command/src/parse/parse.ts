import type { RawArgInputs } from '../Builder/root/types.js'
import { Help } from '../Help/index.js'
import { getLowerCaseEnvironment, lowerCaseObjectKeys } from '../helpers.js'
import type { Settings } from '../index.js'
import { OpeningArgs } from '../OpeningArgs/index.js'
import type {
  ParseResultBasicError,
  ParseResultExclusiveGroupError,
  ParseResultExclusiveGroupSupplied,
} from '../OpeningArgs/OpeningArgs.js'
import { ParameterSpec } from '../ParameterSpec/index.js'
import { match } from '../Pattern/Pattern.js'
import { prompt } from './prompt.js'
import console from 'console'
import * as ReadLineSync from 'readline-sync'

export interface ParseProgressPostPromptAnnotation {
  globalErrors: OpeningArgs.ParseResult['globalErrors']
  mutuallyExclusiveParameters: OpeningArgs.ParseResult['mutuallyExclusiveParameters']
  basicParameters: Record<
    string,
    {
      openingParseResult: OpeningArgs.ParseResult['basicParameters'][string]
      spec: OpeningArgs.ParseResult['basicParameters'][string]['spec']
      prompt: {
        enabled: boolean
      }
    }
  >
}

export interface ParseProgressPostPrompt {
  globalErrors: OpeningArgs.ParseResult['globalErrors']
  mutuallyExclusiveParameters: OpeningArgs.ParseResult['mutuallyExclusiveParameters']
  basicParameters: Record<
    string,
    {
      spec: OpeningArgs.ParseResult['basicParameters'][string]['spec']
      openingParseResult: OpeningArgs.ParseResult['basicParameters'][string]
      prompt: {
        enabled: boolean
        arg: ParameterSpec.ArgumentValue
      }
    }
  >
}

export interface ParseProgressDone {
  globalErrors: OpeningArgs.ParseResult['globalErrors']
  mutuallyExclusiveParameters: OpeningArgs.ParseResult['mutuallyExclusiveParameters']
  basicParameters: Record<
    string,
    {
      spec: OpeningArgs.ParseResult['basicParameters'][string]['spec']
      openingParseResult: OpeningArgs.ParseResult['basicParameters'][string]
      prompt: {
        enabled: boolean
        arg: any // todo better type
      }
      arg: any // todo better type
    }
  >
}

export const parse = (
  settings: Settings.Output,
  parameterSpecInputs: Record<string, ParameterSpec.Input>,
  argInputs: RawArgInputs,
) => {
  const testDebuggingNoExit = process.env[`testing_molt`] === `true`
  const argInputsTTY =
    argInputs?.tty ??
    (process.stdout.isTTY
      ? {
          output: console.log,
          input: (params) => ReadLineSync.question(params.prompt),
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
  const openingArgsResult = OpeningArgs.parse({
    specs: specsResult.specs,
    line: argInputsLine,
    environment: argInputsEnvironment,
  })

  /**
   * Build up a list of parameter prompts. A parameter prompt is added when there is a matching event pattern.
   */

  const parseProgressPostPromptAnnotation = {
    ...openingArgsResult,
    basicParameters: Object.fromEntries(
      Object.entries(openingArgsResult.basicParameters).map(([parameterName, openingParseResult]) => {
        const data = {
          openingParseResult,
          spec: openingParseResult.spec,
          prompt: {
            enabled: false,
          },
        }
        return [parameterName, data]
      }),
    ),
  }

  if (argInputsTTY) {
    const basicSpecs = specsResult.specs.filter((_): _ is ParameterSpec.Output.Basic => _._tag === `Basic`)
    for (const spec of basicSpecs) {
      const eventPatterns = spec.prompt.when ?? settings.prompt.when
      if (eventPatterns) {
        const result = openingArgsResult.basicParameters[spec.name.canonical]
        if (!result) throw new Error(`something went wrong, could not get arg parse result`)

        if (eventPatterns.accepted && result._tag === `supplied`) {
          if (match({ value: result.value }, eventPatterns.accepted)) {
            parseProgressPostPromptAnnotation.basicParameters[spec.name.canonical]!.prompt.enabled = true
            continue
          }
        }
        if (eventPatterns.omitted && result._tag === `omitted` && spec.optionality._tag !== `required`) {
          if (match({ optionality: spec.optionality._tag }, eventPatterns.omitted)) {
            parseProgressPostPromptAnnotation.basicParameters[spec.name.canonical]!.prompt.enabled = true
            continue
          }
        }
        if (eventPatterns.rejected && result._tag === `error`) {
          // @ts-expect-error too dynamic here, unit test this area.
          if (result.errors.some((_) => match(_, eventPatterns.rejected))) {
            parseProgressPostPromptAnnotation.basicParameters[spec.name.canonical]!.prompt.enabled = true
            continue
          }
        }
      }
    }
  }

  // eslint-disable-next-line
  const askedForHelp =
    `help` in openingArgsResult.basicParameters &&
    openingArgsResult.basicParameters[`help`]._tag === `supplied` &&
    openingArgsResult.basicParameters[`help`].value === true

  if (askedForHelp) {
    settings.onOutput(Help.render(specsResult.specs, settings) + `\n`)
    if (!testDebuggingNoExit) process.exit(0)
    return undefined as never // When testing, with process.exit mock, we WILL reach this case
  }

  /**
   * If there are global errors then we must abort as it compromises the program intent.
   * A global error could be something like the user having supplied an unknown parameter.
   *
   * Likewise if there are argument errors that are NOT going to be prompted for, we must abort too.
   */
  const argumentErrors = [
    ...Object.entries(parseProgressPostPromptAnnotation.basicParameters)
      .map(([_, v]): null | ParseResultBasicError => {
        return v.prompt.enabled === false && v.openingParseResult._tag === `error`
          ? v.openingParseResult
          : null
      })
      .filter((_): _ is ParseResultBasicError => _ !== null),
    ...Object.entries(parseProgressPostPromptAnnotation.mutuallyExclusiveParameters)
      .map(([_, v]): null | ParseResultExclusiveGroupError => {
        return v._tag === `error` ? v : null
      })
      .filter((_): _ is ParseResultExclusiveGroupError => _ !== null),
  ]

  if (parseProgressPostPromptAnnotation.globalErrors.length > 0 || argumentErrors.length > 0) {
    if (settings.helpOnError) {
      const message =
        `Cannot run command, you made some mistakes:\n\n` +
        openingArgsResult.globalErrors.map((_) => _.message).join(`\nX `) +
        argumentErrors.map((_) => _.errors.map((_) => _.message).join(`\nX `)).join(`\nX `) +
        `\n\nHere are the docs for this command:\n`
      settings.onOutput(message + `\n`)
      settings.onOutput(Help.render(specsResult.specs, settings) + `\n`)
    }
    if (settings.onError === `exit` && !testDebuggingNoExit) {
      process.exit(1)
      return undefined as never // When testing, with process.exit mock, we will reach this case
    }
    const allErrors = [
      ...openingArgsResult.globalErrors,
      ...argumentErrors.map((_) => (_.errors.length > 1 ? new AggregateError(_.errors) : _.errors[0])),
    ]
    if (allErrors.length > 1) {
      throw new AggregateError(allErrors)
    } else {
      throw allErrors[0]!
    }
  }

  /**
   * Progress to the next parse stage wherein we will execute prompts.
   */
  const parseProgressPostPrompts = prompt(parseProgressPostPromptAnnotation, argInputsTTY)
  const args = {
    ...Object.fromEntries(
      Object.entries(parseProgressPostPrompts.basicParameters)
        .map(([k, v]) => {
          return [
            k,
            v.prompt.enabled
              ? v.prompt.arg
              : v.openingParseResult._tag === `supplied`
              ? v.openingParseResult.value
              : null,
          ]
        })
        .filter(([k, v]) => v !== null),
    ),
    ...Object.fromEntries(
      Object.values(parseProgressPostPrompts.mutuallyExclusiveParameters)
        .filter((_): _ is ParseResultExclusiveGroupSupplied => _._tag === `supplied`)
        .map((v) => [v.spec.label, v.value]),
    ),
  }

  /**
   * Handle the distinct case of no arguments. Sometimes the CLI author wants this to mean "show help".
   */
  if (settings.helpOnNoArguments && Object.values(args).length === 0) {
    settings.onOutput(Help.render(specsResult.specs, settings) + `\n`)
    if (!testDebuggingNoExit) process.exit(0)
    throw new Error(`missing args`) // When testing, with process.exit mock, we will reach this case
  }

  return args
}