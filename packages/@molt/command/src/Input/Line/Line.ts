import { isNegated, parseRawInput, stripeDashPrefix, stripeNegatePrefixLoose } from '../../helpers.js'
import type { Index } from '../../lib/prelude.js'
import { ParameterSpec } from '../../ParameterSpec/index.js'
import type { ArgumentReport } from '../types.js'
import camelCase from 'lodash.camelcase'

export type RawLineInputs = string[]

const addIndex = <T>(array: T[]): [number, T][] => {
  return array.map((item, index) => [index, item])
}

export const parse = (rawLineInputs: RawLineInputs, specs: ParameterSpec.Spec[]): Index<ArgumentReport> => {
  // console.log({ argumentsInput })
  const reports: Index<ArgumentReport> = {}
  let current: null | ArgumentReport = null

  for (const [_, rawLineInput] of addIndex(rawLineInputs)) {
    const rawLineInputTrimmed = rawLineInput.trim()

    if (isFlag(rawLineInputTrimmed)) {
      if (current && current.value === PENDING_VALUE) {
        current.errors.push(new Error(`Missing argument`))
        current = null
      }
      // const isLastInput = rawLineInputs[index + 1] === undefined
      // const isNextInputFlag = rawLineInputs[index + 1] && isFlag(rawLineInputs[index + 1]!)
      // const isBooleanSyntax = isLastInput || isNextInputFlag

      const flagNameNoDashPrefix = stripeDashPrefix(rawLineInputTrimmed)
      const flagNameNoDashPrefixCamel = camelCase(flagNameNoDashPrefix)
      const flagNameNoDashPrefixNoNegate = stripeNegatePrefixLoose(flagNameNoDashPrefixCamel)
      const spec = ParameterSpec.findByName(flagNameNoDashPrefixCamel, specs)
      if (!spec) {
        throw new Error(`Unknown flag "${flagNameNoDashPrefixNoNegate}"`)
      }

      const existing = reports[spec.name.canonical]
      if (existing) {
        // TODO
        continue
      }

      if (spec.schemaPrimitive === `boolean`) {
        current = {
          spec,
          errors: [],
          value: {
            value: true,
            _tag: `boolean`,
            negated: isNegated(flagNameNoDashPrefixCamel),
          },
          duplicates: [],
          source: {
            _tag: `line`,
            name: flagNameNoDashPrefix,
          },
        }
      } else {
        current = {
          spec,
          errors: [],
          // eslint-disable-next-line
          value: PENDING_VALUE,
          duplicates: [],
          source: {
            _tag: `line`,
            name: flagNameNoDashPrefix,
          },
        }
      }
      reports[spec.name.canonical] = current
      continue
    }

    if (current) {
      // TODO catch error and put into errors array
      current.value = parseRawInput(current.spec.name.canonical, rawLineInput, current.spec)
    }
  }

  // dump({ current })
  if (current && current.value === PENDING_VALUE) {
    current.errors.push(new Error(`Missing argument`))
    current = null
  }

  // dump({ flags })
  return reports
}

const isFlag = (lineInput: string) => {
  return lineInput.trim().startsWith(`--`) || lineInput.trim().startsWith(`-`)
}

// eslint-disable-next-line
const PENDING_VALUE = `__PENDING__` as any
