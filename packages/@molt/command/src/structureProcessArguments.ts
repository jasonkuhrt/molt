import { stripeDashPrefix } from './helpers.js'
import camelCase from 'lodash.camelcase'

export type ArgumentsInput = string[]

export type ArgumentsInputStructuredArgFlag = {
  _tag: 'Arguments'
  arguments: string[]
}

export type ArgumentsInputStructuredBooleanFlag = {
  _tag: 'Boolean'
  negated: boolean
}

export type ArgumentsInputStructured = Record<
  string,
  ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag
>

export const structureProcessArguments = (argumentsInput: ArgumentsInput): ArgumentsInputStructured => {
  // console.log({ argumentsInput })
  const structured: ArgumentsInputStructured = {}
  let index = 0
  let currentFlag: null | ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag = null

  for (const argument of argumentsInput) {
    const trimmed = argument.trim()

    if (isFlagInput(trimmed)) {
      const noDashPrefix = stripeDashPrefix(trimmed)
      if (
        !argumentsInput[index + 1] ||
        //eslint-disable-next-line
        (argumentsInput[index + 1] && isFlagInput(argumentsInput[index + 1]!))
      ) {
        currentFlag = {
          _tag: `Boolean`,
          // TODO handle camel case negation like --noWay
          negated: noDashPrefix.startsWith(`no-`),
        }
        const noNegatePrefix = noDashPrefix.replace(`no-`, ``)
        const camelized = camelCase(noNegatePrefix)
        structured[camelized] = currentFlag
      } else {
        currentFlag = {
          _tag: `Arguments`,
          arguments: [],
        }
        structured[camelCase(noDashPrefix)] = currentFlag
      }
    } else if (currentFlag && currentFlag._tag === `Arguments`) {
      currentFlag.arguments.push(trimmed)
    }

    index++
  }

  // console.log({ structured })
  return structured
}

const isFlagInput = (input: string) => {
  return input.trim().startsWith(`--`) || input.trim().startsWith(`-`)
}
