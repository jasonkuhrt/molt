import type { State } from '../../../builders/State.js'
import type { Settings } from '../../../index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import { processEnvironment } from '../helpers/environment.js'
import { Name } from '@molt/types'

export const processBasic = (
  expression: string,
  input: Input.Basic<State.BaseEmpty>,
  settings: Settings.Output,
): Output.Basic => {
  const name = Name.parse(expression)
  const environment = processEnvironment(settings, name)
  const parameter = {
    _tag: `Basic`,
    environment,
    name,
    prompt: {
      enabled:
        input.prompt === true
          ? true
          : input.prompt === false
          ? false
          : input.prompt === null
          ? null
          : input.prompt.enabled ?? null,
      when:
        input.prompt === null ? null : typeof input.prompt === `object` ? input.prompt.when ?? null : null,
    },
    type: input.type,
  } satisfies Output.Basic

  return parameter
}
