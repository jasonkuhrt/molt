import snakeCase from 'lodash.snakecase'
import type { BuilderCommandState } from '../builders/command/state.js'
import type { EventPatternsInput, EventPatternsInputAtLeastOne } from '../eventPatterns.js'
import { eventPatterns } from '../eventPatterns.js'
import type { Values } from '../helpers.js'
import { parseEnvironmentVariableBooleanOrThrow } from '../helpers.js'
import { defaultParameterNamePrefixes } from '../OpeningArgs/Environment/Environment.js'
import type { Type } from '../Type/index.js'

export type OnErrorReaction = 'exit' | 'throw'

export type PromptInput<T extends Type.Type> =
  | boolean
  | {
    enabled?: boolean
    when?: EventPatternsInputAtLeastOne<T>
  }

// eslint-disable-next-line
export interface Input<$State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty> {
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
  prompt?: PromptInput<Values<BuilderCommandState.ToTypes<$State>>>
  parameters?: {
    environment?:
      | boolean
      | (
        & {
          [
            NameExpression
              in keyof $State['Parameters'] as $State['Parameters'][NameExpression]['NameParsed']['canonical']
          ]?: boolean | SettingInputEnvironmentParameter
        }
        & {
          $default?: boolean | SettingInputEnvironmentParameter
        }
      )
  }
}

export interface Output {
  typeMapper: (value: unknown) => Type.Type
  prompt: {
    enabled: boolean
    when: EventPatternsInput<Type.Type>
  }
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
export const change = (
  current: Output,
  input: Input<BuilderCommandState.BaseEmpty>,
  environment: Environment,
): void => {
  if (input.prompt !== undefined) {
    if (typeof input.prompt === `boolean`) {
      current.prompt.enabled = input.prompt
    } else {
      if (input.prompt.enabled !== undefined) current.prompt.enabled = input.prompt.enabled
      if (input.prompt.when !== undefined) {
        // @ts-expect-error fixme
        current.prompt.when = input.prompt.when
        // Passing object makes enabled default to true
        if (input.prompt.enabled === undefined) current.prompt.enabled = true
      }
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

          if (
            input.parameters.environment.$default === undefined
            || typeof input.parameters.environment.$default !== `boolean`
              && input.parameters.environment.$default.enabled === undefined
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
    // eslint-disable-next-line
    ? parseEnvironmentVariableBooleanOrThrow(lowercaseEnv[`cli_settings_read_arguments_from_environment`]!)
    // : processEnvLowerCase[`cli_environment_arguments`]
    // ? //eslint-disable-next-line
    //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_environment_arguments`]!)
    // : processEnvLowerCase[`cli_env_args`]
    // ? //eslint-disable-next-line
    //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_args`]!)
    // : processEnvLowerCase[`cli_env_arguments`]
    // ? //eslint-disable-next-line
    //   parseEnvironmentVariableBoolean(processEnvLowerCase[`cli_env_arguments`]!)
    : true
}

export const getDefaults = (lowercaseEnv: NodeJS.ProcessEnv): Output => {
  return {
    typeMapper: (t) => t as any,
    prompt: {
      enabled: false,
      when: eventPatterns.rejectedMissingOrInvalid,
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
