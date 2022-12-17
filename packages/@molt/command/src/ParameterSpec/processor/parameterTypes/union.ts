import type { Settings } from '../../../index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeUnion } from '../helpers/zod.js'

export const processUnion = (
  nameExpression: string,
  input: Input.Union,
  settings: Settings.Output
): Output.Union => {
  const name = processName(nameExpression)
  const zodAnalysis = analyzeUnion(input)
  const environment = processEnvironment(settings, name)
  const parameter: Output.Union = {
    _tag: `Union`,
    name,
    description: input.description ?? null,
    optionality: zodAnalysis.defaultGetter
      ? { _tag: `default`, getValue: () => zodAnalysis.defaultGetter!() }
      : zodAnalysis.isOptional
      ? { _tag: `optional` }
      : { _tag: `required` },
    environment,
    types: zodAnalysis.types,
  }
  return parameter
}
