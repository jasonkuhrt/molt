import { defaultParameterNamePrefixes } from '../environment.js'
import { parseEnvironmentVariableBooleanOrThrow } from '../helpers.js'
import type { FlagSpecExpressionParseResultToPropertyName } from '../types.js'
import type { FlagName } from '@molt/types'
import type { z } from 'zod'

export interface Normalized {
  description?: string
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

interface SettingNormalizedEnvironmentParameter {
  enabled?: boolean
  prefix?: string[]
}

interface SettingInputEnvironmentParameter {
  enabled?: boolean
  prefix?: null | string | string[]
}

export interface Input<ParametersSchema extends z.ZodRawShape> {
  description?: string
  parameters?: {
    // prettier-ignore
    environment?:
      | boolean
      | ({
          [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]?: boolean | SettingInputEnvironmentParameter
        } & {
          $default?: boolean | SettingInputEnvironmentParameter
        })
  }
}

export const change = (normalized: Normalized, input: Input<{}>): void => {
  {
    normalized.description = input.description ?? normalized.description

    if (input.parameters !== undefined) {
      if (input.parameters.environment !== undefined) {
        if (typeof input.parameters.environment === `boolean`) {
          normalized.parameters.environment.$default.enabled = input.parameters.environment
        } else {
          // As soon as the settings begin to specify explicit parameter settings then we disable all the rest by default.
          normalized.parameters.environment.$default.enabled =
            Object.keys(input.parameters.environment).filter((k) => k !== `$default`).length === 0

          for (const [parameterName, spec] of Object.entries(input.parameters.environment)) {
            let spec_ = normalized.parameters.environment[parameterName]
            if (!spec_) {
              spec_ = {}
              normalized.parameters.environment[parameterName] = spec_
            }
            if (typeof spec === `boolean`) {
              spec_.enabled = spec
            } else {
              if (parameterName === `$default`) {
                if (spec.enabled !== undefined) {
                  spec_.enabled = spec.enabled
                }
              } else {
                spec_.enabled = spec.enabled ?? true
              }
              if (spec.prefix !== undefined) {
                if (spec.prefix === null) {
                  spec_.prefix = []
                } else if (typeof spec.prefix === `string`) {
                  spec_.prefix = [spec.prefix]
                } else {
                  spec_.prefix = spec.prefix
                }
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
