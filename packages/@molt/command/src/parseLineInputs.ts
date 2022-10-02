import { negateNamePattern, stripeDashPrefix, stripeNegatePrefixLoose } from './helpers.js'
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
      const flagNameNoDashPrefixCamel = camelCase(flagNameNoDashPrefix)
      const flagNameNoDashPrefixNoNegate = stripeNegatePrefixLoose(flagNameNoDashPrefixCamel)
      if (isLastLineInput || isNextLintInputFlag) {
        currentFlag = FlagInput.Boolean.create({
          negated: negateNamePattern.test(flagNameNoDashPrefixCamel),
        })
      } else {
        currentFlag = FlagInput.Arguments.create({
          arguments: [],
        })
      }
      flags[flagNameNoDashPrefixNoNegate] = currentFlag
    } else if (currentFlag && FlagInput.Arguments.is(currentFlag)) {
      currentFlag.arguments.push(rawLineInputTrimmed)
    }

    index++
  }

  // dump({ flags })
  return flags
}

const isLineInputAFlagName = (lineInput: string) => {
  return lineInput.trim().startsWith(`--`) || lineInput.trim().startsWith(`-`)
}
