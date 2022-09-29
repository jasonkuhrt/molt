import { defaultParameterNamePrefixes } from '../environment.js'
import { parseEnvironmentVariableBooleanOrThrow } from '../helpers.js'
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
    environment?:
      | boolean
      | ({
          [Key in keyof ParametersSchema]?: boolean | SettingInputEnvironmentParameter
        } & {
          $default: boolean | SettingInputEnvironmentParameter
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
          for (const [parameterName, spec] of Object.entries(input.parameters.environment)) {
            let spec_ = normalized.parameters.environment[parameterName]
            if (!spec_) {
              spec_ = {}
              normalized.parameters.environment[parameterName] = spec_
            }
            if (typeof spec === `boolean`) {
              spec_.enabled = spec
            } else {
              if (spec.enabled !== undefined) {
                spec_.enabled = spec.enabled
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
