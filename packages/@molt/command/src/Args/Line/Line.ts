import { isNegated, parseRawInput, stripeDashPrefix, stripeNegatePrefixLoose } from '../../helpers.js'
import type { Index } from '../../lib/prelude.js'
import { ParameterSpec } from '../../ParameterSpec/index.js'
import type { ArgumentReport } from '../types.js'
import camelCase from 'lodash.camelcase'

export type RawInputs = string[]

export const parse = (
  rawLineInputs: RawInputs,
  specs: ParameterSpec.Output[]
): { errors: Error[]; line: Index<ArgumentReport> } => {
  // dump(specs)
  const errors: Error[] = []

  const rawLineInputsPrepared = rawLineInputs
    .map((lineInput) => lineInput.trim())
    .flatMap((lineInput) => {
      if (!isShortFlag(lineInput)) return [lineInput]
      return stripeShortFlagPrefixUnsafe(lineInput).split(``).map(addShortFlagPrefix)
    })
    .flatMap((lineInput) => {
      if (lineInput === `=`) return []
      if (!isFlag(lineInput)) return [lineInput]
      // Nodejs will not get us empty string input so we are guaranteed a flag name here.
      const [flag, ...value] = lineInput.split(`=`) as [string, ...string[]]
      if (value.length === 0) return [flag]
      if (value.join(``) === ``) return [flag]
      return [flag, value.join(`=`)]
    })

  const reports: Index<ArgumentReport> = {}

  let current: null | ArgumentReport = null

  const finishPendingReport = (pendingReport: ArgumentReport) => {
    if (pendingReport.value === PENDING_VALUE) {
      /**
       * We have gotten something like this: --foo --bar.
       * We are parsing "foo". Its spec could be a union containing a boolean or just a straight up boolean, or something else.
       * If union with boolean or boolean then we interpret foo argument as being a boolean.
       * Otherwise it is an error.
       */
      if (ParameterSpec.isOrHasTypePrimitive(pendingReport.spec, `boolean`)) {
        pendingReport.value = {
          value: true,
          _tag: `boolean`,
          negated: isNegated(camelCase(pendingReport.source.name)),
        }
      } else {
        pendingReport.errors.push(new Error(`Missing argument`))
      }
    }
  }

  for (const rawLineInput of rawLineInputsPrepared) {
    if (isFlag(rawLineInput)) {
      if (current) {
        finishPendingReport(current)
        current = null
      }

      const flagNameNoDashPrefix = stripeDashPrefix(rawLineInput)
      const flagNameNoDashPrefixCamel = camelCase(flagNameNoDashPrefix)
      const flagNameNoDashPrefixNoNegate = stripeNegatePrefixLoose(flagNameNoDashPrefixCamel)
      const spec = ParameterSpec.findByName(flagNameNoDashPrefixCamel, specs)
      if (!spec) {
        errors.push(new Error(`Unknown flag "${flagNameNoDashPrefixNoNegate}"`))
        continue
      }

      const existing = reports[spec.name.canonical]
      if (existing) {
        // TODO The argument is already present, we should report an error? Or just ignore? Handle once we support multiple values (arrays).
        continue
      }

      current = {
        spec,
        errors: [],
        value: PENDING_VALUE, // eslint-disable-line
        duplicates: [],
        source: {
          _tag: `line`,
          name: flagNameNoDashPrefix,
        },
      }

      reports[spec.name.canonical] = current

      continue
    } else if (current) {
      // TODO catch error and put into errors array
      current.value = parseRawInput(current.spec.name.canonical, rawLineInput, current.spec)
      current = null
      continue
    } else {
      // TODO We got an argument without a flag, we should report an error? Or just ignore?
    }
  }

  // dump({ current })
  if (current) {
    finishPendingReport(current)
    current = null
  }

  // dump({ reports })
  return {
    errors,
    line: reports,
  }
}

const isFlag = (lineInput: string) => isLongFlag(lineInput) || isShortFlag(lineInput)

const isLongFlag = (lineInput: string) => lineInput.trim().startsWith(`--`)

const isShortFlag = (lineInput: string) =>
  lineInput.trim().startsWith(`-`) && !lineInput.trim().startsWith(`--`)

const stripeShortFlagPrefixUnsafe = (lineInput: string) => lineInput.trim().slice(1)

const addShortFlagPrefix = (lineInput: string) => `-${lineInput}`

// eslint-disable-next-line
const PENDING_VALUE = `__PENDING__` as any
