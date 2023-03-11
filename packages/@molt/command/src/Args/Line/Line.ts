import { Errors } from '../../Errors/index.js'
import { isNegated, parseRawInput, stripeDashPrefix, stripeNegatePrefixLoose } from '../../helpers.js'
import type { Index } from '../../lib/prelude.js'
import { ParameterSpec } from '../../ParameterSpec/index.js'
import type { ArgumentReport } from '../types.js'
import camelCase from 'lodash.camelcase'

export type RawInputs = string[]

export type LineParseError = Errors.ErrorUnknownFlag | Errors.ErrorMissingArgument | Errors.ErrorDuplicateFlag

export const parse = (
  rawLineInputs: RawInputs,
  specs: ParameterSpec.Output[]
): { errors: LineParseError[]; line: Index<ArgumentReport> } => {
  // dump(specs)
  const errors: LineParseError[] = []

  const rawLineInputsPrepared = rawLineInputs
    .flatMap((lineInput) => {
      if (!isShortFlag(lineInput)) return [lineInput]
      return stripeShortFlagPrefixUnsafe(lineInput).split(``).map(addShortFlagPrefix)
    })
    .flatMap((lineInput) => {
      if (lineInput.trim() === `=`) return []
      if (!isFlag(lineInput.trim())) return [lineInput]
      // Nodejs will not get us empty string input so we are guaranteed a flag name here.
      const [flag, ...value] = lineInput.trim().split(`=`) as [string, ...string[]]
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
      if (ParameterSpec.isOrHasType(pendingReport.spec, `TypeBoolean`)) {
        pendingReport.value = {
          value: true,
          _tag: `boolean`,
          negated: isNegated(camelCase(pendingReport.source.name)),
        }
      } else {
        pendingReport.errors.push(new Errors.ErrorMissingArgument({ spec: pendingReport.spec }))
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
        errors.push(new Errors.ErrorUnknownFlag({ flagName: flagNameNoDashPrefixNoNegate }))
        continue
      }

      const existing = reports[spec.name.canonical]
      if (existing) {
        // TODO Handle once we support multiple values (arrays).
        // TODO richer structured info about the duplication. For example if
        // duplicated across aliases, make it easy to report a nice message explaining that.
        errors.push(new Errors.ErrorDuplicateFlag({ flagName: flagNameNoDashPrefixNoNegate }))
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
