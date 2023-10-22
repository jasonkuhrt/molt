import type { Settings } from '../../../index.js'
import type { Pam } from '../../../lib/Pam/index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import { processEnvironment } from '../environment.js'
import { parseExpression } from '../../../Parameter/name/name.js'

export const processBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Output,
): Output.Basic => {
  const name = parseExpression(expression)
  const environment = processEnvironment(settings, name)
  const parameter = {
    _tag: `Basic`,
    description: input.description ?? null,
    type: input.type,
    environment,
    optionality: input.name,
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
  } satisfies Output.Basic

  return parameter
}

type DefaultGetter = () => Pam.Value
