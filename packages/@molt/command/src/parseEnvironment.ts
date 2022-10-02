import type { ParameterSpec } from './parametersSpec.js'
import { parameterSpecHasName } from './parametersSpec.js'
import type { Settings } from './Settings/index.js'
import camelCase from 'lodash.camelcase'
import snakecase from 'lodash.snakecase'

export const defaultParameterNamePrefixes = [`cli_parameter`, `cli_param`]
type RawEnvironment = Record<string, string | undefined>

// TODO this doesn't account for custom prefixes
export const environmentArgumentName = (name: string) => `${String(defaultParameterNamePrefixes[0])}_${name}`

export const getLowerCaseEnvironment = () =>
  Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k.toLowerCase(), v?.trim()]))

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

// TODO unify this and flag input?
type EnvironmentInput = {
  spec: ParameterSpec
  arg: string
  negated: boolean
  // name: string
  given: {
    name: string
    namePrefix: string
  }
}

type EnvironmentInputs = Record<string, EnvironmentInput>

type RawEnvironmentInputWherePrefixMatches = {
  name: string
  arg: string
  match: {
    /**
     * Either the environment parameter default name ($default) or a specific parameter setting name
     */
    settingParameter: string
  }
  given: {
    name: string
    namePrefix: string
  }
}

export const parseEnvironment = (params: {
  parameterSpecs: ParameterSpec[]
  environment: RawEnvironment
  settings: Settings.Normalized
}): EnvironmentInputs => {
  // dump(params.settings)
  const paramEnvConfigs = Object.entries(params.settings.parameters.environment).map((entry) => ({
    name: entry[0],
    config: entry[1],
  }))
  const paramEnvConfigsWithPrefix = paramEnvConfigs.filter(
    (_) => _.config.prefix && _.config.prefix.length > 0
  )
  // dump({ paramEnvConfigsWithPrefix })
  const environmentSubsetOfInputNamesMatchingSomePrefix = Object.entries(params.environment)
    .map((entry) => ({ name: entry[0], value: entry[1] }))
    .map((rawEnvar): RawEnvironmentInputWherePrefixMatches | null => {
      // dump(paramEnvConfigs)
      const selectives = paramEnvConfigsWithPrefix.filter((_) => _.name !== `$default`)
      // dump({ selectives })
      for (const paramEnv of selectives) {
        // eslint-disable-next-line
        const prefix = paramEnv.config.prefix!.find((prefix) => rawEnvar.name.startsWith(prefix)) ?? null
        if (prefix) {
          // dump({ prefix })
          if (rawEnvar.value === undefined)
            throw new Error(
              `Environment variable "${rawEnvar.name}" key is present but its value is undefined`
            )
          const rawName = rawEnvar.name.slice(prefix.length + 1 /* +1 for the following "_" */)
          const name = camelCase(rawName)
          // dump(paramEnv.name, name)
          if (paramEnv.name === name) {
            return {
              name,
              arg: rawEnvar.value,
              given: {
                namePrefix: prefix,
                name: rawName,
              },
              match: {
                settingParameter: paramEnv.name,
              },
            }
          }
        }
      }
      const $default = paramEnvConfigsWithPrefix.find((_) => _.name === `$default`)
      if ($default) {
        const prefix = $default.config.prefix!.find((prefix) => rawEnvar.name.startsWith(prefix)) ?? null
        if (prefix) {
          if (rawEnvar.value === undefined)
            throw new Error(
              `Environment variable "${rawEnvar.name}" key is present but its value is undefined`
            )
          const rawName = rawEnvar.name.slice(prefix.length + 1 /* +1 for the following "_" */)
          return {
            name: camelCase(rawName),
            arg: rawEnvar.value,
            given: {
              namePrefix: prefix,
              name: rawName,
            },
            match: {
              settingParameter: $default.name,
            },
          }
        }
      }

      return null
    })
    .filter((maybeEnvironmentInput): maybeEnvironmentInput is RawEnvironmentInputWherePrefixMatches => {
      return maybeEnvironmentInput !== null
    })
  // dump({ environmentSubsetOfInputNamesMatchingSomePrefix })

  // validation

  const duplicates = Object.entries(
    environmentSubsetOfInputNamesMatchingSomePrefix.reduce((acc, _) => {
      //eslint-disable-next-line
      acc[_.name] = acc[_.name] ?? []
      //eslint-disable-next-line
      acc[_.name].push(_)
      return acc
      // eslint-disable-next-line
    }, {} as Record<string, any>)
    // eslint-disable-next-line
  ).filter((_) => _[1].length > 1)

  if (duplicates.length > 0) {
    // TODO better error message
    throw new Error(`duplicates`)
  }

  // dump(environmentSubsetOfInputNamesMatchingSomePrefix)
  const parsedEnvironment: EnvironmentInputs = {}

  for (const item of environmentSubsetOfInputNamesMatchingSomePrefix) {
    let spec: ParameterSpec | null = null
    let negated = false

    for (const spec_ of params.parameterSpecs) {
      const isHasName = parameterSpecHasName(spec_, item.name)
      if (isHasName) {
        spec = spec_
        if (isHasName.kind === `long` || isHasName.kind === `longAlias`) {
          negated = isHasName.negated
        }
        break
      }
    }

    if (!spec)
      throw new Error(
        `Environment variable "${item.given.namePrefix.toUpperCase()}_${item.given.name.toUpperCase()}" appears to be a CLI parameter argument (because of its prefix) but does not correspond to any actual parameters. This could indicate a typo or some other kind of error`
        // `Environment argument has been detected by its name prefix value but the parameter it points to is invalid. There is not such parameter called ""`
      )
    parsedEnvironment[spec.name.canonical] = {
      spec,
      arg: item.arg,
      negated,
      given: item.given,
    }
  }

  // dump({ parsedEnvironment })

  //
  /**
   * Now iterate through the environment for prefix-less names.
   * If we have default prefixless then we need to look at the parameter specs
   * for which names to look for. On the other hand when there are selective
   * prefixless then we can rely on the names of the selection.
   *
   * When iterating over the param specs, we don't want to consider any that have
   * selective config for prefix. Since those are names that have different prefix
   * configuration and not subject to the default prefixless configuration.
   */
  const prefixlessParamEnvConfigs =
    params.settings.parameters.environment.$default.prefix.length === 0
      ? null
      : paramEnvConfigs.filter(
          (paramEnvConfig) =>
            paramEnvConfig.config.prefix !== undefined && paramEnvConfig.config.prefix.length === 0
        )

  // dump({ prefixlessParamEnvConfigs })
  if (prefixlessParamEnvConfigs) {
    for (const paramEnvConfig of prefixlessParamEnvConfigs) {
      const arg = params.environment[snakecase(paramEnvConfig.name)]
      if (arg !== undefined) {
        // eslint-disable-next-line
        const spec = params.parameterSpecs.find((spec) => spec.name.canonical === paramEnvConfig.name)!
        parsedEnvironment[paramEnvConfig.name] = {
          spec,
          arg,
          given: {
            name: paramEnvConfig.name,
            namePrefix: ``,
          },
          // todo
          negated: false,
        }
      }
    }
  } else {
    const paramSpecsThatHaveNoEnvPrefixConfig = params.parameterSpecs.filter(
      (spec) =>
        params.settings.parameters.environment[spec.name.canonical] === undefined ||
        //eslint-disable-next-line
        params.settings.parameters.environment[spec.name.canonical]!.prefix === undefined
    )
    for (const spec of paramSpecsThatHaveNoEnvPrefixConfig) {
      // todo look up all names
      const arg = params.environment[snakecase(spec.name.canonical)]
      if (arg !== undefined) {
        // eslint-disable-next-line
        // const spec = params.parameterSpecs.find((spec) => spec.name.canonical === paramEnvConfig.name)!
        parsedEnvironment[spec.name.canonical] = {
          spec,
          arg,
          given: {
            // todo look up all names
            name: spec.name.canonical,
            namePrefix: ``,
          },
          // todo
          negated: false,
        }
      }
    }
  }

  // dump({ parsedEnvironment })
  return parsedEnvironment
}

export const environmentValidate = (params: {
  parameterSpecs: ParameterSpec[]
  environment: RawEnvironment
  settings: Settings.Normalized
}) => {
  const { settings, parameterSpecs, environment } = params

  if (settings.parameters.environment.$default.prefix.length > 0) {
    const argsPassedVia = Object.entries(environment)
      .filter(([prefixedName]) => {
        return Boolean(
          settings.parameters.environment.$default.prefix.find((prefix) =>
            prefixedName.startsWith(prefix.toLowerCase())
          )
        )
      })
      .reduce((acc, [prefixedName, value]) => {
        // eslint-disable-next-line
        const prefix = settings.parameters.environment.$default.prefix.find((prefix) =>
          prefixedName.startsWith(prefix.toLowerCase())
        )!
        const envarName = prefixedName.replace(prefix.toLowerCase() + `_`, ``)
        const envarNameCamel = camelCase(envarName)
        const isUnknownName =
          parameterSpecs.find(
            (spec) =>
              spec.name.long === envarNameCamel ||
              spec.name.short === envarNameCamel ||
              Boolean(spec.name.aliases.long.find((_) => _ === envarNameCamel)) ||
              Boolean(spec.name.aliases.short.find((_) => _ === envarNameCamel))
          ) === undefined
        acc[envarName] = acc[envarName] ?? []
        // eslint-disable-next-line
        acc[envarName]!.push({ prefix, value, isUnknownName })
        return acc
      }, {} as Record<string, { prefix: string; value: string | undefined; isUnknownName: boolean }[]>)

    const argsPassedUnknown = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return Boolean(environmentVariables.find((envar) => envar.isUnknownName))
      })
      .map((entry): [string, { prefix: string; value: string | undefined }[]] => [
        entry[0],
        entry[1].map((envar) => ({ prefix: envar.prefix, value: envar.value })),
      ])
    if (argsPassedUnknown.length > 0) {
      throw new Error(
        `Environment variables appearing to be CLI parameter arguments were found but do not correspond to any actual parameters. This probably indicates a typo or some other kind of error: ${JSON.stringify(
          Object.fromEntries(argsPassedUnknown.sort().map((entry) => [entry[0], entry[1].sort()])),
          null,
          2
        )}`
      )
    }
    const argsPassedMultipleTimesViaDifferentEnvironmentVariables = Object.entries(argsPassedVia)
      .filter(([_name, environmentVariables]) => {
        return environmentVariables.length > 1
      })
      .map((entry): [string, { prefix: string; value: string | undefined }[]] => [
        entry[0],
        entry[1].map((envar) => ({ prefix: envar.prefix, value: envar.value })),
      ])
    if (argsPassedMultipleTimesViaDifferentEnvironmentVariables.length > 0) {
      const params = argsPassedMultipleTimesViaDifferentEnvironmentVariables
        .map((args) => `"${String(args[0])}"`)
        .join(`, `)
      throw new Error(
        `Parameter(s) ${params} received arguments multiple times via different environment variables: ${JSON.stringify(
          Object.fromEntries(
            argsPassedMultipleTimesViaDifferentEnvironmentVariables
              .sort()
              .map((entry) => [entry[0], entry[1].sort()])
          ),
          null,
          2
        )}`
      )
    }
  }
}
