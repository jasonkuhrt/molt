import type { Settings } from '../../../index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeBasic } from '../helpers/zod.js'

export const processBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Output
): Output.Basic => {
  const name = processName(expression)
  const zodAnalysis = analyzeBasic(input)
  const environment = processEnvironment(settings, name)
  const parameter = {
    _tag: `Basic`,
    type: input.type,
    description: zodAnalysis.description,
    typePrimitiveKind: zodAnalysis.primitiveKind,
    optionality: zodAnalysis.defaultGetter
      ? { _tag: `default`, getValue: () => zodAnalysis.defaultGetter!() }
      : zodAnalysis.isOptional
      ? { _tag: `optional` }
      : { _tag: `required` },
    environment,
    name,
  } satisfies Output.Basic

  return parameter
}
