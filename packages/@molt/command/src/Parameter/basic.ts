import { Name } from '@molt/types'
import type { BuilderCommandState } from '../builders/command/state.js'
import type { HKT } from '../helpers.js'
import type { Pam } from '../lib/Pam/index.js'
import type { Settings } from '../Settings/index.js'
import type { Optionality } from '../Type/Type.js'
import { processEnvironment } from './helpers/environment.js'
import type { Environment, Prompt } from './helpers/types.js'

export interface ParameterBasicInput<
  $State extends BuilderCommandState.Base = BuilderCommandState.BaseEmpty,
> {
  _tag: 'Basic'
  nameExpression: string
  type: $State['Type']
  prompt: Prompt<HKT.Call<$State['TypeMapper'], $State['Type']>>
}

export interface ParameterBasic extends Omit<Pam.Parameter, '_tag'> {
  _tag: 'Basic'
  environment: Environment
  prompt: Prompt
}

export const parameterBasicCreate = (
  input: ParameterBasicInput,
  settings: Settings.Output,
): ParameterBasic => {
  const name = Name.parse(input.nameExpression)
  const environment = processEnvironment(settings, name)
  const prompt = input.prompt as boolean | null | { enabled?: boolean; when?: object } // eslint-disable-line
  const promptEnabled = prompt === true
    ? true
    : prompt === false
    ? false
    : prompt === null
    ? null
    : prompt.enabled ?? null
  const promptEnabledWhen = prompt === null ? null : typeof prompt === `object` ? prompt.when ?? null : null
  return {
    _tag: `Basic`,
    environment,
    name,
    prompt: {
      enabled: promptEnabled,
      when: promptEnabledWhen as any, // eslint-disable-line
    },
    type: input.type,
  }
}

export type ParameterBasicData = Omit<ParameterBasic, '_tag'> & {
  _tag: 'BasicData'
  optionality: Optionality['_tag']
}
