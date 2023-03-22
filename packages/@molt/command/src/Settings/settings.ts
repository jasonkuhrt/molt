import { defaultParameterNamePrefixes } from '../Args/Environment/Environment.js'
import type { State } from '../Builder/State.js'
import type { Errors } from '../Errors/index.js'
import { parseEnvironmentVariableBooleanOrThrow } from '../helpers.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { FlagName } from '@molt/types'
import snakeCase from 'lodash.snakecase'

export type OnErrorReaction = 'exit' | 'throw'

type PromptConditional = (context: {
  parameter: ParameterSpec.Output.Union | ParameterSpec.Output.Basic | ParameterSpec.Output.ExclusiveGroup
  error: null | Errors.ErrorInvalidArgument | Errors.ErrorMissingArgument
  argument: undefined | ParameterSpec.ArgumentValue
}) => boolean

interface PromptConditionalDefaults {
  when: PromptConditional
  enabled: boolean
}

interface PromptConstantDefaults {
  enabled: boolean
}

export type InputDefaultsPrompt =
  | PromptConditionalDefaults
  | PromptConstantDefaults
  | PromptConditionalDefaults[]
  | [...PromptConditionalDefaults[]]
  | [...PromptConditionalDefaults[], PromptConstantDefaults]

// eslint-disable-next-line
export interface Input<ParametersObject extends State.ParametersSchemaObjectBase = {}> {
  description?: string
  help?: boolean
  helpOnNoArguments?: boolean
  helpOnError?: boolean
  helpRendering?: {
    union?: {
      mode?: 'expandAlways' | 'expandOnParameterDescription'
    }
  }
  onError?: OnErrorReaction
  onOutput?: (output: string, defaultHandler: (output: string) => void) => void
  defaults?: {
    prompt?: InputDefaultsPrompt
  }
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

export interface Output {
  description?: string | undefined
  help: boolean
  helpOnNoArguments: boolean
  helpOnError: boolean
  helpRendering: {
    union: {
      mode: 'expandAlways' | 'expandOnParameterDescription'
    }
  }
  onError: OnErrorReaction
  onOutput: (output: string) => void
  parameters: {
    environment: Record<string, SettingNormalizedEnvironmentParameter> & {
      $default: SettingNormalizedEnvironmentParameterDefault
    }
  }
  defaults: {
    prompt: {
      conditional: {
        when: PromptConditional
        enabled: boolean
      }[]
      constant: {
        enabled: boolean
      }
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

interface Environment {
  cli_settings_read_arguments_from_environment?: string | undefined
  [name: string]: string | undefined
}

// eslint-disable-next-line
export const change = (current: Output, input: Input<{}>, environment: Environment): void => {
  if (input.defaults?.prompt) {
    const prompt = Array.isArray(input.defaults.prompt) ? input.defaults.prompt : [input.defaults.prompt]

    const conditionalFilters = prompt.filter((_): _ is PromptConditionalDefaults => `when` in _)
    current.defaults.prompt.conditional = conditionalFilters

    const constantFilters = prompt.filter((_): _ is PromptConstantDefaults => !(`when` in _))
    const constantFilter = constantFilters[0] ?? null

    if (constantFilter) {
      current.defaults.prompt.constant = constantFilter
    }
  }

  current.onError = input.onError ?? current.onError

  current.description = input.description ?? current.description

  current.helpOnNoArguments = input.helpOnNoArguments ?? current.helpOnNoArguments

  current.helpOnError = input.helpOnError ?? current.helpOnError

  current.helpRendering = {
    union: {
      ...current.helpRendering.union,
      ...input.helpRendering?.union,
    },
  }

  current.onOutput = input.onOutput
    ? (_) => {
        input.onOutput!(_, process.stdout.write.bind(process.stdout))
      }
    : current.onOutput

  if (input.parameters !== undefined) {
    if (input.help) {
      current.help = input.help
    }

    // Handle environment
    if (input.parameters.environment !== undefined) {
      const explicitGlobalToggle = environment.cli_settings_read_arguments_from_environment
        ? parseEnvironmentVariableBooleanOrThrow(environment.cli_settings_read_arguments_from_environment)
        : null

      if (explicitGlobalToggle === false) {
        current.parameters.environment.$default.enabled = false
      } else {
        if (typeof input.parameters.environment === `boolean`) {
          current.parameters.environment.$default.enabled = input.parameters.environment
        } else {
          // As soon as the settings begin to specify explicit parameter settings
          // AND there is NO explicit default toggle setting, then we disable all the rest by default.
          // prettier-ignore
          if (
            input.parameters.environment.$default === undefined ||
            typeof input.parameters.environment.$default !== `boolean` && input.parameters.environment.$default.enabled === undefined
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

export const getDefaults = (lowercaseEnv: NodeJS.ProcessEnv): Output => {
  return {
    defaults: {
      prompt: {
        conditional: [],
        constant: {
          enabled: false,
        },
      },
    },
    help: true,
    helpOnNoArguments: true,
    helpOnError: true,
    helpRendering: {
      union: {
        mode: `expandOnParameterDescription`,
      },
    },
    onError: `exit`,
    onOutput: (_) => process.stdout.write(_),
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
