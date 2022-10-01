import { stripeDashPrefix } from './helpers.js'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import { z } from 'zod'

export type RawLineInputs = string[]

export const FlagInput = Alge.data(`FlagInput`, {
  Arguments: {
    arguments: z.string().array(),
  },
  Boolean: {
    negated: z.boolean(),
  },
})

export type FlagInput = FlagInput.Arguments | FlagInput.Boolean

export namespace FlagInput {
  export type Arguments = _FlagInput['Arguments']
  export type Boolean = _FlagInput['Boolean']
}

type _FlagInput = Alge.Infer<typeof FlagInput>

export type FlagInputs = Record<string, FlagInput>

export const parseLineInputs = (rawLineInputs: RawLineInputs): FlagInputs => {
  // console.log({ argumentsInput })
  const flags: FlagInputs = {}
  let index = 0
  let currentFlag: null | FlagInput = null

  for (const rawLineInput of rawLineInputs) {
    const rawLineInputTrimmed = rawLineInput.trim()

    if (isLineInputAFlagName(rawLineInputTrimmed)) {
      const isLastLineInput = rawLineInputs[index + 1] === undefined
      // eslint-disable-next-line
      const isNextLintInputFlag = rawLineInputs[index + 1] && isLineInputAFlagName(rawLineInputs[index + 1]!)
      const flagNameNoDashPrefix = stripeDashPrefix(rawLineInputTrimmed)
      if (isLastLineInput || isNextLintInputFlag) {
        // TODO handle camel case negation like --noWay
        const isNegated = flagNameNoDashPrefix.startsWith(`no-`)
        currentFlag = FlagInput.Boolean.create({
          negated: isNegated,
        })
        const flagNameNoNegatePrefix = flagNameNoDashPrefix.replace(`no-`, ``)
        const flagNameCamelCase = camelCase(flagNameNoNegatePrefix)
        flags[flagNameCamelCase] = currentFlag
      } else {
        currentFlag = FlagInput.Arguments.create({
          arguments: [],
        })
        const flagNameCamelCase = camelCase(flagNameNoDashPrefix)
        flags[flagNameCamelCase] = currentFlag
      }
    } else if (currentFlag && FlagInput.Arguments.is(currentFlag)) {
      currentFlag.arguments.push(rawLineInputTrimmed)
    }

    index++
  }

  // console.log({ structured })
  return flags
}

const isLineInputAFlagName = (lineInput: string) => {
  return lineInput.trim().startsWith(`--`) || lineInput.trim().startsWith(`-`)
}
