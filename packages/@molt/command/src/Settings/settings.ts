import { defaultParameterNamePrefixes } from '../Args/Environment/Environment.js'
import type { State } from '../Builder/State.js'
import { parseEnvironmentVariableBooleanOrThrow } from '../helpers.js'
import type { FlagName } from '@molt/types'
import snakeCase from 'lodash.snakecase'

export type OnErrorReaction = 'exit' | 'throw'

// eslint-disable-next-line
export interface Input<ParametersObject extends State.ParametersObjectBase = {}> {
  description?: string
  help?: boolean
  helpOnNoArguments?: boolean
  helpOnError?: boolean
  onError?: OnErrorReaction
  parameters?: {
    // prettier-ignore
    environment?:
      | boolean
      | ({
          [FlagSpecExpression in keyof ParametersObject as FlagName.Data.GetCanonicalNameOrErrorFromParseResult<FlagName.Parse<FlagSpecExpression & string>>]?: boolean | SettingInputEnvironmentParameter
        } & {
          $default?: boolean | SettingInputEnvironmentParameter
        })
  }
}

export interface Normalized {
  description?: string | undefined
  help: boolean
  helpOnNoArguments: boolean
  helpOnError: boolean
  onError: OnErrorReaction
  parameters: {
    environment: Record<string, SettingNormalizedEnvironmentParameter> & {
      $default: SettingNormalizedEnvironmentParameterDefault
    }
  }
}

interface SettingNormalizedEnvironmentParameterDefault {
  enabled: boolean
  prefix: string[]
}

export interface SettingNormalizedEnvironmentParameter {
  enabled?: boolean
  prefix?: string[]
}

interface SettingInputEnvironmentParameter {
  enabled?: boolean
  prefix?: boolean | string | string[]
}

// eslint-disable-next-line
export const change = (current: Normalized, input: Input<{}>): void => {
  current.onError = input.onError ?? current.onError

  current.description = input.description ?? current.description

  current.helpOnNoArguments = input.helpOnNoArguments ?? current.helpOnNoArguments

  current.helpOnError = input.helpOnError ?? current.helpOnError

  if (input.parameters !== undefined) {
    if (input.help) {
      current.help = input.help
    }
    if (input.parameters.environment !== undefined) {
      // Handle environment
      if (typeof input.parameters.environment === `boolean`) {
        current.parameters.environment.$default.enabled = input.parameters.environment
      } else {
        // As soon as the settings begin to specify explicit parameter settings
        // AND there is NO explicit default toggle setting, then we disable all the rest by default.
        // prettier-ignore
        if (
          input.parameters.environment.$default === undefined ||
          typeof input.parameters.environment.$default !== 'boolean' && input.parameters.environment.$default.enabled === undefined
        ) {
          const parameterEnvironmentSpecs = Object.keys(input.parameters.environment).filter((k) => k !== `$default`)
          current.parameters.environment.$default.enabled = parameterEnvironmentSpecs.length === 0
        }

        for (const [parameterName, spec] of Object.entries(input.parameters.environment)) {
          let spec_ = current.parameters.environment[parameterName]
          if (!spec_) {
            spec_ = {}
            current.parameters.environment[parameterName] = spec_
          }
          if (typeof spec === `boolean`) {
            spec_.enabled = spec
          } else {
            // Handle enabled
            if (parameterName === `$default`) {
              if (spec.enabled !== undefined) {
                spec_.enabled = spec.enabled
              }
            } else {
              spec_.enabled = spec.enabled ?? true
            }
            // Handle prefix
            if (spec.prefix !== undefined) {
              if (spec.prefix === false) {
                spec_.prefix = []
              } else if (spec.prefix === true) {
                spec_.prefix = defaultParameterNamePrefixes
              } else if (typeof spec.prefix === `string`) {
                spec_.prefix = [snakeCase(spec.prefix).toLowerCase()]
              } else {
                spec_.prefix = spec.prefix.map((prefix) => snakeCase(prefix).toLowerCase())
              }
            }
          }
        }
      }
    }
  }
}

const isEnvironmentEnabled = (lowercaseEnv: NodeJS.ProcessEnv) => {
  return lowercaseEnv[`cli_settings_read_arguments_from_environment`]
    ? //eslint-disable-next-line
      parseEnvironmentVariableBooleanOrThrow(lowercaseEnv[`cli_settings_read_arguments_from_environment`]!)
    : // : processEnvLowerCase[`cli_environment_arguments`]
      // ? //eslint-disable-next-line
      //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_environment_arguments`]!)
      // : processEnvLowerCase[`cli_env_args`]
      // ? //eslint-disable-next-line
      //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_args`]!)
      // : processEnvLowerCase[`cli_env_arguments`]
      // ? //eslint-disable-next-line
      //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_arguments`]!)
      true
}

export const getDefaults = (lowercaseEnv: NodeJS.ProcessEnv): Normalized => {
  return {
    help: true,
    helpOnNoArguments: true,
    helpOnError: true,
    onError: `exit`,
    parameters: {
      environment: {
        $default: {
          enabled: isEnvironmentEnabled(lowercaseEnv),
          prefix: defaultParameterNamePrefixes,
        },
      },
    },
  }
}
