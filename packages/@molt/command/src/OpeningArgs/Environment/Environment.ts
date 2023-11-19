import { Errors } from '../../Errors/index.js'
import type { Index, RequireField } from '../../lib/prelude.js'
import { getNames } from '../../Parameter/helpers/CommandParameter.js'
import type { Parameter } from '../../Parameter/types.js'
import { parseSerializedValue } from '../helpers.js'
import type { EnvironmentArgumentReport } from '../types.js'
import camelCase from 'lodash.camelcase'
import snakecase from 'lodash.snakecase'

export const defaultParameterNamePrefixes = [`cli_parameter`, `cli_param`]

export type RawInputs = Record<string, string | undefined>

export type LocalParseErrors = Errors.ErrorDuplicateEnvArg

export type GlobalParseErrors = Errors.Global.ErrorUnknownParameterViaEnvironment

export interface ParsedInputs {
  globalErrors: GlobalParseErrors[]
  reports: Index<EnvironmentArgumentReport>
}

export const parse = (environment: RawInputs, specs: Parameter[]): ParsedInputs => {
  const result: ParsedInputs = {
    globalErrors: [],
    reports: {},
  }

  const envars = normalizeEnvironment(environment)

  const specsWithEnvironmentSupport = specs.filter(
    (spec): spec is ParameterSpecOutputWithEnvironment => spec.environment !== null,
  )

  for (const envar of envars) {
    for (const parameter of specsWithEnvironmentSupport) {
      const match = checkInputMatch(envar, parameter)

      // Case 1
      if (!match) continue

      // Case 2
      // Check for multiple envars pointing to the same parameter.
      const report = result.reports[parameter.name.canonical]
      if (report) {
        const instance = {
          name: match.name,
          prefix: match.namespace,
          value: match.value,
        }
        const e = report.errors.find((_) => _.name === `ErrorDuplicateEnvArg`)
        if (e) {
          e.instances.push(instance)
        } else {
          report.errors.push(
            new Errors.ErrorDuplicateEnvArg({
              parameter,
              instances: [instance],
            }),
          )
        }
        continue
      }

      // Case 3
      const value = parseSerializedValue(match.nameWithNegation, match.value, parameter)
      result.reports[parameter.name.canonical] = {
        parameter,
        value,
        errors: [],
        source: {
          _tag: `environment`,
          name: envar.name.raw,
          namespace: match.namespace,
        },
      }
    }
  }

  return result
}

export const lookupEnvironmentVariableArgument = (
  prefixes: string[],
  environment: Record<string, string | undefined>,
  parameterName: string,
): null | { name: string; value: string } => {
  const parameterNameSnakeCase = snakecase(parameterName)
  const parameterNames =
    prefixes.length === 0
      ? [parameterNameSnakeCase]
      : // TODO add test coverage for the snake case conversion of a parameter name
        prefixes.map((prefix) => `${prefix.toLowerCase()}_${parameterNameSnakeCase.toLowerCase()}`)

  const args = parameterNames
    .map((name) => ({ name, value: environment[name] }))
    .filter((arg): arg is { name: string; value: string } => arg.value !== undefined)

  if (args.length === 0) return null

  if (args.length > 1)
    throw new Error(
      `Multiple environment variables found for same parameter "${parameterName}": ${args.join(`, `)}`,
    )

  // dump(prefixes, environment, parameterName)

  // eslint-disable-next-line
  const environmentVariable = args[0]!
  return environmentVariable
}

type ParameterSpecOutputWithEnvironment = RequireField<Parameter, 'environment'>

interface Match {
  namespace: null | string
  name: string
  nameWithNegation: string
  negated: boolean
  value: string
}

/**
 * Find out if an environment variable is input to a spec.
 */
const checkInputMatch = (envar: Envar, spec: ParameterSpecOutputWithEnvironment): null | Match => {
  const specParameterNames = getNames(spec)
  for (const name of specParameterNames) {
    if (spec.environment.namespaces.length > 0) {
      for (const namespace of spec.environment.namespaces) {
        const nameNamespaced = camelCase(`${namespace}_${name}`)

        if (nameNamespaced === envar.name.camel) {
          return {
            name,
            nameWithNegation: name,
            namespace,
            negated: false,
            value: envar.value,
          }
        }
        const negateParsed = parseNegated(envar.name.camel)
        if (name === negateParsed.name) {
          return {
            name,
            namespace,
            nameWithNegation: negateParsed.nameWithNegation,
            negated: true,
            value: envar.value,
          }
        }
      }
    } else {
      if (envar.name.camel === name) {
        return {
          name,
          nameWithNegation: name,
          namespace: null,
          negated: false,
          value: envar.value,
        }
      }
      const negateParsed = parseNegated(envar.name.camel)
      if (negateParsed.name === name) {
        return {
          name: negateParsed.name,
          nameWithNegation: negateParsed.nameWithNegation,
          namespace: null,
          negated: true,
          value: envar.value,
        }
      }
    }
  }
  return null
}

const parseNegated = (string: string) => {
  // When there is a namespace then, in camel case format, the negate word can begin with a capital letter
  const match = string.match(/(?:^n|N)o([A-Z].*)$/)?.[1]
  return {
    negated: Boolean(match),
    nameWithNegation: match ? `no${match}` : string,
    name: match ? lowercaseFirst(match) : string,
  }
}

const lowercaseFirst = (string: string) =>
  string.length === 0 ? string : string[0]!.toLowerCase() + string.slice(1)

interface Envar {
  name: {
    raw: string
    camel: string
  }
  value: string
}

const normalizeEnvironment = (environment: RawInputs): Envar[] => {
  return Object.entries(environment)
    .map(([name, value]) =>
      value === undefined
        ? value
        : {
            value,
            name: {
              raw: name,
              camel: camelCase(name),
            },
          },
    )
    .filter((envar): envar is Envar => envar !== undefined)
}
