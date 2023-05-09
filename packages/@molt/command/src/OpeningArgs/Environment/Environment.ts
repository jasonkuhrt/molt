import { Errors } from '../../Errors/index.js'
import { parseRawInput } from '../../helpers.js'
import type { Index, RequireField } from '../../lib/prelude.js'
import { ParameterSpec } from '../../ParameterSpec/index.js'
import type { EnvironmentArgumentReport } from '../types.js'
import camelCase from 'lodash.camelcase'
import snakecase from 'lodash.snakecase'

export const defaultParameterNamePrefixes = [`cli_parameter`, `cli_param`]

export type RawInputs = Record<string, string | undefined>

export type LocalParseErrors = Errors.ErrorDuplicateEnvArg

export type GlobalParseErrors = Errors.ErrorUnknownParameterViaEnvironment

export interface ParsedInputs {
  globalErrors: GlobalParseErrors[]
  reports: Index<EnvironmentArgumentReport>
}

export const parse = (environment: RawInputs, specs: ParameterSpec.Output[]): ParsedInputs => {
  const result: ParsedInputs = {
    globalErrors: [],
    reports: {},
  }

  const envars = normalizeEnvironment(environment)

  const specsWithEnvironmentSupport = specs.filter(
    (spec): spec is ParameterSpecOutputWithEnvironment => spec.environment !== null
  )

  for (const envar of envars) {
    for (const spec of specsWithEnvironmentSupport) {
      const match = checkInputMatch(envar, spec)
      if (!match) continue

      // Check for multiple envars pointing to the same parameter.
      const report = result.reports[spec.name.canonical]
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
              spec,
              instances: [instance],
            })
          )
        }
      }

      const value = parseRawInput(match.name, match.value, spec)
      result.reports[spec.name.canonical] = {
        spec,
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

// export const environmentValidate = (params: {
//   parameterSpecs: ParameterSpec[]
//   environment: RawEnvironment
//   settings: Settings.Normalized
// }) => {
//   const { settings, parameterSpecs, environment } = params

//   if (settings.parameters.environment.$default.prefix.length > 0) {
//     const argsPassedVia = Object.entries(environment)
//       .filter(([prefixedName]) => {
//         return Boolean(
//           settings.parameters.environment.$default.prefix.find((prefix) =>
//             prefixedName.startsWith(prefix.toLowerCase())
//           )
//         )
//       })
//       .reduce((acc, [prefixedName, value]) => {
//         // eslint-disable-next-line
//         const prefix = settings.parameters.environment.$default.prefix.find((prefix) =>
//           prefixedName.startsWith(prefix.toLowerCase())
//         )!
//         const envarName = prefixedName.replace(prefix.toLowerCase() + `_`, ``)
//         const envarNameCamel = camelCase(envarName)
//         const isUnknownName =
//           parameterSpecs.find(
//             (spec) =>
//               spec.name.long === envarNameCamel ||
//               spec.name.short === envarNameCamel ||
//               Boolean(spec.name.aliases.long.find((_) => _ === envarNameCamel)) ||
//               Boolean(spec.name.aliases.short.find((_) => _ === envarNameCamel))
//           ) === undefined
//         acc[envarName] = acc[envarName] ?? []
//         // eslint-disable-next-line
//         acc[envarName]!.push({ prefix, value, isUnknownName })
//         return acc
//       }, {} as Record<string, { prefix: string; value: string | undefined; isUnknownName: boolean }[]>)

//     const argsPassedUnknown = Object.entries(argsPassedVia)
//       .filter(([_name, environmentVariables]) => {
//         return Boolean(environmentVariables.find((envar) => envar.isUnknownName))
//       })
//       .map((entry): [string, { prefix: string; value: string | undefined }[]] => [
//         entry[0],
//         entry[1].map((envar) => ({ prefix: envar.prefix, value: envar.value })),
//       ])
//     if (argsPassedUnknown.length > 0) {
//       throw new Error(
//         `Environment variables appearing to be CLI parameter arguments were found but do not correspond to any actual parameters. This probably indicates a typo or some other kind of error: ${JSON.stringify(
//           Object.fromEntries(argsPassedUnknown.sort().map((entry) => [entry[0], entry[1].sort()])),
//           null,
//           2
//         )}`
//       )
//     }
//     const argsPassedMultipleTimesViaDifferentEnvironmentVariables = Object.entries(argsPassedVia)
//       .filter(([_name, environmentVariables]) => {
//         return environmentVariables.length > 1
//       })
//       .map((entry): [string, { prefix: string; value: string | undefined }[]] => [
//         entry[0],
//         entry[1].map((envar) => ({ prefix: envar.prefix, value: envar.value })),
//       ])
//     if (argsPassedMultipleTimesViaDifferentEnvironmentVariables.length > 0) {
//       const params = argsPassedMultipleTimesViaDifferentEnvironmentVariables
//         .map((args) => `"${String(args[0])}"`)
//         .join(`, `)
//       throw new Error(
//         `Parameter(s) ${params} received arguments multiple times via different environment variables: ${JSON.stringify(
//           Object.fromEntries(
//             argsPassedMultipleTimesViaDifferentEnvironmentVariables
//               .sort()
//               .map((entry) => [entry[0], entry[1].sort()])
//           ),
//           null,
//           2
//         )}`
//       )
//     }
//   }
// }

export const lookupEnvironmentVariableArgument = (
  prefixes: string[],
  environment: Record<string, string | undefined>,
  parameterName: string
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
      `Multiple environment variables found for same parameter "${parameterName}": ${args.join(`, `)}`
    )

  // dump(prefixes, environment, parameterName)

  // eslint-disable-next-line
  const environmentVariable = args[0]!
  return environmentVariable
}

type ParameterSpecOutputWithEnvironment = RequireField<ParameterSpec.Output, 'environment'>

interface Match {
  namespace: null | string
  name: string
  negated: boolean
  value: string
}

/**
 * Find out if an environment variable is input to a spec.
 */
const checkInputMatch = (envar: Envar, spec: ParameterSpecOutputWithEnvironment): null | Match => {
  const specParameterNames = ParameterSpec.getNames(spec)
  for (const name of specParameterNames) {
    if (spec.environment.namespaces.length > 0) {
      for (const namespace of spec.environment.namespaces) {
        const nameNamespaced = camelCase(`${namespace}_${name}`)
        if (nameNamespaced === envar.name.camel) {
          return {
            name,
            namespace,
            negated: false,
            value: envar.value,
          }
        }
        const negateParsed = parseNegated(envar.name.camel)
        if (nameNamespaced === negateParsed.name) {
          return {
            name,
            namespace,
            negated: true,
            value: envar.value,
          }
        }
      }
    } else {
      if (envar.name.camel === name) {
        return {
          name,
          namespace: null,
          negated: false,
          value: envar.value,
        }
      }
      const negateParsed = parseNegated(envar.name.camel)
      if (negateParsed.name === name) {
        return {
          name,
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
  const match = string.match(/^no([A-Z].*)$/)?.[1]
  return {
    negated: Boolean(match),
    name: match ?? string,
  }
}

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
          }
    )
    .filter((envar): envar is Envar => envar !== undefined)
}
